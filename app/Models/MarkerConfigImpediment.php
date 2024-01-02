<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarkerConfigImpediment extends Model
{
    use HasFactory;

    protected $table = 'markerconfigimpediment';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'ImpedimentType',
        'Status',
        'Icon',
        'IsBlocked',
    ];

    public function towerImpediment()
    {
        return $this->belongsTo(TowerImpediment::class, 'ImpedimentType', 'ImpedimentType');
    }
}
