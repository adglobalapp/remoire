<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
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
        'anniversaries_checked_on',
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

        return User::whereIn('id', function ($query) use ($id) {
            $query->select('target_id')->from('relationships')->where(['user_id' => $id, 'status' => 'accepted'])
                ->union($query->newQuery()->select('user_id')->from('relationships')->where(['target_id' => $id, 'status' => 'accepted']));
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

    /**
     * Runs the anniversary check at most once per day for this user.
     *
     * The day is claimed with a single conditional UPDATE, so parallel requests
     * cannot create duplicate notifications, and a notification the user deleted
     * is not recreated on the next request.
     */
    public function checkAnniversariesOncePerDay()
    {
        $today = now()->toDateString();

        $claimed = static::whereKey($this->id)
            ->where(fn ($query) => $query->whereNull('anniversaries_checked_on')->orWhere('anniversaries_checked_on', '<', $today))
            ->update(['anniversaries_checked_on' => $today]);

        if ($claimed) {
            $this->checkAnniversaries();
        }
    }

    public function checkAnniversaries()
    {
        try {
            $today = now();

            $anniversaries = $this->entries()
                ->whereYear('date', '<', $today->year)
                ->where(function ($query) use ($today) {
                    $query->where(fn ($q) => $q->whereMonth('date', $today->month)->whereDay('date', $today->day));

                    // Leap day memories are celebrated on February 28 in non-leap years
                    if (! $today->isLeapYear() && $today->month === 2 && $today->day === 28) {
                        $query->orWhere(fn ($q) => $q->whereMonth('date', 2)->whereDay('date', 29));
                    }
                })
                ->get();

            if ($anniversaries->isEmpty()) {
                return;
            }

            $sentEntryIds = Notification::where('user_id', $this->id)
                ->where('type', 'anniversary')
                ->whereDate('created_at', $today->toDateString())
                ->pluck('data->entry_id')
                ->toArray();

            foreach ($anniversaries as $entry) {
                if (in_array($entry->id, $sentEntryIds)) {
                    continue;
                }

                $years = $today->year - Carbon::parse($entry->date)->year;

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
        } catch (\Exception $e) {
            Log::error('Anniversary check failed: '.$e->getMessage());
        }
    }
}
