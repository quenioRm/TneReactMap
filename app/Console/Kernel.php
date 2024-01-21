<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Http\Controllers\MapsController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            // Retrieve the cache value
            $cacheValue = Cache::get('coordinates_data_general');

            // Check if the cache value exists
            if ($cacheValue === null) {
                // The cache key doesn't exist, so execute the function from the controller
                $mapsController = new MapsController();
                $mapsController->getCoordinates();
            } else {
                // Calculate the remaining time until expiration
                $now = now()->timestamp;
                $expirationTimestamp = $cacheValue['expiration'];
                $ttl = $expirationTimestamp - $now;

                // If the remaining time is less than or equal to zero, execute the function from the controller
                if ($ttl <= 0) {
                    $mapsController = new MapsController();
                    $mapsController->getCoordinates();
                } else {
                    // Log a message indicating that the function wasn't executed due to valid cache
                    Log::info('The MapsController::getCoordinates function was not executed due to a valid cache.');
                }
            }
        })->everyMinute(30);
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
