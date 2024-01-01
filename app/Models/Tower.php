<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tower extends Model
{
    use HasFactory;

    protected $table = 'towers';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = [
        'ProjectName',
        'Number',
        'Name',
        'Distance',
        'SolicitationDate',
        'ReceiveDate',
        'CoordinateX',
        'CoordinateY',
        'CoordinateZ',
        'Zone',
    ];
}
