<?php

namespace App\Helpers;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use App\Models\Marker;
use App\Models\TowerActivity;
use Illuminate\Support\Facades\Storage;

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

    // Obtenha a última atividade com data não nula
    $latestActivity = TowerActivity::where('Number', $tower)
        ->where('ProjectName', $project)
        ->whereNotNull('ConclusionDate')
        ->orderBy('ConclusionDate', 'asc')
        ->get();

    $returnItem = [];

    foreach ($latestActivity as $key => $item) {

        $icon = Marker::where('atividade', $item->Activitie)->value('icone');

        $carbonDate = Carbon::parse($item->ConclusionDate)->format('d/m/y');

        $iconUrl = ($icon !== null) ? asset(Storage::url($icon)) : asset('assets/images/marcador-de-localizacao.png');

        if($item->ConclusionDate !== null){
            $returnItem = [
                'activitie' => $item->Activitie,
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
}
