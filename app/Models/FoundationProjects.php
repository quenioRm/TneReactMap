<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoundationProjects extends Model
{
    use HasFactory;

    protected $table = 'foundation_projects';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'code',
        'name',
        'description',
        'revision',
        'state',
    ];

}
