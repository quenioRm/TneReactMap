<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Production;
use App\Models\Tower;
use App\Models\TowerActivity;
use App\Models\TowerImpediment;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use App\Models\Marker;
use DateInterval;
use DatePeriod;
use DateTime;

class ProductionController extends Controller
{
    public function getLatestProduction($project = '')
    {
        $cacheKey = 'latest_production_' . $project;
        return Cache::remember($cacheKey, 60 * 60, function () use ($project) {
            return $this->calculateProductionResults($project);
        });
    }

    public function getperiodProduction($startDate, $finishDate, $project = '')
    {
        $cacheKey = 'period_latest_production_' . $project . '_' . $startDate . '_' . $finishDate;
        return Cache::remember($cacheKey, 60 * 60, function () use ($project, $startDate, $finishDate) {
            $results = $this->calculateProductionResults($project, $finishDate);
            foreach ($results as &$result) {
                $result['dailyProduction'] = $this->getProductionByDate($result['activitieObject'], $project, $startDate, $finishDate);
            }
            return $results;
        });
    }


    private function calculateProductionResults($project, $finishDate = null)
    {
        $results = [];
        $activities = Marker::get();
        foreach ($activities as $activitie) {
            $previousCount = $this->getPreviousCount($activitie, $project);
            $productions = $this->getProductions($activitie, $project);
            $count = $this->getExecutedCount($activitie, $productions, $project, null, $finishDate);

            $results[] = [
                'activitie' => $activitie->atividade,
                'unity' => $activitie->unidade,
                'icon' => $activitie->icone,
                'previous' => $previousCount,
                'executed' => $count,
                'noExecuted' => ($previousCount - $count),
                'avcPercent' => ($previousCount > 0) ? number_format(($count / $previousCount) * 100, 2) . '%' : '0.00%',
                'activitieObject' => $activitie
            ];
        }

        return $results;
    }

    private function getProductions($activitie, $project)
    {
        return ($project == '')
            ? TowerActivity::get()
            : TowerActivity::where('ProjectName', $project)->get();
    }

    private function getProductionByDate($activitie, $project, $startDate, $finishDate)
    {
        // Valida e converte as datas
        try {
            $startDateObj = new DateTime($startDate);
            $finishDateObj = new DateTime($finishDate);
        } catch (\Exception $e) {
            return []; // Retorna um array vazio em caso de datas inválidas
        }


        // Cria um intervalo de 1 dia
        $interval = new DateInterval('P1D');
        $period = new DatePeriod($startDateObj, $interval, $finishDateObj->modify('+1 day'));
        $dailyProduction = [];

        foreach ($period as $date) {
            $productions = $this->getProductions($activitie, $project);

            $dailyProduction[$date->format('Y-m-d')] = $this->getExecutedCount($activitie, $productions, $project, $date->format('Y-m-d'));
        }

        return $dailyProduction;
    }

    private function getPreviousCount($activitie, $project)
    {
        return ($project == '')
            ? ($activitie->unidade == 'Torre' ? Tower::count() : Tower::sum('Distance'))
            : ($activitie->unidade == 'Torre' ? Tower::where('ProjectName', $project)->count() : Tower::where('ProjectName', $project)->sum('Distance'));
    }

    private function getExecutedCount($activitie, $productions, $project, $conclusionDate = null, $finishDate = null)
    {
        $filteredProductions = null;

        // Convert the input conclusion date to a DateTime object for reliable comparison.
        $conclusionDateTime = $conclusionDate ? new DateTime($conclusionDate) : null;

        // Convert the finish date to a DateTime object for comparison.
        $finishDateTime = $finishDate ? new DateTime($finishDate) : null;

        // Filter the productions based on the project, activity, and conclusion date.
        $filteredProductions = $productions->filter(function($production) use ($activitie, $project, $conclusionDateTime, $finishDateTime) {
            $isSameProject = $project === '' || $production->ProjectName === $project;
            $isSameActivity = trim($production->Activitie) === trim($activitie->atividade);

            // Convert the production conclusion date to a DateTime object.
            $productionConclusionDateTime = ($production->ConclusionDate != null ) ? new DateTime($production->ConclusionDate) : null;

            // Check if the dates match or if the conclusion date is not set.
            $isDateMatch = !$conclusionDateTime || $productionConclusionDateTime == $conclusionDateTime;

            // Check if the dates match or if the latest finish date is not set.
            $isFinishDate = !$finishDateTime || $productionConclusionDateTime <= $finishDateTime;

            return $isSameProject && $isSameActivity && $isDateMatch && $isFinishDate && $production->ConclusionDate !== null;
        });


        // Calculate the count based on the activity unit.
        $count = $filteredProductions->sum(function($production) use ($activitie) {
            return $activitie->unidade === 'Torre' ? 1 : Tower::GetDistance($production->ProjectName, $production->Number);
        });

        return $count;
    }
}
