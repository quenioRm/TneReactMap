<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Effective;

class EffectiveController extends Controller
{
    public function getEffective()
    {
        return Effective::get();
    }

    public function ImportEffectiveFromExcelFile(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');

        // Use FastExcel to read the Excel file
        $worksheet3Data = (new FastExcel)->sheet(6)->import($file->getRealPath());

        DB::table('effective')->truncate();

        // Perform necessary processing with the data from the second worksheet
        foreach ($worksheet3Data as $row) {

            if ($row['Empresa'] !== ""){
                $effective = new Effective();
                $effective->activity =  $row['Projeto/Atividade'];
                $effective->business =  $row['Empresa'];
                $effective->direct =  ($row['Indireto'] === '') ? 0 : $row['Indireto'];
                $effective->indirect = ($row['Direto'] === '') ? 0 : $row['Direto'];
                $effective->machinescount = ($row['Veículos/Equipamentos'] === '') ? 0 : $row['Veículos/Equipamentos'];
                $effective->save();
            }

        }

        return response()->json(['message' => 'Effective Imported successfully']);
    }
}
