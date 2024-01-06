<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapsController;
use App\Http\Controllers\MarkerConfigController;
use App\Http\Controllers\MarkerConfigImpedimentController;
use App\Http\Controllers\TowerController;
use App\Http\Controllers\ProductionController;

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

Route::get('/get-coordinates', [MapsController::class, 'getCoordinates']);
Route::post('/get-coordinatesbyrange', [MapsController::class, 'getCoordinatesByRange']);
Route::get('/get-towerimages/{tower}', [MapsController::class, 'getImagesFromTower']);
Route::get('/get-towerproduction/{tower}/{project}', [MapsController::class, 'getTowerProduction']);
Route::post('/upload-images', [MapsController::class, 'uploadGaleryImages']);


Route::resource('markers', MarkerConfigController::class);

Route::resource('markersimpediments', MarkerConfigImpedimentController::class);

Route::post('towers/import', [TowerController::class, 'ImportTowersFromExcelFile']);

Route::post('towers/importimpediments', [TowerController::class, 'ImportTowersImpedimentsFromExcelFile']);

Route::get('towers/getuniqueprojects', [TowerController::class, 'GetUniqueProjects']);

Route::get('towers/gettowers', [TowerController::class, 'GetTowers']);

Route::get('towers/gettowerssolicitations/{project?}', [TowerController::class, 'GetTowersSolicitations']);

Route::get('production/getLatestProduction/{project?}', [ProductionController::class, 'getLatestProduction']);

Route::get('production/getperiodProduction/{startDate}/{finishDate}/{project?}/', [ProductionController::class, 'getperiodProduction']);

Route::post('production/getperiodproductionchartcompare',
    [ProductionController::class, 'getperiodProductionChartCompare']);
