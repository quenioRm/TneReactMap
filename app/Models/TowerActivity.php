<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Marker;

class TowerActivity extends Model
{
    use HasFactory;

    protected $table = 'tower_activities';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = ['ProjectName', 'Number', 'Activitie', 'ConclusionDate'];

    public function tower()
    {
        return $this->belongsTo(Tower::class, 'ProjectName', 'ProjectName')
                    ->where('Number', $this->Number);
    }

    public static function CaclPercentageIsExecuted($tower, $project)
    {
        $activities = Marker::get();

        $avcAcum = 0;
        $activitieStatus = "";
        $activityAvc = 0;

        foreach ($activities as $key => $activity) {
            $checkDate = self::where('Activitie', $activity->atividade)
                ->where('ProjectName', $project)->where('Number', $tower)->value('ConclusionDate');

            if(!is_null($checkDate)){
                if($activitieStatus == null){
                    $avcAcum += $activityAvc;
                }
                $avcAcum += $activity->lenPercent;
            }

            $activitieStatus = $checkDate;
            $activityAvc = $activity->lenPercent;
        }

        return $avcAcum;
    }
}
