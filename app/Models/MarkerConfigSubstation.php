<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarkerConfigSubstation extends Model
{
    use HasFactory;

    protected $table = 'markerconfig_substation';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'activity',
        'unity',
        'icon',
        'lenPercent'
    ];
}
