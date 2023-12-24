<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Helpers\CoordinateHelper;

class MapsController extends Controller
{
    public function getCoordinates()
    {
        $jsonFilePointList = storage_path('app/towerlist.json'); // Adjust the path accordingly
        if (File::exists($jsonFilePointList)) {

            $initialMarkers;

            $listOfMarkers = json_decode(File::get($jsonFilePointList), true);

            foreach ($listOfMarkers as $markerData) {

                $x = (float)$markerData['CoordinateX'];
                $y = (float)$markerData['CoordinateY'];
                $zone = (float)$markerData['Zone'];

                $latlng = null;

                if($zone < 0){
                    $latlng = CoordinateHelper::utm2ll($x,$y,$zone * -1,false);
                }

                if($zone > 0){
                    $latlng = CoordinateHelper::utm2ll(831737.963,9677172.421,20,true);
                }

                $newCoordinates = json_decode($latlng, true);

                $initialMarkers[] = [
                    'position' => [
                        'lat' => $newCoordinates['attr']['lat'],
                        'lng' => $newCoordinates['attr']['lon'],
                        'utmx' => $markerData['CoordinateX'],
                        'utmy' => $markerData['CoordinateY']
                    ],
                    'label' => [
                        'color' =>'white',
                        'text' => $markerData['Number'] . " - " . $markerData['Name'],
                    ],
                    'draggable' => true,
                ];
            }

            return response()->json($initialMarkers);
        }
    }
}
