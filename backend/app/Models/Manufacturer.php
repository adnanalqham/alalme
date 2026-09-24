<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Manufacturer extends Model { protected $fillable = ['name_ar','name_en','slug','logo_url','country_of_origin','is_active']; }
