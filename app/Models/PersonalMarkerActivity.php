<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalMarkerActivity extends Model
{
    use HasFactory;

    protected $table = 'personal_marker_activity';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'personalMarkerId',
        'activity',
        'unity',
        'previouscount',
        'lenPercent',
        'icon'
    ];
}
