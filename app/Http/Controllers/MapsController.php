<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Helpers\CoordinateHelper;
use Illuminate\Support\Facades\Storage;

class MapsController extends Controller
{
    public function getCoordinates()
    {
        $jsonFilePointList = storage_path('app/towerlist.json');
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
                    $latlng = CoordinateHelper::utm2ll($x,$y,$zone * 1,true);
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
                        'color' =>'blue',
                        'text' => $markerData['Number'] . " - " . $markerData['Name'],
                        'towerId' => str_replace('/', '_', $markerData['Number']),
                        'project' => $markerData['ProjectName'],
                    ],
                    'draggable' => true,
                ];
            }

            return response()->json($initialMarkers);
        }
    }

    public function getImagesFromTower($tower)
    {
        // Specify the folder path within the storage directory
        $folderPath = storage_path('app' . DIRECTORY_SEPARATOR . $tower);

        if (!File::isDirectory($folderPath)) {
            return response()->json(['files' => []], 200, [], JSON_UNESCAPED_SLASHES);
        }

        // Get all files in the folder
        $files = File::files($folderPath);

        // Create storage links for the files
        foreach ($files as $file) {
            // Get the file name
            $fileName = pathinfo($file, PATHINFO_BASENAME);

            // Specify the destination path within the public directory
            $destinationPath = public_path('storage' . DIRECTORY_SEPARATOR . $tower);

            // Create a symbolic link
            Storage::disk('public')->putFileAs($tower, $file, $fileName);
        }

        // Get the list of files in the public directory
        $publicFiles = Storage::disk('public')->files($tower);

        // Generate full URLs for the files
        $fullUrls = array_map(function ($file) use ($tower) {
            return url("storage/{$tower}/" . pathinfo($file, PATHINFO_BASENAME));
        }, $publicFiles);

        return response()->json(['files' => $fullUrls], 200, [], JSON_UNESCAPED_SLASHES);
    }

    public function getTowerProduction($tower, $project)
    {
        $jsonFilePointList = storage_path('app/production.json');
        if (File::exists($jsonFilePointList)) {

            $listOfTowerProds = json_decode(File::get($jsonFilePointList), true);

            $tower = str_replace('_', '/', $tower);

            foreach ($listOfTowerProds as $prod) {

                if($prod['Number'] == $tower && $prod['ProjectName'] == $project){

                    $returnItem = [];
                    $itemId = 0;

                    foreach ($prod as $key => $value) {
                        if($itemId > 1){
                            $returnItem[$itemId-2] = [
                                'activitie' => $key,
                                'date' => $value
                            ];
                        }

                        $itemId++;
                    }

                    // $item = array_splice($prod, 2, count($prod));
                    return response()->json($returnItem);
                }

            }
            return response()->json([]);
        }
    }

    public function uploadGaleryImages(Request $request)
    {
        // Validação dos dados da requisição
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imageUrls = [];

        // Salvar cada imagem no diretório de armazenamento (pasta storage/app/public)
        foreach ($request->file('images') as $file) {
            $imagePath = $file->store($request->towerId);
            $imageUrl = url('storage/' . $request->towerId . DIRECTORY_SEPARATOR . basename($imagePath));
            $imageUrls[] = $imageUrl;
        }

        // Retorna as URLs das imagens
        return response()->json(['imageUrls' => $imageUrls]);
    }
}
