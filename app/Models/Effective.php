<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Effective extends Model
{
    use HasFactory;

    protected $table = 'effective';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'activity',
        'business',
        'direct',
        'indirect',
        'machinescount',
    ];
}
