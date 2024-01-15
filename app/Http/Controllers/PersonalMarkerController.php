<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\PersonalMarker;

class PersonalMarkerController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:isWriter')->except('index');
    }

    public function index()
    {
        $markers = PersonalMarker::all();
        return response()->json($markers);
    }

    public function store(Request $request)
    {
        try {

            // Validação dos campos
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:personal_markers,name',
                'coordinateX' => 'required|string|max:255',
                'coordinateY' => 'required|string|max:255',
                'zone' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'icon' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [], [
                'name' =>  'nome',
                'coordinateX' => 'coordenada [X]',
                'coordinateY' => 'coordenada [Y]',
                'zone' => 'zona',
                'type' => 'tipo',
                'icon' => 'icone',
            ]);

            if(!$validator->passes()){
                return response()->json(['error' => $validator->errors()], 404);
            }

            // Obtenha o arquivo de ícone do request
            $icone = $request->file('icon');

            // Salve o arquivo na pasta storage/icons com um nome único
            $iconePath = $icone->storeAs('personalicons', uniqid('icone_', true) . '.' . $icone->getClientOriginalExtension(), 'public');

            // Crie o marcador com os dados do request e o caminho do ícone
            $marker = PersonalMarker::create([
                'name' => $request->input('name'),
                'coordinateX' => $request->input('coordinateX'),
                'coordinateY' => $request->input('coordinateY'),
                'zone' => $request->input('zone'),
                'type' => $request->input('type'),
                'icon' => $iconePath
            ]);

            return response()->json($marker, 201);
        } catch (\Exception $e) {
            // Em caso de erro, retorne uma resposta de erro
            return response()->json(['error' => 'Erro ao processar o upload do ícone.'], 500);
        }
    }

    public function show($id)
    {
        $marker = PersonalMarker::findOrFail($id);
        return response()->json($marker);
    }

    public function update(Request $request, $id)
    {
        try {
            // Validação dos campos
            $validator = Validator::make($request->all(), [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('personal_markers')->ignore($id),
                ],
                'coordinateX' => 'required|string|max:255',
                'coordinateY' => 'required|string|max:255',
                'zone' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'icon' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [], [
                'name' =>  'nome',
                'coordinateX' => 'coordenada [X]',
                'coordinateY' => 'coordenada [Y]',
                'zone' => 'zona',
                'type' => 'tipo',
                'icon' => 'icone',
            ]);

            if(!$validator->passes()){
                return response()->json(['error' => $validator->errors()], 404);
            }

            // Obtenha o marcador pelo ID
            $marker = PersonalMarker::findOrFail((int)$id);

            // Atualize a atividade, se fornecida
            $marker->name = $request->input('name');
            $marker->coordinateX = $request->input('coordinateX');
            $marker->coordinateY = $request->input('coordinateY');
            $marker->zone = $request->input('zone');
            $marker->type = $request->input('type');

            // Se um novo ícone for fornecido, salve-o
            if ($request->hasFile('icon')) {
                // Obtenha o arquivo de ícone do request
                $icone = $request->file('icon');

                // Salve o arquivo na pasta storage/icons com um nome único
                $iconePath = $icone->storeAs('personalicons', uniqid('icone_', true) . '.' . $icone->getClientOriginalExtension(), 'public');

                // Atualize o caminho do ícone
                $marker->icone = $iconePath;
            }

            // Salve as alterações
            $marker->save();

            return response()->json($marker, 200);
        } catch (\Exception $e) {
            // Em caso de erro, retorne uma resposta de erro
            return response()->json(['error' => $e], 500);
        }
    }

    public function destroy($id)
    {
        // Find the marker by ID
        $marker = PersonalMarker::find($id);

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
