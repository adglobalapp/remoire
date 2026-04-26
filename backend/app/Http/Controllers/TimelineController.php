<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Timeline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TimelineController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $timelines = $user->timelines()->with('entries:id')->get();

        if ($timelines->isEmpty()) {
            $default = $user->timelines()->create([
                'name' => 'All Entries',
                'is_default' => true,
            ]);
            $default->load('entries:id');
            $timelines = collect([$default]);
        }

        return response()->json($timelines->map(function ($timeline) {
            return [
                'id' => $timeline->id,
                'name' => $timeline->name,
                'isDefault' => $timeline->is_default,
                'entryIds' => $timeline->entries->pluck('id'),
            ];
        }));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'isDefault' => 'boolean',
        ]);

        $timeline = Auth::user()->timelines()->create([
            'name' => $request->name,
            'is_default' => $request->isDefault ?? false,
        ]);

        return response()->json([
            'message' => 'Timeline created',
            'id' => $timeline->id,
            'name' => $timeline->name,
            'isDefault' => $timeline->is_default,
            'entryIds' => [],
        ], 201);
    }

    public function show(Timeline $timeline)
    {
        if ($timeline->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $timeline->load('entries');
    }

    public function update(Request $request, Timeline $timeline)
    {
        if ($timeline->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $request->validate([
            'name' => 'sometimes|string',
            'isDefault' => 'sometimes|boolean',
        ]);

        $timeline->update($request->only(['name', 'is_default']));

        return response()->json(array_merge($timeline->toArray(), [
            'message' => 'Timeline updated',
        ]), 200);
    }

    public function destroy(Request $request, Timeline $timeline)
    {
        if ($timeline->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($timeline->is_default) {
            return response()->json(['message' => 'Cannot delete default timeline'], 400);
        }

        $timeline->delete();

        return response()->json(['message' => 'Timeline deleted'], 200);
    }

    public function addEntry(Timeline $timeline, Entry $entry)
    {
        if ($timeline->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $isOwner = $entry->user_id === Auth::id();
        $isParticipant = $entry->participants()->where('users.id', Auth::id())->exists();

        if (! $isOwner && ! $isParticipant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $timeline->entries()->syncWithoutDetaching([$entry->id]);

        return response()->json(['message' => 'Entry added to timeline'], 200);
    }

    public function removeEntry(Timeline $timeline, Entry $entry)
    {
        if ($timeline->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $timeline->entries()->detach($entry->id);

        return response()->json(['message' => 'Entry removed from timeline'], 200);
    }
}
