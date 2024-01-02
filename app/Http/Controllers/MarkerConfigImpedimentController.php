<?php

namespace App\Http\Controllers;

use App\Models\MarkerConfigImpediment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MarkerConfigImpedimentController extends Controller
{
    public function index()
    {
        $markers = MarkerConfigImpediment::all();
        return response()->json($markers);
    }

    public function store(Request $request)
    {
        try {
            // Validation of fields
            $request->validate([
                'ImpedimentType' => 'required|string|max:255',
                'Status' => 'required|string|max:255',
                'Icon' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'IsBlocked' => 'required',
            ]);

            $validator = Validator::make($request->all(), [
                'ImpedimentType' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'Status' => 'required|string|max:255',
                'Icon' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'IsBlocked' =>'required|string|max:255',
            ], [], [
                'ImpedimentType' =>  'ImpedimentType',
                'Status' => 'Status',
                'Icon' => 'Icon',
                'IsBlocked' => 'IsBlocked'
            ]);

            // Get the icon file from the request
            $icon = $request->file('Icon');

            // Save the file in the storage/icons folder with a unique name
            $iconPath = $icon->storeAs('icons', uniqid('icon_', true) . '.' . $icon->getClientOriginalExtension(), 'public');

            // Create the marker with the request data and the icon path
            $marker = MarkerConfigImpediment::create([
                'ImpedimentType' => $request->input('ImpedimentType'),
                'Status' => $request->input('Status'),
                'Icon' => $iconPath,
                'IsBlocked' => $request->input('IsBlocked'),
            ]);

            return response()->json($marker, 201);
        } catch (\Exception $e) {
            // In case of an error, return an error response
            return response()->json(['error' => 'Error processing icon upload.'], 500);
        }
    }

    public function show($id)
    {
        $marker = MarkerConfigImpediment::findOrFail($id);
        return response()->json($marker);
    }

    public function update(Request $request, $id)
    {
        try {
            // Validation of fields
            $validator = Validator::make($request->all(), [
                'ImpedimentType' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'Status' => 'required|string|max:255',
                'Icon' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'IsBlocked' =>'required|string|max:255',
            ], [], [
                'ImpedimentType' =>  'ImpedimentType',
                'Status' => 'Status',
                'Icon' => 'Icon',
                'IsBlocked' => 'IsBlocked'
            ]);

            if(!$validator->passes()){
                return response()->json(['error' => $validator->errors()], 404);
            }


            // Get the marker by ID
            $marker = MarkerConfigImpediment::findOrFail((int)$id);

            // Update the ImpedimentType and Status, if provided
            $marker->ImpedimentType = $request->input('ImpedimentType');
            $marker->Status = $request->input('Status');
            $marker->IsBlocked = $request->input('IsBlocked');

            // If a new icon is provided, save it
            if ($request->hasFile('Icon')) {
                // Get the icon file from the request
                $icon = $request->file('Icon');

                // Save the file in the storage/icons folder with a unique name
                $iconPath = $icon->storeAs('icons', uniqid('icon_', true) . '.' . $icon->getClientOriginalExtension(), 'public');

                // Update the icon path
                $marker->Icon = $iconPath;
            }

            // Save the changes
            $marker->save();

            return response()->json($marker, 200);
        } catch (\Exception $e) {
            // In case of an error, return an error response
            return response()->json(['error' => $e], 500);
        }
    }

    public function destroy($id)
    {
        // Find the marker by ID
        $marker = MarkerConfigImpediment::find((int)$id);

        // Check if the marker exists
        if (!$marker) {
            return response()->json(['error' => 'Marker not found.'], 404);
        }

        // Delete the associated file from storage
        Storage::disk('public')->delete($marker->Icon);

        // Delete the marker from the database
        $marker->delete();

        // Respond with a success message
        return response()->json(['message' => 'Marker deleted successfully.'], 204);
    }
}
