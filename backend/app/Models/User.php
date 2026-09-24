<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    protected $table = 'users';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'clerk_user_id',
        'email',
        'phone',
        'full_name',
        'avatar_url',
        'role',
        'status',
        'shop_id',
        'branch_id',
        'permissions',
        'country_id',
        'city_id',
        'city',
        'address',
    ];

    protected $casts = [
        'permissions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function getNameAttribute(): string
    {
        return $this->full_name ?? '';
    }

    /**
     * User's garage vehicles
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(UserVehicle::class, 'user_id', 'id');
    }

    /**
     * User's specific permission overrides (granted or denied)
     */
    public function userPermissions(): HasMany
    {
        return $this->hasMany(UserPermission::class, 'user_id', 'id');
    }

    /**
     * Role definition model
     */
    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role', 'name');
    }

    /**
     * Associated shop (if owner or employee)
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'shop_id', 'id');
    }

    /**
     * Determine if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is an Administrator
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['ADMIN', 'SUPER_ADMIN']);
    }

    /**
     * Check if user is a Super Administrator
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'SUPER_ADMIN';
    }

    /**
     * Check if user is a Shop Owner
     */
    public function isShopOwner(): bool
    {
        return in_array($this->role, ['SHOP_OWNER', 'SELLER']);
    }

    /**
     * Calculate and return effective permissions:
     * Effective = Role Permissions + Additional (Granted) Permissions - Denied Permissions
     */
    public function getEffectivePermissions(): array
    {
        if ($this->status === 'SUSPENDED') {
            return [];
        }

        // Super Admin has all active permissions
        if ($this->role === 'SUPER_ADMIN') {
            return Permission::pluck('name')->toArray();
        }

        // 1. Role base permissions
        $role = Role::where('name', $this->role)->with('permissions')->first();
        $rolePerms = $role ? $role->permissions->pluck('name')->toArray() : [];

        // 2. User-level overrides
        $overrides = UserPermission::where('user_id', $this->id)->with('permission')->get();

        $additional = [];
        $denied = [];

        foreach ($overrides as $ov) {
            if ($ov->permission) {
                if ($ov->is_granted) {
                    $additional[] = $ov->permission->name;
                } else {
                    $denied[] = $ov->permission->name;
                }
            }
        }

        // Also merge any JSON-cached permissions in $this->permissions
        if (is_array($this->permissions)) {
            $additional = array_merge($additional, $this->permissions);
        }

        // Effective = (Role + Additional) - Denied
        $merged = array_unique(array_merge($rolePerms, $additional));
        $effective = array_values(array_diff($merged, $denied));

        return $effective;
    }

    /**
     * Canonical normalize permission name (e.g. PRODUCTS_VIEW, products.view, products_view -> products.view)
     */
    public static function canonicalPermission(string $perm): string
    {
        return strtolower(str_replace(['_', '-'], '.', trim($perm)));
    }

    /**
     * Check if user has explicit or role-inherited permission
     */
    public function hasPermission(string $permission, ?string $scope = null): bool
    {
        if ($this->status === 'SUSPENDED') {
            return false;
        }

        if ($this->role === 'SUPER_ADMIN') {
            return true;
        }

        $effective = $this->getEffectivePermissions();
        $targetCanonical = self::canonicalPermission($permission);

        // Check canonical dot notation matching
        foreach ($effective as $p) {
            if (self::canonicalPermission($p) === $targetCanonical) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check permission using can() syntax
     */
    public function canAccess(string $permission): bool
    {
        return $this->hasPermission($permission);
    }
}
