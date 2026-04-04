<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
        'friend_code',
        'bio',
        'last_seen_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
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
            if (!$user->friend_code) {
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

    public function timelines()
    {
        return $this->hasMany(Timeline::class);
    }

    public function friends()
    {
        $userId = $this->id;

        return User::whereIn('id', function ($query) use ($userId) {
            $query->select('friend_id')
                ->from('friends')
                ->where('user_id', $userId)
                ->where('status', 'accepted')
                ->union(
                    $query->newQuery()
                        ->select('user_id')
                        ->from('friends')
                        ->where('friend_id', $userId)
                        ->where('status', 'accepted')
                );
        });
    }

    public function friendships()
    {
        return $this->hasMany(Friend::class , 'user_id')->orWhere('friend_id', $this->id);
    }

    public function pendingFriendRequests()
    {
        return $this->belongsToMany(User::class , 'friends', 'friend_id', 'user_id')
            ->wherePivot('status', 'pending')
            ->withTimestamps();
    }

    public function sentFriendRequests()
    {
        return $this->belongsToMany(User::class , 'friends', 'user_id', 'friend_id')
            ->wherePivot('status', 'pending')
            ->withTimestamps();
    }

    public function getAvatarUrlAttribute($value)
    {
        if (!$value) {
            return asset('images/no_profile.jpg');
        }

        if (str_starts_with($value, 'http')) {
            return $value;
        }

        return asset(ltrim($value, '/'));
    }
}
