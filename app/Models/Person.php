<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Person extends Model
{
    use HasFactory;

    protected $table = 'people';

    protected $primaryKey = 'idperson';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'employment',
        'state',
    ];

    public function getRouteKeyName(): string
    {
        return 'idperson';
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'idperson', 'idperson');
    }
}
