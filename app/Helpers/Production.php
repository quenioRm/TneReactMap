<?php

namespace App\Helpers;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use App\Models\Marker;
use App\Models\TowerActivity;
use Illuminate\Support\Facades\Storage;
use App\Models\MarkerConfigImpediment;

class Production{

    public static function getLatestTowerProductionDate($tower, $project)
    {
        $jsonFilePointList = storage_path('app/production.json');

        if (File::exists($jsonFilePointList)) {
            $listOfTowerProds = json_decode(File::get($jsonFilePointList), true);

            $tower = str_replace('_', '/', $tower);

            foreach ($listOfTowerProds as $prod) {
                if ($prod['Number'] == $tower && $prod['ProjectName'] == $project) {
                    $latestDate = null;

                    foreach ($prod as $key => $value) {
                        if ($key === 'Number' || $key === 'ProjectName') {
                            continue;
                        }

                        if ($latestDate === null || strtotime($value) > strtotime($latestDate)) {
                            $latestDate = $value;
                        }
                    }

                    return ['latest_date' => $latestDate];
                }
            }

            return ['latest_date' => null];
        }

        return ['latest_date' => null];
    }

    public static function getLatestTowerActivityWithIcon($tower, $project)
    {
        $tower = str_replace('_', '/', $tower);

        $returnItem = [];

        $activitys = Marker::get();

        foreach ($activitys as $key => $activity) {

            $latestActivity = TowerActivity::where('Number', $tower)
                ->where('ProjectName', $project)
                ->where('Activitie', $activity->atividade)
                ->first();

            if($latestActivity->ConclusionDate != null){

                $icon = $activity->icone;

                $carbonDate = Carbon::parse($latestActivity->ConclusionDate)->format('d/m/y');

                $iconUrl = ($icon !== null) ? asset(Storage::url($icon)) : asset('assets/images/marcador-de-localizacao.png');

                $returnItem = [
                    'activitie' => $activity->atividade,
                    'date' => $carbonDate,
                    'icon' =>  $iconUrl
                ];

            }
        }

        if(empty($returnItem)){
            $returnItem = [
                'activitie' => null,
                'date' => null,
                'icon' =>  asset('assets/images/marcador-de-localizacao.png')
            ];
        }

        return $returnItem;
    }

    public static function GetIconFromLatestImpediment($impediments)
    {
        $returnItem = null;

        foreach ($impediments->toArray() as $impediment) {

            $impedimentType = MarkerConfigImpediment::where('ImpedimentType', $impediment['ImpedimentType'])
            ->where('Status', $impediment['Status'])->first();

            // dd($impediment, $impedimentType->toArray());

            if($impedimentType == null)
                return $returnItem;

            $iconUrl = ($impedimentType->Icon !== null) ? asset(Storage::url($impedimentType->Icon)) :
            asset('assets/images/marcador-de-localizacao.png');

            if($impedimentType->IsBlocked == "Sim"){
                return $returnItem = [
                    'impedimentType' => $impedimentType->ImpedimentType,
                    'status' => $impedimentType->Status,
                    'icon' =>  trim($iconUrl)
                ];
            }
        }

        return $returnItem;
    }

    public static function getLatestTowerActivityWithIcons($tower, $project)
    {
        $tower = str_replace('_', '/', $tower);

        $returnItem = [];

        $activitys = Marker::get();

        foreach ($activitys as $key => $activity) {

            $latestActivity = TowerActivity::where('Number', $tower)
                ->where('ProjectName', $project)
                ->where('Activitie', $activity->atividade)
                ->first();

            if($latestActivity->ConclusionDate != null){

                $icon = $activity->icone;

                $carbonDate = Carbon::parse($latestActivity->ConclusionDate)->format('d/m/y');

                $iconUrl = ($icon !== null) ? asset(Storage::url($icon)) : asset('assets/images/marcador-de-localizacao.png');

                $returnItem[] = [
                    'activitie' => $activity->atividade,
                    'date' => $carbonDate,
                    'icon' =>  $iconUrl
                ];

            }
        }

        if(empty($returnItem)){
            $returnItem = null;
        }

        return $returnItem;
    }

    public static function GetIconFromLatestImpedimentIcons($impediments)
    {
        $returnItem = null;

        foreach ($impediments->toArray() as $impediment) {

            $impedimentType = MarkerConfigImpediment::where('ImpedimentType', $impediment['ImpedimentType'])
            ->where('Status', $impediment['Status'])->first();

            if($impedimentType == null)
                return $returnItem;

            $iconUrl = ($impedimentType->Icon !== null) ? asset(Storage::url($impedimentType->Icon)) :
            asset('assets/images/marcador-de-localizacao.png');

            if($impedimentType->IsBlocked == "Sim"){
                $returnItem[] = [
                    'impedimentType' => $impedimentType->ImpedimentType,
                    'icon' =>  trim($iconUrl)
                ];
            }
        }

        if(empty($returnItem)){
            $returnItem = null;
        }

        return $returnItem;
    }
}
