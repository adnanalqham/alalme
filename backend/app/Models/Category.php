<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Category extends Model {
    protected $fillable = ['parent_id','name_ar','name_en','slug','icon_url','image_url','sort_order','is_active'];
    public function children() { return $this->hasMany(Category::class, 'parent_id'); }
    public function parent() { return $this->belongsTo(Category::class, 'parent_id'); }
}
