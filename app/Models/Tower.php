<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use DateInterval;
use DatePeriod;
use App\Models\FoundationProjects;

class Tower extends Model
{
    use HasFactory;

    protected $table = 'towers';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'ProjectName',
        'Number',
        'Name',
        'Distance',
        'SolicitationDate',
        'ReceiveDate',
        'CoordinateX',
        'CoordinateY',
        'CoordinateZ',
        'Zone',
        'Type',
        'FoundationMC',
        'FoundationFoot',
        'UsefulHeight',
        'Extension',
        'HA',
        'HB',
        'HC',
        'HD',
        'FoundationState',
        'ElectromechanicalState',
    ];

    public static function GetDistance($project, $number)
    {
        return self::where('ProjectName', $project)->where('Number', $number)->value('Distance');
    }

    public function foundationProjects()
    {
        return $this->hasMany(FoundationProjects::class, 'FoundationMC', 'name');
    }

    public static function GetUniqueProjects()
    {
        $towers = self::get();

        $projects = [];

        $item = 1;

        foreach ($towers as $key => $tower) {
            $projectName = $tower->ProjectName;

            // Verifica se o nome do projeto já está na lista
            $projectExists = false;
            foreach ($projects as $project) {
                if ($project['name'] === $projectName) {
                    $projectExists = true;
                    break;
                }
            }

            // Se o nome do projeto não existe na lista, adiciona-o
            if (!$projectExists) {
                $projects[] = [
                    'name' => $projectName,
                    'id' => $item
                ];

                $item++;
            }
        }

        return $projects;
    }

    public static function countTowersByMonth($project)
    {
        $results = [];

        // Array com os nomes dos meses em português
        $mesesEmPortugues = [
            1 => 'Jan', 2 => 'Fev', 3 => 'Mar', 4 => 'Abr',
            5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
            9 => 'Set', 10 => 'Out', 11 => 'Nov', 12 => 'Dez'
        ];

        // Encontra a primeira data de solicitação
        $firstSolicitationDate = static::whereNotNull('SolicitationDate')
            ->where('SolicitationDate', '<>', '')
            ->min('SolicitationDate');

        // Encontre a última data prevista de recebimento
        $lastPredictedReceive = static::whereNotNull('SolicitationDate')
            ->where('SolicitationDate', '<>', '')
            ->get()
            ->map(function ($tower) {
                return Carbon::parse($tower->SolicitationDate)->addDays(240);
            })
            ->max();

        if (is_null($firstSolicitationDate) || is_null($lastPredictedReceive)) {
            return [];
        }

        $startDate = Carbon::parse($firstSolicitationDate);
        $endDate = Carbon::parse($lastPredictedReceive);

        // Define o intervalo de 1 mês
        $interval = new DateInterval('P1M');

        $period = new DatePeriod($startDate, $interval, $endDate);

        $countSolicitationsAcumulated = 0;
        $countReceivesAcumulated = 0;
        $countPredictedReceivesAcumulated = 0;

        while ($startDate <= $endDate) {

            $firstDayOfMonth = $startDate->copy()->firstOfMonth();
            $lastDayOfMonth = $startDate->copy()->lastOfMonth();

            $month = $firstDayOfMonth->month;
            $year = $firstDayOfMonth->year;

            $countSolicitations = Tower::whereNotNull('SolicitationDate')
                ->when(!empty($project), function ($query) use ($project) {
                    return $query->where('ProjectName', $project);
                })
                ->whereMonth('SolicitationDate', $month)
                ->whereYear('SolicitationDate', $year)
                ->count();

            $countReceives = Tower::whereNotNull('ReceiveDate')
                ->when(!empty($project), function ($query) use ($project) {
                    return $query->where('ProjectName', $project);
                })
                ->whereMonth('ReceiveDate', $month)
                ->whereYear('ReceiveDate', $year)
                ->count();

            $predictedReceiveDate = self::predictReceiveDate($startDate);

            $predictReceiveCount = self::countPredictedReceives($firstDayOfMonth, $project);


            $results[] = [
                'first_day' => $firstDayOfMonth->format('Y-m-d'),
                'last_day' => $lastDayOfMonth->format('Y-m-d'),
                'month' => $mesesEmPortugues[$month] . '-' . $year,
                'solicitations' => $countSolicitations,
                'solicitationsAcum' => $countSolicitationsAcumulated,
                'receives' => $countReceives,
                'receivesAcum' => $countReceivesAcumulated,
                'predictedReceiveDate' => ($countSolicitations == 0) ? null : $predictedReceiveDate->format('Y-m-d'),
                'predictedReceiveCount' => $predictReceiveCount,
                'predictedReceiveCountAcum' => $countPredictedReceivesAcumulated,
            ];

            $countSolicitationsAcumulated += $countSolicitations;
            $countReceivesAcumulated += $countReceives;
            $countPredictedReceivesAcumulated += $predictReceiveCount;

            $startDate->addMonth(); // Avança para o próximo mês
        }

        return $results;
    }

    private static function predictReceiveDate($solicitationDate)
    {
        return $solicitationDate->copy()->addDays(120);
    }

    private static function countPredictedReceives($firstDayOfMonth, $project)
    {
        $month = $firstDayOfMonth->month -3;
        $year = $firstDayOfMonth->year;

        if ($month < 1) {
            $month += 12;
            $year--;
        }

        $firstDayOfMonth = Carbon::createFromDate($year, $month, 1);

        $lastDayOfMonth = $firstDayOfMonth->endOfMonth();

        $countSolicitations = Tower::whereNotNull('SolicitationDate')
            ->when(!empty($project), function ($query) use ($project) {
                return $query->where('ProjectName', $project);
            })
            ->whereMonth('SolicitationDate', $month)
            ->whereYear('SolicitationDate', $year)
            ->count();

        return $countSolicitations;

    }


}
