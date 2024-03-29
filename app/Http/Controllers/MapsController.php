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
use App\Models\TowerImpediment;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use App\Models\Marker;
use Illuminate\Support\Facades\Validator;
use Str;
use Illuminate\Support\Facades\Auth;
use App\Models\PersonalMarker;


class MapsController extends Controller
{
    public function getCoordinatesByRange(Request $request)
    {
        $cacheKey = 'coordinates_data_' . $request->inputX . '_' . $request->inputY;

        $cachedData = Cache::remember($cacheKey, 43200, function () use ($request) {

            $validator = Validator::make($request->all(), [
                'inputX' => 'numeric',
                'inputY' => 'numeric',
                'radius' => 'numeric',
                'getAllPoints' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            $inputX = $request->inputX;
            $inputY = $request->inputY;
            $radius = $request->radius;

            if($inputX == 0 || $inputY == 0){
                $firstTower = Tower::first();
                if($firstTower){
                    $inputX = $firstTower->CoordinateX;
                    $inputY = $firstTower->CoordinateY;
                }else{
                    return response()->json(['error' => 'Não existem estruturas cadastradas!'], 400);
                }
            }

            if($radius == 0)
                $radius = 30000;


            $markers = [];
            $listOfMarkers = Tower::get();

            $firstX = 0;
            $firstY = 0;

            if(!empty($listOfMarkers)){
                $firstX = (float)$listOfMarkers[0]->CoordinateX;
                $firstY = (float)$listOfMarkers[0]->CoordinateY;
            }

            foreach ($listOfMarkers as $markerData) {
                // Carrega as coordenadas X e Y do marcador
                $x = (float)$markerData['CoordinateX'];
                $y = (float)$markerData['CoordinateY'];
                $zone = (float)$markerData['Zone'];

                // Calcula a distância do marcador para o ponto fornecido
                $distance = sqrt(pow($x - $inputX, 2) + pow($y - $inputY, 2));

                // Se o marcador está dentro do raio especificado, adiciona ao array de marcadores
                if ($distance <= $radius) {

                    $latlng = null;

                    if ($zone < 0) {
                        $latlng = CoordinateHelper::utm2ll($x, $y, $zone * -1, false);
                    }

                    if ($zone > 0) {
                        $latlng = CoordinateHelper::utm2ll($x, $y, $zone * 1, true);
                    }

                    $newCoordinates = json_decode($latlng, true);

                    $changedTowerId = str_replace('/', '_', $markerData['Number']);

                    $impediments = TowerImpediment::GetImpediments($markerData['ProjectName'], $markerData['Number']);

                    // Receive Status
                    $receiveStatus = '';
                    $solicitationDate = ($markerData['SolicitationDate'] == '') ? '' : Carbon::parse($markerData['SolicitationDate']);
                    $previousReceiveDate = ($markerData['SolicitationDate'] == '') ? '' : Carbon::parse($markerData['SolicitationDate'])->addDays(120);
                    $receiveDate = ($markerData['ReceiveDate'] == '') ? '' : Carbon::parse($markerData['ReceiveDate']);

                    if ($solicitationDate == '')
                        $receiveStatus = 'Á Solicitar';

                    if ($receiveDate != '' && $receiveDate < $previousReceiveDate && $previousReceiveDate != '')
                        $receiveStatus = 'Chegou dentro do prazo';

                    if ($receiveDate != '' && $receiveDate > $previousReceiveDate && $previousReceiveDate != '')
                        $receiveStatus = 'Chegou fora do prazo';

                    if ($receiveDate == '' && $solicitationDate < $previousReceiveDate && $previousReceiveDate > Carbon::now()
                    && $solicitationDate != '')
                        $receiveStatus = 'Aguardando Recebimento';

                    if ($receiveDate == '' && $solicitationDate > $previousReceiveDate && $solicitationDate != '')
                        $receiveStatus = 'Atrasado';

                    if ($previousReceiveDate != '' && $receiveStatus == '' && $previousReceiveDate < Carbon::now())
                        $receiveStatus = 'Atrasado';
                    ///////////

                    $markers[] = [
                        'type' => 0,
                        'name' => $markerData['Number'] . " - " . $markerData['ProjectName'],
                        'position' => [
                            'lat' => $newCoordinates['attr']['lat'],
                            'lng' => $newCoordinates['attr']['lon'],
                            'utmx' => $markerData['CoordinateX'],
                            'utmy' => $markerData['CoordinateY'],
                            'zone' => $zone,
                            'tower' => $markerData['Number']
                        ],
                        'label' => [
                            'color' =>'blue',
                            'text' => $markerData['Number'] . " - " . $markerData['Name'],
                            'towerId' => $changedTowerId,
                            'project' => $markerData['ProjectName'],
                            'oringalNumber' => $markerData['Number'],
                            'originalName' => $markerData['Name']
                        ],
                        'avc' => TowerActivity::CaclPercentageIsExecuted($markerData['Number'], $markerData['ProjectName']),
                        'draggable' => false,
                        'config_icon' => Production::getLatestTowerActivityWithIcon($changedTowerId, $markerData['ProjectName']),
                        'impediment_icon' => Production::GetIconFromLatestImpediment($impediments),
                        'Impediments' => $impediments,
                        'SolicitationDate' => ($markerData['SolicitationDate'] == '') ? '' :
                            Carbon::parse($markerData['SolicitationDate'])->format('d-m-y') ,
                        'ReceiveDate' => ($markerData['ReceiveDate'] == '') ? '' :
                            Carbon::parse($markerData['ReceiveDate'])->format('d-m-y'),
                        'PreviousReceiveDate' => ($markerData['SolicitationDate'] == '') ? '' :
                            Carbon::parse($markerData['SolicitationDate'])->addDays(120)->format('d-m-y'),
                        'ReceiveStatus' => $receiveStatus,
                        'iconsbarActivity' => Production::getLatestTowerActivityWithIcons($changedTowerId, $markerData['ProjectName']),
                        'iconsbarImpediment' => Production::GetIconFromLatestImpedimentIcons($impediments)
                    ];
                }
            }

            $anotherMarkers = $this->getCoordinatesByAnotherMarkers($firstX, $firstY, 50000, false);
            $mergedArray = array_merge($anotherMarkers, $markers);

            return $mergedArray;
        });

        return response()->json($cachedData);
    }

    public function getCoordinates()
    {
        // Use o Cache para armazenar e recuperar os dados 86400 1 dia / 43200 12 horas
        $initialMarkers = Cache::remember('coordinates_data_general', 43200, function () {

            $markers = [];
            $listOfMarkers = Tower::get();

            $firstX = 0;
            $firstY = 0;

            if(!empty($listOfMarkers)){
                $firstX = (float)$listOfMarkers[0]->CoordinateX;
                $firstY = (float)$listOfMarkers[0]->CoordinateY;
            }

            foreach ($listOfMarkers as $markerData) {

                $x = (float)$markerData['CoordinateX'];
                $y = (float)$markerData['CoordinateY'];
                $zone = (float)$markerData['Zone'];

                $latlng = null;

                if ($zone < 0) {
                    $latlng = CoordinateHelper::utm2ll($x, $y, $zone * -1, false);
                }

                if ($zone > 0) {
                    $latlng = CoordinateHelper::utm2ll($x, $y, $zone * 1, true);
                }

                $newCoordinates = json_decode($latlng, true);

                $changedTowerId = str_replace('/', '_', $markerData['Number']);

                $impediments = TowerImpediment::GetImpediments($markerData['ProjectName'], $markerData['Number']);

                // Receive Status
                $receiveStatus = '';
                $solicitationDate = ($markerData['SolicitationDate'] == '') ? '' : Carbon::parse($markerData['SolicitationDate']);
                $previousReceiveDate = ($markerData['SolicitationDate'] == '') ? '' : Carbon::parse($markerData['SolicitationDate'])->addDays(120);
                $receiveDate = ($markerData['ReceiveDate'] == '') ? '' : Carbon::parse($markerData['ReceiveDate']);

                if ($solicitationDate == '')
                    $receiveStatus = 'Á Solicitar';

                if ($receiveDate != '' && $receiveDate < $previousReceiveDate && $previousReceiveDate != '')
                    $receiveStatus = 'Chegou dentro do prazo';

                if ($receiveDate != '' && $receiveDate > $previousReceiveDate && $previousReceiveDate != '')
                    $receiveStatus = 'Chegou fora do prazo';

                if ($receiveDate == '' && $solicitationDate < $previousReceiveDate && $previousReceiveDate > Carbon::now()
                && $solicitationDate != '')
                    $receiveStatus = 'Aguardando Recebimento';

                if ($receiveDate == '' && $solicitationDate > $previousReceiveDate && $solicitationDate != '')
                    $receiveStatus = 'Atrasado';

                if ($previousReceiveDate != '' && $receiveStatus == '' && $previousReceiveDate < Carbon::now())
                    $receiveStatus = 'Atrasado';
                ///////////

                $markers[] = [
                    'type' => 0,
                    'name' => $markerData['Number'] . " - " . $markerData['ProjectName'],
                    'position' => [
                        'lat' => $newCoordinates['attr']['lat'],
                        'lng' => $newCoordinates['attr']['lon'],
                        'utmx' => $markerData['CoordinateX'],
                        'utmy' => $markerData['CoordinateY'],
                        'zone' => $zone,
                        'tower' => $markerData['Number']
                    ],
                    'label' => [
                        'color' =>'blue',
                        'text' => $markerData['Number'] . " - " . $markerData['Name'],
                        'towerId' => $changedTowerId,
                        'project' => $markerData['ProjectName'],
                        'oringalNumber' => $markerData['Number'],
                        'originalName' => $markerData['Name'],
                        'id' => $markerData['id']
                    ],
                    'avc' => 0,
                    'draggable' => false,
                    'config_icon' => Production::getLatestTowerActivityWithIcon($changedTowerId, $markerData['ProjectName']),
                    'impediment_icon' => Production::GetIconFromLatestImpediment($impediments),
                    'Impediments' => $impediments,
                    'SolicitationDate' => ($markerData['SolicitationDate'] == '') ? '' :
                        Carbon::parse($markerData['SolicitationDate'])->format('d-m-y') ,
                    'ReceiveDate' => ($markerData['ReceiveDate'] == '') ? '' :
                        Carbon::parse($markerData['ReceiveDate'])->format('d-m-y'),
                    'PreviousReceiveDate' => ($markerData['SolicitationDate'] == '') ? '' :
                        Carbon::parse($markerData['SolicitationDate'])->addDays(120)->format('d-m-y'),
                    'ReceiveStatus' => $receiveStatus,
                    'iconsbarActivity' => Production::getLatestTowerActivityWithIcons($changedTowerId, $markerData['ProjectName']),
                    'iconsbarImpediment' => Production::GetIconFromLatestImpedimentIcons($impediments)
                ];

            }

            $anotherMarkers = $this->getCoordinatesByAnotherMarkers($firstX, $firstY, 5000000000, false);
            $mergedArray = array_merge($anotherMarkers, $markers);

            return $mergedArray;
        });

        return response()->json($initialMarkers);
    }

    public function getCoordinatesByAnotherMarkers($inputX, $inputY, $radius, $getAllPoints)
    {
        $markers = [];
        $listOfMarkers = PersonalMarker::get();

        foreach ($listOfMarkers as $markerData) {
            // Carrega as coordenadas X e Y do marcador
            $x = (float)$markerData['coordinateX'];
            $y = (float)$markerData['coordinateY'];
            $zone = (float)$markerData['zone'];

            // Calcula a distância do marcador para o ponto fornecido
            $distance = sqrt(pow($x - $inputX, 2) + pow($y - $inputY, 2));

            // Se o marcador está dentro do raio especificado, adiciona ao array de marcadores
            if ($distance <= $radius) {

                $latlng = null;

                if ($zone < 0) {
                    $latlng = CoordinateHelper::utm2ll($x, $y, $zone * -1, false);
                }

                if ($zone > 0) {
                    $latlng = CoordinateHelper::utm2ll($x, $y, $zone * 1, true);
                }

                $newCoordinates = json_decode($latlng, true);

                $markers[] = [
                    'type' => 1,
                    'name' => $markerData['name'],
                    'position' => [
                        'lat' => $newCoordinates['attr']['lat'],
                        'lng' => $newCoordinates['attr']['lon'],
                        'utmx' => $markerData['coordinateX'],
                        'utmy' => $markerData['coordinateY'],
                        'zone' => $zone,
                        'tower' => $markerData['name']
                    ],
                    'label' => [
                        'color' =>'blue',
                        'text' => $markerData['name'],
                        'towerId' => '',
                        'project' => '',
                        'oringalNumber' => '',
                        'originalName' => '',
                        'id' => $markerData['id']
                    ],
                    'avc' => 0,
                    'draggable' => false,
                    'config_icon' => [
                        'activitie' => null,
                        'date' => null,
                        'icon' =>  Storage::url($markerData['icon'])
                    ],
                    'impediment_icon' => '',
                    'Impediments' => null,
                    'SolicitationDate' => null ,
                    'ReceiveDate' => null,
                    'PreviousReceiveDate' => null,
                    'ReceiveStatus' => null,
                    'iconsbarActivity' => Production::GetLatestIconsFromPersonalMarkers($markerData['id']),
                    'iconsbarImpediment' => null
                ];
            }
        }

        return $markers;
    }

    public function getImagesFromTower($tower)
    {
        $replaced_tower = str_replace(' ', '_', $tower);

        // Specify the folder path within the storage directory
        $folderPath = storage_path('app' . DIRECTORY_SEPARATOR . $replaced_tower);

        if (!File::isDirectory($folderPath)) {
            return response()->json(['files' => []], 200, [], JSON_UNESCAPED_SLASHES);
        }

        // Get all files in the folder
        // $files = File::files($folderPath);
        $fullUrls = [];

        $allFiles = $this->getAllFilesInFolder($folderPath);

        // Create storage links for the files
        foreach ($allFiles as $file) {
            // Get the file name
            $fileName = pathinfo($file, PATHINFO_BASENAME);

            // Get the relative path within the storage directory
            $relativePath = str_replace(storage_path('app'), 'storage', $file);

            // Convert backslashes to forward slashes for URLs
            $relativePath = str_replace('\\', '/', $relativePath);

            // Generate the public URL link
            $fileUrl = url($relativePath);

            $fullUrls[] = $fileUrl;

            // Generate the public path equivalent
            $publicPath = public_path($relativePath);

            // Specify the destination path within the public directory
            $destinationPath = public_path('storage' . DIRECTORY_SEPARATOR . $replaced_tower);

            // Create a symbolic link
            Storage::disk('public')->putFileAs($replaced_tower, $file, $fileName);

        }

        return response()->json(['files' => $fullUrls], 200, [], JSON_UNESCAPED_SLASHES);
    }

    public function getAllFilesInFolder($folderPath)
    {
        $files = [];

        $directoryIterator = new \RecursiveDirectoryIterator($folderPath);
        $iterator = new \RecursiveIteratorIterator($directoryIterator);

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $files[] = $file->getPathname();
            }
        }

        return $files;
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
                'icon' => $iconUrl,
                'id' => $item->id
            ];
        }

        return response()->json($returnItem);
    }

    public function uploadGaleryImages(Request $request)
    {
        // Validação dos dados da requisição
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:10048',
        ]);

        $imageUrls = [];

        $replaced_tower = str_replace(' ', '_', $request->towerId);

        foreach ($request->file('images') as $file) {
            // Generate a unique ID for each image using timestamp and random string
            $uniqueId = time() . '_' . Str::random(10); // You may need to import Str class

            // Determine the file extension (e.g., jpg, png)
            $extension = $file->getClientOriginalExtension();

            // Generate the file name with the unique ID and extension
            $fileName = $uniqueId . '.' . $extension;

            // Save the image to the storage/app/public directory with the generated filename
            $imagePath = $file->storeAs($replaced_tower, $fileName);

            // Generate the image URL
            $imageUrl = url('storage/' . $replaced_tower . '/' . $fileName);

            $imageUrls[] = $imageUrl;
        }

        // Retorna as URLs das imagens
        return response()->json(['imageUrls' => $imageUrls]);
    }

    public function deleteGalleryImage(Request $request)
    {
        // Validação dos dados da requisição
        $request->validate([
            'image_url' => 'required|url',
        ]);

        $imageUrl = $request->input('image_url');

        $imagePath = parse_url($imageUrl, PHP_URL_PATH);

        $folder = explode('/', $imagePath);

        $replaced_tower = str_replace(' ', '_', $folder[2]);

        $filePath = $replaced_tower . '/' . $folder[3];

        if (Storage::disk('public')->exists($filePath)) {
            // Exclua o arquivo físico da pasta public
            Storage::disk('public')->delete($filePath);

            // Exclua o arquivo físico da pasta app
            $appFilePath = storage_path('app/' . $replaced_tower . '/' . $folder[3]);

            if (is_file($appFilePath)) {
                unlink($appFilePath);
            }

            return [
                'message' => 'Imagem excluída com sucesso',
                'status' => 200
            ];
        } else {
            // A imagem não foi encontrada
            return [
                'message' => 'Imagem não encontrada',
                'status' => 404
            ];
        }
    }

    public function GetLatestIcons($tower, $project)
    {

        return response()->json(Production::getLatestTowerActivityWithIcons($tower, $project));
    }

    public function GetTowerAvc($tower, $project)
    {
        $cacheKey = 'tower_avc_' . $tower . '_' . $project;

        if (Cache::has($cacheKey)) {

            $avc = Cache::get($cacheKey);

        } else {

            $tower = str_replace('_', '/', $tower);
            $avc = TowerActivity::CaclPercentageIsExecuted($tower, $project);

            Cache::put($cacheKey, $avc, 60);
        }

        return response()->json($avc);
    }

    public function Test($id)
    {
        return Production::GetLatestIconsFromPersonalMarkers($id);
    }

    public function getImagesFromMarkerWithActivity($tower, $activityId)
    {
        $replaced_tower = str_replace(' ', '_', $tower);

        // Specify the folder path within the storage directory
        $folderPath = storage_path('app' . DIRECTORY_SEPARATOR . $replaced_tower . DIRECTORY_SEPARATOR . $activityId);

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
            $destinationPath = public_path('storage' . DIRECTORY_SEPARATOR . $replaced_tower . DIRECTORY_SEPARATOR . $activityId);

            // Create a symbolic link
            Storage::disk('public')->putFileAs($replaced_tower . DIRECTORY_SEPARATOR . $activityId, $file, $fileName);
        }

        // Get the list of files in the public directory
        $publicFiles = Storage::disk('public')->files($replaced_tower . DIRECTORY_SEPARATOR . $activityId);

        // Generate full URLs for the files
        $fullUrls = array_map(function ($file) use ($replaced_tower,  $activityId) {
            return url("storage/{$replaced_tower}/{$activityId}/" . pathinfo($file, PATHINFO_BASENAME));
        }, $publicFiles);

        return response()->json(['files' => $fullUrls], 200, [], JSON_UNESCAPED_SLASHES);
    }

    public function uploadGaleryImagesWithActivity(Request $request)
    {
        // Validação dos dados da requisição
        $request->validate([
            'activityId' => 'required',
            'towerId' => 'required',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:10048',
        ]);

        $imageUrls = [];

        $replaced_tower = str_replace(' ', '_', $request->towerId);

        foreach ($request->file('images') as $file) {
            // Generate a unique ID for each image using timestamp and random string
            $uniqueId = time() . '_' . Str::random(10); // You may need to import Str class

            // Determine the file extension (e.g., jpg, png)
            $extension = $file->getClientOriginalExtension();

            // Generate the file name with the unique ID and extension
            $fileName = $uniqueId . '.' . $extension;

            // Save the image to the storage/app/public directory with the generated filename
            $imagePath = $file->storeAs($replaced_tower . '/' . $request->activityId, $fileName);

            // Generate the image URL
            $imageUrl = url('storage/' . $replaced_tower . '/' . $request->activityId . '/' . $fileName);

            $imageUrls[] = $imageUrl;
        }

        // Retorna as URLs das imagens
        return response()->json(['imageUrls' => $imageUrls]);
    }

    public function deleteGalleryImageWithActivity(Request $request)
    {
        // Validação dos dados da requisição
        $request->validate([
            'image_url' => 'required|url',
        ]);

        $imageUrl = $request->input('image_url');

        $imagePath = parse_url($imageUrl, PHP_URL_PATH);

        $folder = explode('/', $imagePath);

        $replaced_tower = str_replace(' ', '_', $folder[2]);

        $filePath = $replaced_tower . '/' . $folder[3] . '/' . $folder[4];

        if (Storage::disk('public')->exists($filePath)) {
            // Exclua o arquivo físico da pasta public
            Storage::disk('public')->delete($filePath);

            // Verifique se $appFilePath é um arquivo antes de tentar excluí-lo
            $appFilePath = storage_path('app/' . $replaced_tower . '/' . $folder[3] . '/' . $folder[4]);
            if (is_file($appFilePath)) {
                unlink($appFilePath);
            }

            return [
                'message' => 'Imagem excluída com sucesso',
                'status' => 200
            ];
        } else {
            // A imagem não foi encontrada
            return [
                'message' => 'Imagem não encontrada',
                'status' => 404
            ];
        }
    }

    public function deleteFromSpecificGallery(Request $request)
    {
        $request->validate([
            'image_url' => 'required|url',
        ]);

        $imageUrl = $request->input('image_url');

        $imagePath = parse_url($imageUrl, PHP_URL_PATH);

        $folder = explode('/', $imagePath);

        if(count($folder) == 4){
            $return = $this->deleteGalleryImage($request);
            return response()->json(['message' => $return['message']], $return['status']);
        }

        if(count($folder) == 5){
            $return = $this->deleteGalleryImageWithActivity($request);
            return response()->json(['message' => $return['message']], $return['status']);
        }
    }


}
