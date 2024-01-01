<?php

namespace App\Helpers;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
class Functions{

    public static function isDate($dateString)
    {
        try {
            Carbon::parse($dateString);
            return true; // Valid date
        } catch (\Exception $e) {
            return false; // Invalid date
        }
    }
}
