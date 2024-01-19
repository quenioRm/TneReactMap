<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapsController;
use App\Http\Controllers\MarkerConfigController;
use App\Http\Controllers\MarkerConfigImpedimentController;
use App\Http\Controllers\TowerController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\PersonalMarkerController;
use App\Http\Controllers\PersonalMarkerActivityController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [AuthenticatedSessionController::class, 'apiLogin']);

Route::get('/test/{id}', [MapsController::class, 'Test']);

Route::middleware(['auth:sanctum', 'role:confirmedUser'])->group(function () {

    Route::get('/get-coordinates', [MapsController::class, 'getCoordinates']);
    Route::post('/get-coordinatesbyrange', [MapsController::class, 'getCoordinatesByRange']);
    Route::post('/get-coordinatesbyrange-from-personal', [MapsController::class, 'getCoordinatesByAnotherMarkers']);
    Route::get('/get-towerimages/{tower}', [MapsController::class, 'getImagesFromTower']);

    Route::get('/get-towerimages-with-activity/{tower}/{activity}', [MapsController::class, 'getImagesFromMarkerWithActivity']);

    Route::post('/upload-images-with-activity', [MapsController::class, 'uploadGaleryImagesWithActivity']);

    Route::get('/get-towerproduction/{tower}/{project}', [MapsController::class, 'getTowerProduction']);

    Route::post('/delete-gallery-image-with-activity', [MapsController::class, 'deleteGalleryImageWithActivity']);

    Route::post('/delete-gallery-image-all', [MapsController::class, 'deleteFromSpecificGallery']);

    Route::post('/upload-images', [MapsController::class, 'uploadGaleryImages']);



    Route::post('/delete-gallery-image', [MapsController::class, 'deleteGalleryImage']);
    Route::get('/get-avc/{tower}/{project}', [MapsController::class, 'GetTowerAvc']);

    Route::get('/getlatesticons/{tower}/{project}', [MapsController::class, 'GetLatestIcons']);

    Route::get('towers/getuniqueprojects', [TowerController::class, 'GetUniqueProjects']);

    Route::get('towers/gettowers', [TowerController::class, 'GetTowers']);

    Route::get('towers/gettowerssolicitations/{project?}', [TowerController::class, 'GetTowersSolicitations']);

    Route::get('towers/getImpedimentsbytype/{project?}', [TowerController::class, 'countIsBlockedByType']);

    Route::get('production/getLatestProduction/{project?}', [ProductionController::class, 'getLatestProduction']);

    Route::get('production/getperiodProduction/{startDate}/{finishDate}/{project?}/', [ProductionController::class, 'getperiodProduction']);

    Route::post('production/getperiodproductionchartcompare',
        [ProductionController::class, 'getperiodProductionChartCompare']);


    ///// Markers Creation //////////////////////

    Route::resource('personalmarkers', PersonalMarkerController::class);
    Route::resource('personalmarkersactivity', PersonalMarkerActivityController::class);
    Route::get('personalmarkersactivity/getallbymarker/{id}', [PersonalMarkerActivityController::class, 'getAllByMarker']);
    Route::get('personalmarkersactivity/getAllproductionsbymarker/{name}', [PersonalMarkerActivityController::class, 'getAllProductionsByMarker']);
    Route::post('personalmarkersactivity/import', [PersonalMarkerActivityController::class, 'importPersonalProductionFromExcelFile']);
    Route::resource('markers', MarkerConfigController::class);
    Route::resource('markersimpediments', MarkerConfigImpedimentController::class);
    ////////////////////////////////////////////

    // Imports ///////////////////////////////////////////////////////////////////////////////////////////////
    Route::post('towers/import', [TowerController::class, 'ImportTowersFromExcelFile']);

    Route::post('towers/importimpediments', [TowerController::class, 'ImportTowersImpedimentsFromExcelFile']);
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

});

