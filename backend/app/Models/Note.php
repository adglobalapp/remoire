<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'color',
        'is_pinned'
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'content' => 'string'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
