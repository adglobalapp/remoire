<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EntryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $owned = $user->entries()->with('participants')->get();
        $participated = $user->participatedEntries()->with('participants')->get();

        $allEntries = $owned->concat($participated)
            ->unique('id')
            ->sortByDesc('created_at')
            ->values();

        return $allEntries;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'date' => 'required|date',
            'content' => 'nullable|string',
            'color' => 'nullable|string',
            'image_url' => 'nullable|string',
            'location_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $validated['user_id'] = $request->user()->id;

        $entry = Entry::create($validated);

        if ($request->has('participant_ids')) {
            $entry->participants()->sync($request->participant_ids);
        }

        return response()->json(array_merge($entry->load('participants')->toArray(), [
            'message' => 'Entry created',
        ]), 201);
    }

    public function show(Entry $entry)
    {
        $user = Auth::user();

        $isOwner = $entry->user_id === $user->id;
        $isParticipant = $entry->participants()->where('users.id', $user->id)->exists();

        if (! $isOwner && ! $isParticipant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $entry->load('participants');
    }

    public function update(Request $request, Entry $entry)
    {
        if ($entry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'date' => 'sometimes|date',
            'content' => 'nullable|string',
            'color' => 'nullable|string',
            'image_url' => 'nullable|string',
            'location_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $oldImages = $this->getAllImages($entry);
        $oldParticipantCount = $entry->participants()->count();
        $entry->update($validated);
        $newImages = $this->getAllImages($entry);

        $toDelete = array_diff($oldImages, $newImages);
        foreach ($toDelete as $path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }

        if ($request->has('participant_ids')) {
            $entry->participants()->sync($request->participant_ids);
        }

        $message = 'Entry updated';
        if ($request->hasAny(['location_name', 'latitude', 'longitude'])) {
            $message = $request->location_name ? 'Location updated' : 'Location removed';
        } elseif ($request->has('participant_ids')) {
            $newCount = count($request->participant_ids);
            if ($newCount > $oldParticipantCount) {
                $message = 'Participant added';
            } elseif ($newCount < $oldParticipantCount) {
                $message = 'Participant removed';
            }
        } elseif ($request->has('date')) {
            $message = 'Date updated';
        }

        return response()->json(array_merge($entry->load('participants')->toArray(), [
            'message' => $message,
        ]), 200);
    }

    public function destroy(Entry $entry)
    {
        if ($entry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $images = $this->getAllImages($entry);
        foreach ($images as $path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }

        $entry->delete();

        return response()->json(['message' => 'Entry deleted'], 200);
    }

    private function getAllImages(Entry $entry)
    {
        $images = [];
        $storageUrl = asset('storage/');

        if ($entry->image_url) {
            $images[] = str_replace($storageUrl, '', $entry->image_url);
        }

        if ($entry->content) {
            $pattern = '/'.preg_quote($storageUrl, '/').'([a-zA-Z0-9\/\._-]+)/';
            if (preg_match_all($pattern, $entry->content, $matches)) {
                $images = array_merge($images, $matches[1]);
            }
        }

        return array_unique($images);
    }
}
