<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TowerImpediment extends Model
{
    use HasFactory;

    protected $table = 'towerimpediment';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at', 'StatusDate'];
    protected $fillable = [
        'ProjectName',
        'Number',
        'ImpedimentType',
        'Status',
        'StatusDate'
    ];
}
