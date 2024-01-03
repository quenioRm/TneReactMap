<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    public static function GetDistance($project, $number)
    {
        return self::where('ProjectName', $project)->where('Number', $number)->value('Distance');
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
}
