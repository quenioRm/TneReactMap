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

class MapsController extends Controller
{
    public function getCoordinatesByRange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'inputX' => 'numeric',
            'inputY' => 'numeric',
            'radius' => 'numeric',
            'getAllPoints' => 'boolean'
        ]);

        if($request->getAllPoints == true){
            return $this->getCoordinates();
        }

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
        $listOfMarkers = Tower::get(); // Substitua por sua lógica para obter a lista de marcadores

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

        // Retorna os marcadores que estão dentro do raio especificado como uma resposta JSON
        return response()->json($markers);
    }

    public function getCoordinatesByAnotherMarkers(Request $request)
    {
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



        if($radius == 0)
            $radius = 30000;


        $markers = [];
        $listOfMarkers = Tower::get(); // Substitua por sua lógica para obter a lista de marcadores

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

                $markers[] = [
                    'name' => $markerData['Number'] . " - " . $markerData['ProjectName'],
                    'position' => [
                        'lat' => $newCoordinates['attr']['lat'],
                        'lng' => $newCoordinates['attr']['lon'],
                        'utmx' => $markerData['CoordinateX'],
                        'utmy' => $markerData['CoordinateY'],
                        'zone' => $zone,
                        'tower' => ''
                    ],
                    'label' => [
                        'color' =>'blue',
                        'text' => '',
                        'towerId' => '',
                        'project' => '',
                        'oringalNumber' => '',
                        'originalName' => ''
                    ],
                    'avc' => 0,
                    'draggable' => false,
                    'config_icon' => 'icone',
                    'impediment_icon' => '',
                    'Impediments' => null,
                    'SolicitationDate' => null ,
                    'ReceiveDate' => null,
                    'PreviousReceiveDate' => null,
                    'ReceiveStatus' => null,
                    'iconsbarActivity' => null,
                    'iconsbarImpediment' => null
                ];
            }
        }

        // Retorna os marcadores que estão dentro do raio especificado como uma resposta JSON
        return response()->json($markers);
    }

    public function getCoordinates()
    {
        // Use o Cache para armazenar e recuperar os dados
        $initialMarkers = Cache::remember('coordinates_data', 120, function () {
            $markers = [];
            $listOfMarkers = Tower::get();

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
                    'type' => 'tower',
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
                    'ReceiveStatus' => $receiveStatus
                ];

            }

            return $markers;
        });

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

        foreach ($request->file('images') as $file) {
            // Generate a unique ID for each image using timestamp and random string
            $uniqueId = time() . '_' . Str::random(10); // You may need to import Str class

            // Determine the file extension (e.g., jpg, png)
            $extension = $file->getClientOriginalExtension();

            // Generate the file name with the unique ID and extension
            $fileName = $uniqueId . '.' . $extension;

            // Save the image to the storage/app/public directory with the generated filename
            $imagePath = $file->storeAs($request->towerId, $fileName);

            // Generate the image URL
            $imageUrl = url('storage/' . $request->towerId . '/' . $fileName);

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

        $filePath = $folder[2] . '/' . $folder[3];

        if (Storage::disk('public')->exists($filePath)) {
            // Exclua o arquivo físico da pasta public
            Storage::disk('public')->delete($filePath);

            // Exclua o arquivo físico da pasta app
            $appFilePath = storage_path('app/' . $folder[2] . '/' . $folder[3]);
            if (file_exists($appFilePath)) {
                unlink($appFilePath);
            }

            return response()->json(['message' => 'Imagem excluída com sucesso']);
        } else {
            // A imagem não foi encontrada
            return response()->json(['message' => 'Imagem não encontrada'], 404);
        }
    }

    public function GetLatestIcons($tower, $project)
    {

        return response()->json(Production::getLatestTowerActivityWithIcons($tower, $project));
    }
}
