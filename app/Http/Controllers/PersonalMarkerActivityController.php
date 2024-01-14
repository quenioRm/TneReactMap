<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\PersonalMarkerActivity;

class PersonalMarkerActivityController extends Controller
{
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
                'personalMarkerId' => 'required|integer',
                'unity' => 'required|string|max:255',
                'previouscount' => 'required|integer',
                'lenPercent' => 'required|numeric',
                'icon' => 'required|string',
            ]);

            if (!$validator->passes()) {
                return response()->json(['error' => $validator->errors()], 404);
            }

            // Crie a atividade com os dados do request
            $activity = PersonalMarkerActivity::create([
                'personalMarkerId' => $request->input('personalMarkerId'),
                'unity' => $request->input('unity'),
                'previouscount' => $request->input('previouscount'),
                'lenPercent' => $request->input('lenPercent'),
                'icon' => $request->input('icon')
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
                'personalMarkerId' => 'required|integer',
                'unity' => 'required|string|max:255',
                'previouscount' => 'required|integer',
                'lenPercent' => 'required|numeric',
                'icon' => 'required|string',
            ]);

            if (!$validator->passes()) {
                return response()->json(['error' => $validator->errors()], 404);
            }

            // Obtenha a atividade pelo ID
            $activity = PersonalMarkerActivity::findOrFail((int) $id);

            // Atualize os dados da atividade com base no request
            $activity->update($request->all());

            return response()->json($activity, 200);
        } catch (\Exception $e) {
            // Em caso de erro, retorne uma resposta de erro
            return response()->json(['error' => $e], 500);
        }
    }

    public function destroy($id)
    {
        // Find the activity by ID
        $activity = PersonalMarkerActivity::find($id);

        // Check if the activity exists
        if (!$activity) {
            return response()->json(['error' => 'Registro não encontrado!.'], 404);
        }

        // Delete the activity from the database
        $activity->delete();

        // Respond with a success message
        return response()->json(['message' => 'Registro deletado com sucesso!.'], 204);
    }
}
