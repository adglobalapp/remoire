<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    /** @use HasFactory<\Database\Factories\EntryFactory> */
    use HasFactory;

    protected $fillable = ['title', 'date', 'content', 'image_url', 'user_id', 'color', 'location_name', 'latitude', 'longitude'];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($entry) {
            if ($entry->content) {
                $extracted = static::extractTitle($entry->content);
                $entry->title = $extracted ?: 'Untitled';
            } elseif (! $entry->title) {
                $entry->title = 'Untitled';
            }
        });
    }

    public static function extractTitle($content)
    {
        $data = json_decode($content, true);
        $json = $data['contentJSON'] ?? null;
        if (! $json) {
            return null;
        }

        $title = static::findFirstText($json);
        if (! $title) {
            return null;
        }

        return mb_strlen($title) > 50 ? mb_substr($title, 0, 50).'...' : $title;
    }

    private static function findFirstText($node)
    {
        if (isset($node['text']) && $text = trim($node['text'])) {
            return $text;
        }
        foreach ($node['content'] ?? [] as $child) {
            if ($found = static::findFirstText($child)) {
                return $found;
            }
        }

        return null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timelines()
    {
        return $this->belongsToMany(Timeline::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class);
    }
}
