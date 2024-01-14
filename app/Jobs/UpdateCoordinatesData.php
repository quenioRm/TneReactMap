<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;

class UpdateCoordinatesData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $cacheKey;

    public function __construct($cacheKey)
    {
        $this->cacheKey = $cacheKey;
    }

    public function handle(): void
    {
        // Lógica para atualizar ou recuperar os dados em cache
        $markers = [];

        $listOfMarkers = Tower::get();

        $firstX = 0;
        $firstY = 0;

        if (!empty($listOfMarkers)) {
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
                    'originalName' => $markerData['Name']
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

        // Armazene os dados em cache por um período (exemplo: 1440 minutos)
        Cache::put($this->cacheKey, $mergedArray, 1440);
    }
}
