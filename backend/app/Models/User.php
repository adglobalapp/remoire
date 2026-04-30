<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
        'friend_code',
        'bio',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_seen_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (! $user->friend_code) {
                $user->friend_code = static::generateUniqueFriendCode();
            }
        });
    }

    public static function generateUniqueFriendCode()
    {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        } while (static::where('friend_code', $code)->exists());

        return $code;
    }

    public function entries()
    {
        return $this->hasMany(Entry::class);
    }

    public function participatedEntries()
    {
        return $this->belongsToMany(Entry::class, 'entry_user');
    }

    public function timelines()
    {
        return $this->hasMany(Timeline::class);
    }

    public function friends()
    {
        $id = $this->id;

        return User::whereIn('id', function ($q) use ($id) {
            $q->select('target_id')->from('relationships')->where(['user_id' => $id, 'status' => 'accepted'])
                ->union($q->newQuery()->select('user_id')->from('relationships')->where(['target_id' => $id, 'status' => 'accepted']));
        });
    }

    public function pendingFriendRequests()
    {
        return $this->belongsToMany(User::class, 'relationships', 'target_id', 'user_id')
            ->wherePivot('status', 'pending')
            ->withTimestamps();
    }

    public function sentFriendRequests()
    {
        return $this->belongsToMany(User::class, 'relationships', 'user_id', 'target_id')
            ->wherePivot('status', 'pending')
            ->withTimestamps();
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function checkAnniversaries()
    {
        try {
            $anniversaries = $this->entries()
                ->whereMonth('date', now()->month)
                ->whereDay('date', now()->day)
                ->whereYear('date', '<', now()->year)
                ->get();

            foreach ($anniversaries as $entry) {
                $exists = Notification::where('user_id', $this->id)
                    ->where('type', 'anniversary')
                    ->where('data->entry_id', $entry->id)
                    ->whereDate('created_at', now()->toDateString())
                    ->exists();

                if (! $exists) {
                    $years = now()->year - \Carbon\Carbon::parse($entry->date)->year;
                    Notification::create([
                        'user_id' => $this->id,
                        'type' => 'anniversary',
                        'data' => [
                            'entry_id' => $entry->id,
                            'entry_title' => $entry->title,
                            'years' => $years,
                        ],
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Anniversary check failed: '.$e->getMessage());
        }
    }
}
