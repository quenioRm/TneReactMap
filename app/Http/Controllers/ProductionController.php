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

class ProductionController extends Controller
{
    public function getLatestProduction($project = '')
    {
        $cacheKey = 'latest_production_' . $project;

        return Cache::remember($cacheKey, 60 * 60, function () use ($project) {
            $results = [];
            $activities = Marker::get();

            foreach ($activities as $activitie) {
                $previousCount = $this->getPreviousCount($activitie, $project);

                $productions = ($project == '')
                    ? TowerActivity::get()
                    : TowerActivity::where('ProjectName', $project)->get();

                $count = $this->getExecutedCount($activitie, $productions, $project);

                $results[] = [
                    'activitie' => $activitie->atividade,
                    'unity' => $activitie->unidade,
                    'icon' => $activitie->icone,
                    'previous' => $previousCount,
                    'executed' => $count,
                    'noExecuted' => ($previousCount - $count),
                    'avcPercent' => ($previousCount > 0) ? number_format(($count / $previousCount) * 100, 2) . '%' : '0.00%',
                ];
            }

            return $results;
        });
    }

    private function getPreviousCount($activitie, $project)
    {
        return ($project == '')
            ? ($activitie->unidade == 'Torre' ? Tower::count() : Tower::sum('Distance'))
            : ($activitie->unidade == 'Torre' ? Tower::where('ProjectName', $project)->count() : Tower::where('ProjectName', $project)->sum('Distance'));
    }

    private function getExecutedCount($activitie, $productions, $project)
    {
        $count = 0;
        foreach ($productions as $production) {
            if ($production->Activitie == $activitie->atividade && $production->ConclusionDate != null && ($project == '' || $production->ProjectName == $project)) {
                $count += ($activitie->unidade == 'Torre') ? 1 : Tower::GetDistance($production->ProjectName, $production->Number);
            }
        }
        return $count;
    }



}
