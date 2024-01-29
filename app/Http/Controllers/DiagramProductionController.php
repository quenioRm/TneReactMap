<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tower;
use App\Models\TowerActivity;
use App\Models\TowerImpediment;
use App\Helpers\Production;
use Carbon\Carbon;

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

}
