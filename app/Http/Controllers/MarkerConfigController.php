<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marker;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MarkerConfigController extends Controller
{
    public function index()
    {
        $markers = Marker::all();
        return response()->json($markers);
    }

    public function store(Request $request)
    {
        try {
            // Validação dos campos
            $request->validate([
                'atividade' => 'required|string|max:255|unique:markerconfig,atividade',
                'unidade' => 'required|string|max:255',
                'icone' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Adapte conforme necessário
            ]);

            // Obtenha o arquivo de ícone do request
            $icone = $request->file('icone');

            // Salve o arquivo na pasta storage/icons com um nome único
            $iconePath = $icone->storeAs('icons', uniqid('icone_', true) . '.' . $icone->getClientOriginalExtension(), 'public');

            // Crie o marcador com os dados do request e o caminho do ícone
            $marker = Marker::create([
                'atividade' => $request->input('atividade'),
                'unidade' => $request->input('unidade'),
                'icone' => $iconePath
            ]);

            return response()->json($marker, 201);
        } catch (\Exception $e) {
            // Em caso de erro, retorne uma resposta de erro
            return response()->json(['error' => 'Erro ao processar o upload do ícone.'], 500);
        }
    }

    public function show($id)
    {
        $marker = Marker::findOrFail($id);
        return response()->json($marker);
    }

    public function update(Request $request, $id)
    {
        try {
            // Validação dos campos
            $request->validate([
                'atividade' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('markerconfig')->ignore($id),
                ],
                'unidade' => 'required|string|max:255',
                'icone' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Obtenha o marcador pelo ID
            $marker = Marker::findOrFail((int)$id);

            // Atualize a atividade, se fornecida
            $marker->atividade = $request->input('atividade');
            $marker->unidade = $request->input('unidade');

            // Se um novo ícone for fornecido, salve-o
            if ($request->hasFile('icone')) {
                // Obtenha o arquivo de ícone do request
                $icone = $request->file('icone');

                // Salve o arquivo na pasta storage/icons com um nome único
                $iconePath = $icone->storeAs('icons', uniqid('icone_', true) . '.' . $icone->getClientOriginalExtension(), 'public');

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
        $marker = Marker::find($id);

        // Check if the marker exists
        if (!$marker) {
            return response()->json(['error' => 'Marker not found.'], 404);
        }

        // Delete the associated file from storage
        Storage::disk('public')->delete($marker->icone);

        // Delete the marker from the database
        $marker->delete();

        // Respond with a success message
        return response()->json(['message' => 'Marker deleted successfully.'], 204);
    }
}
