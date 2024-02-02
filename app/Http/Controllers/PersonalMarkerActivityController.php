<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\PersonalMarkerActivity;
use App\Models\PersonalMarkerProduction;
use Rap2hpoutre\FastExcel\FastExcel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PersonalMarkerActivityController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:isWriter')->except(['index', 'getAllProductionsByMarker', 'getAllByMarker']);
    }

    public function index()
    {
        $activities = PersonalMarkerActivity::all();
        return response()->json($activities);
    }

    // public function getAllByMarker($id)
    // {
    //     $activities = PersonalMarkerActivity::where('personalMarkerId', $id)->get();
    //     return response()->json($activities);
    // }

    public function getAllByMarker($id)
    {
        $cacheKey = 'getAllByMarker_' . $id;

        // Try to get the data from the cache
        $activities = Cache::remember($cacheKey, now()->addMinutes(360), function () use ($id) {
            // If data is not found in the cache, retrieve it from the database
            return PersonalMarkerActivity::where('personalMarkerId', $id)->get();
        });

        return response()->json($activities);
    }

    public function store(Request $request)
    {
        // try {
            // Validação dos campos
            $validator = Validator::make($request->all(), [
                'personalMarkerId' => 'required|integer',
                'activity' => 'required|string|max:255|unique:personal_marker_activity,activity',
                'unity' => 'required|string|max:255',
                'previouscount' => 'required|numeric',
                'lenPercent' => 'required|numeric',
                'icon' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [], [
                'activity' =>  'atividade',
                'unity' => 'unidade',
                'previouscount' => 'quantidade prevista',
                'lenPercent' => '% avanço',
                'icon' => 'icone',
            ]);

            if (!$validator->passes()) {
                return response()->json(['error' => $validator->errors()], 404);
            }

            // Obtenha o arquivo de ícone do request
            $icone = $request->file('icon');

            // Salve o arquivo na pasta storage/icons com um nome único
            $iconePath = $icone->storeAs('icons', uniqid('icone_', true) . '.' . $icone->getClientOriginalExtension(), 'public');

            // Crie a atividade com os dados do request
            $activity = PersonalMarkerActivity::create([
                'personalMarkerId' => (int)$request->input('personalMarkerId'),
                'activity' => $request->input('activity'),
                'unity' => $request->input('unity'),
                'previouscount' => floatval($request->input('previouscount')),
                'lenPercent' => floatval($request->input('lenPercent')),
                'icon' => $iconePath
            ]);

            return response()->json($activity, 201);
        // } catch (\Exception $e) {
        //     // Em caso de erro, retorne uma resposta de erro
        //     return response()->json(['error' => 'Erro ao processar a atividade.'], 500);
        // }
    }

    public function show($id)
    {
        $activity = PersonalMarkerActivity::findOrFail($id);
        return response()->json($activity);
    }

    public function update(Request $request, $id)
    {
        try {
            // Validação dos campos
            $validator = Validator::make($request->all(), [
                'personalMarkerId' => 'required|integer',
                'activity' => [
                    'required',
                    'string',
                    'max:255',
                    // Rule::unique('personal_marker_activity')->ignore($id),
                ],
                'unity' => 'required|string|max:255',
                'previouscount' => 'required|numeric',
                'lenPercent' => 'required|numeric',
                'icon' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [], [
                'activity' =>  'atividade',
                'unity' => 'unidade',
                'previouscount' => 'quantidade prevista',
                'lenPercent' => '% avanço',
                'icon' => 'icone',
            ]);

            if (!$validator->passes()) {
                return response()->json(['error' => $validator->errors()], 404);
            }

            // Obtenha a atividade pelo ID
            $activity = PersonalMarkerActivity::findOrFail((int) $id);

            // Atualize a atividade, se fornecida
            $activity->activity = $request->input('activity');
            $activity->unity = $request->input('unity');
            $activity->previouscount = $request->input('previouscount');
            $activity->lenPercent = $request->input('lenPercent');

            // Se um novo ícone for fornecido, salve-o
            if ($request->hasFile('icon')) {
                // Obtenha o arquivo de ícone do request
                $icone = $request->file('icon');

                // Salve o arquivo na pasta storage/icons com um nome único
                $iconePath = $icone->storeAs('icons', uniqid('icone_', true) . '.' . $icone->getClientOriginalExtension(), 'public');

                // Atualize o caminho do ícone
                $activity->icon = $iconePath;
            }

            $activity->save();

            return response()->json($activity, 200);
        } catch (\Exception $e) {
            // Em caso de erro, retorne uma resposta de erro
            return response()->json(['error' => $e], 500);
        }
    }

    public function destroy($id)
    {
        // Find the marker by ID
        $marker = PersonalMarkerActivity::find($id);

        // Check if the marker exists
        if (!$marker) {
            return response()->json(['error' => 'Registro não encontrado!.'], 404);
        }

        // Delete the associated file from storage
        Storage::disk('public')->delete($marker->icon);

        // Delete the marker from the database
        $marker->delete();

        // Respond with a success message
        return response()->json(['message' => 'Registro deletado com sucesso!.'], 204);
    }

    public function importPersonalProductionFromExcelFile(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');

        // Use FastExcel to read the Excel file
        $worksheet3Data = (new FastExcel)->sheet(4)->import($file->getRealPath());

        DB::table('personal_markers_production')->truncate();

        // Perform necessary processing with the data from the second worksheet
        foreach ($worksheet3Data as $row) {
            $activitie = new PersonalMarkerProduction();
            $activitie->name =  $row['Nome'];
            $activitie->activity =  $row['Atividade'];
            $activitie->conclusionDate =  $row['Data'];
            $activitie->count = $row['Quantidade Realizada'];
            $activitie->save();
        }

        return response()->json(['message' => 'Produção Importada com sucesso!']);
    }

    // public function getAllProductionsByMarker($name)
    // {
    //     $activities = PersonalMarkerProduction::where('name', $name)->get();
    //     return response()->json($activities);
    // }

    public function getAllProductionsByMarker($name)
    {
        $cacheKey = 'getAllProductionsByMarker_' . $name;

        // Try to get the data from the cache
        $activities = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($name) {
            // If data is not found in the cache, retrieve it from the database
            return PersonalMarkerProduction::where('name', $name)->get();
        });

        return response()->json($activities);
    }
}
