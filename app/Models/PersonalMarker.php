<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalMarker extends Model
{
    use HasFactory;

    protected $table = 'personal_marker';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'name',
        'coordinateX',
        'coordinateY',
        'zone',
        'type',
        'icon'
    ];
}
