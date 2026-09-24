<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVehicleCompatibility;
use App\Models\Inventory;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Public search & filter products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::where('status', 'ACTIVE')
            ->whereHas('shop', function ($q) {
                $q->where('status', 'ACTIVE');
            })
            ->with(['shop:id,name_ar,name_en,rating,city', 'category:id,name_ar,name_en,slug', 'manufacturer:id,name_ar,name_en,logo_url', 'images']);

        // Filter by keyword (name, part_number, oem_number)
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'ilike', "%{$search}%")
                  ->orWhere('name_en', 'ilike', "%{$search}%")
                  ->orWhere('part_number', 'ilike', "%{$search}%")
                  ->orWhere('oem_number', 'ilike', "%{$search}%")
                  ->orWhere('barcode', $search);
            });
        }

        // Filter by Category
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by Manufacturer
        if ($manufacturerId = $request->query('manufacturer_id')) {
            $query->where('manufacturer_id', $manufacturerId);
        }

        // Filter by Condition (NEW, OEM, AFTERMARKET, USED)
        if ($condition = $request->query('condition')) {
            $query->where('condition', $condition);
        }

        // Filter by Price range
        if ($minPrice = $request->query('min_price')) {
            $query->where('price', '>=', (float) $minPrice);
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // Filter by Vehicle Compatibility (make, model, year)
        if ($make = $request->query('vehicle_make')) {
            $model = $request->query('vehicle_model');
            $year = $request->query('vehicle_year');

            $query->whereHas('compatibilities', function ($cq) use ($make, $model, $year) {
                $cq->where('make', 'ilike', "%{$make}%");
                if ($model) {
                    $cq->where('model', 'ilike', "%{$model}%");
                }
                if ($year) {
                    $cq->where(function ($yq) use ($year) {
                        $yq->where(function ($sub) use ($year) {
                            $sub->where('year_start', '<=', (int)$year)
                                ->where(function ($endQ) use ($year) {
                                    $endQ->whereNull('year_end')->orWhere('year_end', '>=', (int)$year);
                                });
                        })->orWhereNull('year_start');
                    });
                }
            });
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'popular':
                $query->orderBy('view_count', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $perPage = min((int)$request->query('per_page', 20), 50);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Public show single product.
     */
    public function show($id): JsonResponse
    {
        $product = Product::where('status', 'ACTIVE')
            ->with([
                'shop:id,name_ar,name_en,phone,whatsapp,city,rating,rating_count,logo_url',
                'category:id,name_ar,name_en,slug',
                'manufacturer:id,name_ar,name_en,logo_url,country_of_origin',
                'images',
                'compatibilities',
                'inventories.branch'
            ])
            ->findOrFail($id);

        // Increment view count asynchronously
        $product->increment('view_count');

        return response()->json(['data' => $product]);
    }

    /**
     * Public products by shop ID.
     */
    public function byShop($shopId, Request $request): JsonResponse
    {
        $products = Product::where('shop_id', $shopId)
            ->where('status', 'ACTIVE')
            ->with(['category:id,name_ar,name_en', 'manufacturer:id,name_ar,name_en', 'images'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    /**
     * Shop Owner: Get my shop products with inventory.
     */
    public function shopProducts(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->first();

        if (!$shop) {
            return response()->json(['error' => 'Not Found', 'message' => 'Shop not found for this user.'], 404);
        }

        $query = Product::where('shop_id', $shop->id)
            ->with(['category:id,name_ar,name_en', 'manufacturer:id,name_ar,name_en', 'images', 'inventories']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'ilike', "%{$search}%")
                  ->orWhere('name_en', 'ilike', "%{$search}%")
                  ->orWhere('part_number', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(25);

        return response()->json($products);
    }

    /**
     * Shop Owner: Get single product for editing.
     */
    public function shopProduct($id, Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->first();

        if (!$shop) {
            return response()->json(['error' => 'Forbidden', 'message' => 'No shop associated with user.'], 403);
        }

        $product = Product::where('shop_id', $shop->id)
            ->with(['category', 'manufacturer', 'images', 'compatibilities', 'inventories'])
            ->findOrFail($id);

        return response()->json(['data' => $product]);
    }

    /**
     * Shop Owner: Create new product.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->first();

        if (!$shop) {
            return response()->json(['error' => 'Forbidden', 'message' => 'User does not own a shop.'], 403);
        }

        $validated = $request->validate([
            'name_ar' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'part_number' => 'nullable|string|max:100',
            'oem_number' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:categories,id',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'condition' => 'required|in:NEW,OEM,AFTERMARKET,USED,REFURBISHED',
            'price_visibility' => 'required|in:SHOW_PRICE,HIDE_PRICE,CONTACT_ONLY',
            'purchase_method' => 'required|in:DIRECT,REQUEST,WHATSAPP',
            'price' => 'nullable|numeric|min:0',
            'currency_code' => 'nullable|string|max:8',
            'status' => 'nullable|in:ACTIVE,INACTIVE,OUT_OF_STOCK',
            'initial_quantity' => 'nullable|integer|min:0',
            'compatibilities' => 'nullable|array',
            'compatibilities.*.make' => 'required_with:compatibilities|string',
            'compatibilities.*.model' => 'nullable|string',
            'compatibilities.*.year_start' => 'nullable|integer',
            'compatibilities.*.year_end' => 'nullable|integer',
            'images' => 'nullable|array',
        ]);

        $productId = 'prod_' . Str::random(16);

        $product = Product::create([
            'id' => $productId,
            'shop_id' => $shop->id,
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'],
            'part_number' => $validated['part_number'] ?? null,
            'oem_number' => $validated['oem_number'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'manufacturer_id' => $validated['manufacturer_id'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'condition' => $validated['condition'],
            'price_visibility' => $validated['price_visibility'],
            'purchase_method' => $validated['purchase_method'],
            'price' => $validated['price'] ?? 0,
            'currency_code' => $validated['currency_code'] ?? 'USD',
            'status' => $validated['status'] ?? 'ACTIVE',
        ]);

        // Create default inventory
        $qty = $request->input('initial_quantity', 0);
        Inventory::create([
            'product_id' => $product->id,
            'shop_id' => $shop->id,
            'quantity' => $qty,
            'low_stock_threshold' => 5,
            'track_quantity' => true,
        ]);

        // Add vehicle compatibilities
        if (!empty($validated['compatibilities'])) {
            foreach ($validated['compatibilities'] as $comp) {
                ProductVehicleCompatibility::create([
                    'product_id' => $product->id,
                    'make' => $comp['make'],
                    'model' => $comp['model'] ?? null,
                    'year_start' => $comp['year_start'] ?? null,
                    'year_end' => $comp['year_end'] ?? null,
                ]);
            }
        }

        // Add images if provided
        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $index => $img) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => is_string($img) ? $img : ($img['image_url'] ?? ''),
                    'thumbnail_url' => is_array($img) ? ($img['thumbnail_url'] ?? null) : null,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product->load(['category', 'manufacturer', 'images', 'compatibilities', 'inventories']),
        ], 201);
    }

    /**
     * Shop Owner: Update product.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->first();

        if (!$shop) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:200',
            'name_en' => 'sometimes|string|max:200',
            'part_number' => 'nullable|string|max:100',
            'oem_number' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:categories,id',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'condition' => 'sometimes|in:NEW,OEM,AFTERMARKET,USED,REFURBISHED',
            'price_visibility' => 'sometimes|in:SHOW_PRICE,HIDE_PRICE,CONTACT_ONLY',
            'purchase_method' => 'sometimes|in:DIRECT,REQUEST,WHATSAPP',
            'price' => 'nullable|numeric|min:0',
            'currency_code' => 'nullable|string|max:8',
            'status' => 'sometimes|in:ACTIVE,INACTIVE,OUT_OF_STOCK',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->fresh()->load(['category', 'manufacturer', 'images', 'compatibilities', 'inventories']),
        ]);
    }

    /**
     * Shop Owner: Delete product.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->first();

        if (!$shop) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Shop Owner: Upload product images.
     */
    public function uploadImages(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->first();

        if (!$shop) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);

        $request->validate([
            'images' => 'required|array',
            'images.*.image_url' => 'required|string',
        ]);

        $created = [];
        foreach ($request->input('images') as $idx => $img) {
            $created[] = ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $img['image_url'],
                'thumbnail_url' => $img['thumbnail_url'] ?? null,
                'is_primary' => $idx === 0 && ProductImage::where('product_id', $product->id)->count() === 0,
                'sort_order' => $idx,
            ]);
        }

        return response()->json([
            'message' => 'Images added successfully',
            'data' => $created,
        ]);
    }
}
