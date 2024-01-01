<?php

namespace App\Helpers;
use Illuminate\Support\Facades\File;

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
}
