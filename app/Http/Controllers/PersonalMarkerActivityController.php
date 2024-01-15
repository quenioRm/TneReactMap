<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\PersonalMarkerActivity;

class PersonalMarkerActivityController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:isWriter')->except('index');
    }

    public function index()
    {
        $activities = PersonalMarkerActivity::all();
        return response()->json($activities);
    }

    public function store(Request $request)
    {
        try {
            // Validação dos campos
            $validator = Validator::make($request->all(), [
                'activity' => 'required|string|max:255|unique:personal_marker_activity,activity',
                'unity' => 'required|string|max:255',
                'previouscount' => 'required|integer',
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
                'activity' => $request->input('activity'),
                'unity' => $request->input('unity'),
                'previouscount' => $request->input('previouscount'),
                'lenPercent' => $request->input('lenPercent'),
                'icon' => $iconePath
            ]);

            return response()->json($activity, 201);
        } catch (\Exception $e) {
            // Em caso de erro, retorne uma resposta de erro
            return response()->json(['error' => 'Erro ao processar a atividade.'], 500);
        }
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
                'activity' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('personal_marker_activity')->ignore($id),
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
}
