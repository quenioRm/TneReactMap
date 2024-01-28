<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TowerImpediment extends Model
{
    use HasFactory;

    protected $table = 'tower_impediments';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at', 'StatusDate'];
    protected $fillable = [
        'ProjectName',
        'Number',
        'ImpedimentType',
        'Status',
        'StatusDate'
    ];

    public static function GetImpediments($projectName, $number)
    {
        return self::where('ProjectName', $projectName)->where('Number', $number)->get();
    }

    public function markerConfigImpediment()
    {
        return $this->hasOne(MarkerConfigImpediment::class, 'ImpedimentType', 'ImpedimentType');
    }

    public function markerConfigImpediments()
    {
        return $this->hasMany(MarkerConfigImpediment::class, 'ImpedimentType', 'ImpedimentType');
    }

    public function tower()
    {
        return $this->belongsTo(Tower::class, 'Number', 'Number');
    }

}
