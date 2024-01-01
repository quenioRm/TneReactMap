<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Helpers\CoordinateHelper;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Helpers\Production;
use App\Models\Tower;
use App\Models\TowerActivity;
use Carbon\Carbon;
use App\Models\Marker;

class MapsController extends Controller
{
    public function getCoordinates()
    {
        $initialMarkers;

        $listOfMarkers = Tower::get();

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

            $changedTowerId = str_replace('/', '_', $markerData['Number']);

            // $result = Production::getLatestTowerProductionDate($changedTowerId, $markerData['ProjectName']);
            // dd($result);

            $initialMarkers[] = [
                'name' => $markerData['Number'] . " - " . $markerData['ProjectName'],
                'position' => [
                    'lat' => $newCoordinates['attr']['lat'],
                    'lng' => $newCoordinates['attr']['lon'],
                    'utmx' => $markerData['CoordinateX'],
                    'utmy' => $markerData['CoordinateY']
                ],
                'label' => [
                    'color' =>'blue',
                    'text' => $markerData['Number'] . " - " . $markerData['Name'],
                    'towerId' => $changedTowerId,
                    'project' => $markerData['ProjectName'],
                ],
                'draggable' => true,
                'config_icon' => Production::getLatestTowerActivityWithIcon($changedTowerId, $markerData['ProjectName']),
                'Impediments' => [],
                'SolicitationDate' => $markerData['SolicitationDate'],
                'ReceiveDate' => $markerData['ReceiveDate']
            ];
        }

        return response()->json($initialMarkers);
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
        $tower = str_replace('_', '/', $tower);

        $towerActivities = TowerActivity::where('Number', $tower)
            ->where('ProjectName', $project)
            ->get();

        $returnItem = [];

        foreach ($towerActivities as $key => $item) {

            $carbonDate = $item->ConclusionDate;

            if($carbonDate != null){
                $carbonDate = Carbon::parse($item->ConclusionDate);
                $carbonDate = $carbonDate->format('d/m/y');
            }

            $icon = Marker::where('atividade', $item->Activitie)->value('icone');

            $iconUrl = ($icon !== null) ? asset(Storage::url($icon)) : asset('assets/images/marcador-de-localizacao.png');

            $returnItem[$key] = [
                'activitie' => $item->Activitie,
                'date' => $carbonDate,
                'icon' => $iconUrl
            ];
        }

        return response()->json($returnItem);
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
