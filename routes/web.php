<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MapsController;
use App\Http\Controllers\MarkerConfigController;
use App\Http\Controllers\MarkerConfigImpedimentController;
use App\Http\Controllers\TowerController;
use App\Http\Controllers\ProductionController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Auth/Login', [ //wellcome
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/production', function () {
    return Inertia::render('Production');
})->middleware(['auth', 'verified'])->name('production');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware(['role:confirmedUser'])->group(function () {

    Route::get('/get-coordinates', [MapsController::class, 'getCoordinates']);
    Route::post('/get-coordinatesbyrange', [MapsController::class, 'getCoordinatesByRange']);
    Route::get('/get-towerimages/{tower}', [MapsController::class, 'getImagesFromTower']);
    Route::get('/get-towerproduction/{tower}/{project}', [MapsController::class, 'getTowerProduction']);
    Route::post('/upload-images', [MapsController::class, 'uploadGaleryImages']);

    Route::get('/getlatesticons/{tower}/{project}', [MapsController::class, 'GetLatestIcons']);

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

});

require __DIR__.'/auth.php';
