<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tower;
use App\Models\TowerActivity;
use App\Models\TowerImpediment;
use App\Helpers\Production;
use Carbon\Carbon;
use App\Models\MarkerConfigImpediment;
use App\Models\Marker;
use App\Http\Controllers\ProductionController;
use DateInterval;

class DiagramProductionController extends Controller
{
    public function GetDiagram(Request $request)
    {
        $project = $request->projectName;
        $chkdate = ($request->startDate == "" ? null : $request->startDate);

        $towers = $project ? Tower::where('ProjectName', $project)->get() : Tower::all();
        $results = [];

        foreach ($towers as $tower) {
            $projectName = $tower->ProjectName;
            $number = $tower->Number;

            $activities = $tower->filteredTowerActivities($projectName);
            $impediments = TowerImpediment::GetImpediments($projectName, $number);
            $productionIcon = Production::getLatestTowerActivityWithIcon($tower->Number, $tower->ProjectName);

            if($productionIcon['activitie'] != null && $chkdate != null){
                $date = Carbon::createFromFormat('d/m/y', $productionIcon['date']);
                $chkdate = Carbon::parse($chkdate);

                if($date >= $chkdate){
                    $productionIcon['inPeriod'] = true;
                }else{
                    $productionIcon['inPeriod'] = false;
                }

            }else{
                $productionIcon['inPeriod'] = false;
            }

            $results[] = [
                'tower' => $tower,
                'latestactivity' => $productionIcon,
                'activities' => $activities,
                'impediments' => $impediments
            ];
        }

        return response()->json($results);
    }

    public function countIsBlockedByType($projectName = null)
    {
        $impediments = TowerImpediment::where('ProjectName', $projectName)
            ->get();

        $counts = [];

        foreach ($impediments as $impediment) {
            $type = $impediment->ImpedimentType;
            $status = $impediment->Status;

            // Check if the type is already in the list, if not, add it.
            $found = false;
            foreach ($counts as &$count) {
                if ($count['type'] === $type) {
                    $found = true;
                    if ($status === 'Liberado') {
                        $count['released']++;
                    } else {
                        $count['notreleased']++;
                    }
                    break;
                }
            }

            if (!$found) {
                $counts[] = [
                    'type' => $type,
                    'released' => ($status === 'Liberado') ? 1 : 0,
                    'notreleased' => ($status !== 'Liberado') ? 1 : 0,
                ];
            }
        }

        return $counts;
    }

    public function getLatestProductionByDate(Request $request)
    {
        $startDate = Carbon::parse($request->startDate);
        $endDate = $startDate->copy()->addDays(1); // Inicia com a próxima data para a verificação

        $activities = Marker::get(); // Obter todas as atividades

        $allProductions = collect(); // Coleção para armazenar todos os resultados de produção
        $summary = []; // Coleção para armazenar o resumo de todas as atividades
        $allProdutivity = [];

        foreach ($activities as $activity) {
            $production = TowerActivity::select('Activitie', 'Number', 'ConclusionDate')
                ->where('ConclusionDate', '>=', $startDate)
                ->where('ProjectName', $request->ProjectName)
                ->where('Activitie', $activity->atividade)
                ->get();

            $dailyProduction = $this->countExecutedByDate($activity->atividade, $request->ProjectName, $request->startDate);

            // $allProdutivity[] = [
            //     'activity' => $activity->atividade,
            //     'dates' => $dailyProduction
            // ];

            // Formatando a data para "d/m/Y" usando Carbon
            $formattedProduction = $production->map(function ($item) {
                $item->ConclusionDate = Carbon::parse($item->ConclusionDate)->format('d/m/Y');
                return $item;
            });

            // Adicionar os resultados formatados à coleção allProductions
            $allProductions = $allProductions->merge($formattedProduction);

            // Calcular o total de atividades agrupadas por 'Activitie' e adicionar ao resumo
            $activitySummary = $formattedProduction->groupBy('Activitie')
            ->map(function ($group, $activityName) use($dailyProduction) {
                return [
                    'activity' => $activityName,
                    'total' => count($group),
                    'dates' => $dailyProduction
                ];
            })->values();

            // Adicionar itens de $activitySummary a $summary se não estiverem vazios
            if (!$activitySummary->isEmpty()) {
                foreach ($activitySummary as $summaryItem) {
                    $summary[] = $summaryItem;
                }
            }

        }

        // Preparar os dados para a resposta
        $responseData = [
            'production' => $allProductions,
            'summary' => array_merge($summary, $allProdutivity),
            // 'resume' => $allProdutivity
        ];

        return response()->json($responseData);
    }

    public function countExecutedByDate($activity, $project, $startDate)
    {
        $startDate = Carbon::parse($startDate); // Convertendo $startDate para uma instância de Carbon
        $endDate = Carbon::now()->subDay(); // Definindo $endDate como "hoje -1"

        $dailyProduction = [];
        $totalProduction = 0;
        $countDays = 0;

        // Loop para cada dia desde $startDate até $endDate ("hoje -1")
        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            if ($date->dayOfWeek != Carbon::SUNDAY) { // Ignorar os domingos
                // Contar a produção para a atividade e projeto especificados em cada dia
                $dayProductionCount = TowerActivity::whereDate('ConclusionDate', $date)
                                                ->where('ProjectName', $project)
                                                ->where('Activitie', $activity)
                                                ->count();

                // Adicionar o resultado no array e acumular para cálculo da média
                $dailyProduction[$date->format('d/m/Y')] = $dayProductionCount;
                $totalProduction += $dayProductionCount;
                $countDays++;
            }
        }

        // Calcular a média excluindo os domingos e considerando até "hoje -1"
        $averageProduction = $countDays > 0 ? $totalProduction / $countDays : 0;
        $activityData = $this->getTotalProdutivity($activity, $project);

        $workDaysToFinish = 0;
        $todo = $activityData['activity']['noExecuted'];

        if($activityData['averageProduction'] == 'finished'){
            return [
                'dailyProduction' => $dailyProduction,
                'averageProduction' => $averageProduction,
                'finishDate' => 'Finalizada'
            ];
        }

        if($averageProduction > 0){
            $workDaysToFinish = $todo / $averageProduction;
        }else{
            if(floatval($activityData['averageProduction']) == 0 || $todo == 0){
                return [
                    'dailyProduction' => $dailyProduction,
                    'averageProduction' => $averageProduction,
                    'finishDate' => '-'
                ];
            }
            $workDaysToFinish = $todo / floatval($activityData['averageProduction']);
        }

        $newDate = $this->addBusinessDays(Carbon::now(), $workDaysToFinish);

        return [
            'dailyProduction' => $dailyProduction,
            'averageProduction' => $averageProduction,
            'finishDate' => $newDate->format('d/m/y'),
            'days' => $activityData['days']
        ];
    }

    public function getTotalProdutivity($activity, $project)
    {
        $filteredActivity = null;
        $prodC = new ProductionController();
        $acitivities = $prodC->getLatestProduction($project);

        foreach ($acitivities as $key => $activityS) {
            if($activityS['activitie'] == $activity){
                $filteredActivity = $activityS;
                break;
            }
        }

        $startDate = null;

        $firstExecutionDate = TowerActivity::where('ProjectName', $project)
            ->where('Activitie', $activity)
            ->whereNotNull('ConclusionDate')
            ->orderBy('ConclusionDate', 'asc')
            ->first();

        if($firstExecutionDate){
            $startDate = $firstExecutionDate->ConclusionDate;
        }else{
            return [
                'activity' => $filteredActivity,
                'averageProduction' => 0,
                'days' => 0
            ];
        }

        $startDate = Carbon::parse($startDate);
        $endDate = Carbon::now()->subDay();
        $interval = new DateInterval('P1D'); // Intervalo de 1 dia

        $totalWorkingDays = 0;

        for ($date = $startDate; $date <= $endDate; $date->add($interval)) {
            // Verifique se o dia atual não é um domingo (0)
            if ($date->dayOfWeek != Carbon::SUNDAY) {
                $totalWorkingDays++;
            }
        }

        if($filteredActivity['noExecuted'] == 0 || $totalWorkingDays == 0){
            return [
                'activity' => $filteredActivity,
                'averageProduction' => 'finished',
                'days' => $totalWorkingDays
            ];
        }

        $todo = $filteredActivity['previous'] - $filteredActivity['executed'];
        $produtivity = $filteredActivity['executed'] / $totalWorkingDays;

        return [
            'activity' => $filteredActivity,
            'averageProduction' => $produtivity,
            'days' => $totalWorkingDays
        ];
    }

    function addBusinessDays($startDate, $numberOfDays) {
        $date = Carbon::parse($startDate);

        while ($numberOfDays > 0) {
            $date->addDay();
            // Verifica se o dia atual não é domingo (0)
            if ($date->dayOfWeek !== Carbon::SUNDAY) {
                $numberOfDays--;
            }
        }

        return $date; // Retorna um objeto Carbon
    }
}
