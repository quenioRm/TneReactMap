<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Http\Controllers\TowerController;

class TowerSeeder extends Seeder
{
    public function run()
    {
        $controller = new TowerController();
        $controller->importTowers();
    }
}
