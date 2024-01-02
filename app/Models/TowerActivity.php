<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TowerActivity extends Model
{
    use HasFactory;

    protected $table = 'tower_activities';
    protected $primaryKey = 'id';
    protected $dates = ['created_at','updated_at'];
    protected $fillable = ['ProjectName', 'Number', 'Activitie', 'ConclusionDate'];

    public function tower()
    {
        return $this->belongsTo(Tower::class, 'ProjectName', 'ProjectName')
                    ->where('Number', $this->Number);
    }
}
