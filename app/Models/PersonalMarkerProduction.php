<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalMarkerProduction extends Model
{
    use HasFactory;

    protected $table = 'personal_markers_production';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'name',
        'activity',
        'conclusionDate',
        'count'
    ];
}
