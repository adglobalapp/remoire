<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Relationship extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'target_id',
        'status',
    ];

    public function scopeBetween($query, $user1, $user2)
    {
        return $query->where(function ($innerQuery) use ($user1, $user2) {
            $innerQuery->where('user_id', $user1)->where('target_id', $user2);
        })->orWhere(function ($innerQuery) use ($user1, $user2) {
            $innerQuery->where('user_id', $user2)->where('target_id', $user1);
        });
    }

    public function scopeNotBlockedBy($query, $userId)
    {
        return $query->where(function ($innerQuery) use ($userId) {
            $innerQuery->where('status', '!=', 'blocked')->orWhere('user_id', '!=', $userId);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function target()
    {
        return $this->belongsTo(User::class, 'target_id');
    }
}
