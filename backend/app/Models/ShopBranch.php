<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class ShopBranch extends Model {
    use SoftDeletes;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id','shop_id','name_ar','name_en','phone','country_id','city_id','city','address','latitude','longitude','opening_hours','status','is_main'];
    protected $casts = ['opening_hours' => 'array', 'is_main' => 'boolean'];
    public function shop() { return $this->belongsTo(Shop::class, 'shop_id', 'id'); }
}
