<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tower;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Rap2hpoutre\FastExcel\FastExcel;
use App\Helpers\Functions;
use App\Models\TowerActivity;
use App\Models\TowerImpediment;
use Carbon\Carbon;
use DateTimeImmutable;

class TowerController extends Controller
{
    public function importTowers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:json|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $file = $request->file('file');

        $jsonFilePath = $file->storeAs('imported-towers', 'towerlist.json', 'public');

        $jsonData = json_decode(File::get(storage_path('app/public/' . $jsonFilePath)), true);

        DB::table('towers')->truncate();

        foreach ($jsonData as $towerData) {
            Tower::create($towerData);
        }

        return response()->json(['message' => 'Towers imported successfully']);
    }

    public function ImportTowersFromExcelFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:json|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $file = $request->file('file');

        // Use FastExcel to read the Excel file
        $worksheet1Data = (new FastExcel)->import($file->getRealPath());

        $worksheet2Data = (new FastExcel)->sheet(2)->import($file->getRealPath());

        DB::table('towers')->truncate();

        // Perform necessary processing with the data from the second worksheet
        foreach ($worksheet1Data as $row) {
            Tower::create($row);
        }

        DB::table('tower_activities')->truncate();

        foreach ($worksheet2Data as $row) {

            $itemId = 0;

            foreach ($row as $key => $value) {
                if($itemId > 1){

                    $result;
                    if($value == null){
                        $result = null;
                    }else{
                        if(Functions::isDate($value) && $value !== ""){

                            $result = Carbon::parse($value);
                            $result = $result->toArray()['formatted'];
                            $carbonDate = Carbon::parse($result);
                            $formattedDate = $carbonDate->format('y-m-d');
                            $result = Carbon::parse($formattedDate);

                        }else{
                            $result = null;
                        }
                    }


                    $activitie = new TowerActivity();
                    $activitie->ProjectName =  $row['ProjectName'];
                    $activitie->Number =  $row['Number'];
                    $activitie->Activitie =  $key;
                    $activitie->ConclusionDate = $result;
                    $activitie->save();
                }
                $itemId++;
            }
        }

        return response()->json(['message' => 'Towers imported successfully']);
    }


    public function ImportTowersImpedimentsFromExcelFile(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');

        // Use FastExcel to read the Excel file
        $worksheet3Data = (new FastExcel)->sheet(3)->import($file->getRealPath());

        DB::table('tower_impediments')->truncate();

        // Perform necessary processing with the data from the second worksheet
        foreach ($worksheet3Data as $row) {
            TowerImpediment::create($row);
        }

        return response()->json(['message' => 'Towers Impediments imported successfully']);
    }

    public function GetUniqueProjects()
    {
        return response()->json(Tower::GetUniqueProjects());
    }

    public function GetTowersSolicitations($project = '')
    {
        return response()->json(Tower::countTowersByMonth($project));
    }
}
