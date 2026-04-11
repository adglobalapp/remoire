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
        
        return $owned->concat($participated)
            ->unique('id')
            ->sortByDesc('date')
            ->values();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'   => 'nullable|string|max:255',
            'date'    => 'required|date',
            'content' => 'nullable|string',
            'color'   => 'nullable|string',
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

        return response()->json($entry->load('participants'), 201);
    }

    public function show(Entry $entry)
    {
        $user = Auth::user();
        
        $isOwner = $entry->user_id === $user->id;
        $isParticipant = $entry->participants()->where('users.id', $user->id)->exists();

        if (!$isOwner && !$isParticipant) {
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
            'title'   => 'nullable|string|max:255',
            'date'    => 'sometimes|date',
            'content' => 'nullable|string',
            'color'   => 'nullable|string',
            'image_url' => 'nullable|string',
            'location_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $entry->update($validated);

        if ($request->has('participant_ids')) {
            $entry->participants()->sync($request->participant_ids);
        }

        return response()->json($entry->load('participants'));
    }

    public function destroy(Entry $entry)
    {
        if ($entry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $entry->delete();

        return response()->json(['message' => 'Deleted']);
    }

}
