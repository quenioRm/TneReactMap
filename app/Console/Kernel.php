<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Http\Controllers\MapsController;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();

        // Exec Maps
        $schedule->call(function () {
            // Verifique se a chave do cache existe
            if (!Cache::has('coordinates_data_general')) {
                // A chave do cache não existe ou expirou, então execute a função do controller
                app()->call([MapsController::class, 'getCoordinates']);
            } else {
                // A chave do cache existe, verifique o tempo restante de vida
                $ttl = Cache::getTtl('coordinates_data_general');

                // Se o tempo restante de vida for menor ou igual a zero, execute a função do controller
                if ($ttl <= 0) {
                    app()->call([MapsController::class, 'getCoordinates']);
                }
            }
        })->twiceDaily(0, 12);
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
