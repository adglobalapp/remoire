<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EntryController extends Controller
{
    public function index()
    {
        return auth()->user()->entries()->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'date'    => 'required|date',
            'content' => 'nullable|string',
            'color'   => 'nullable|string',
            'cover_image' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $entry = Entry::create($validated);

        return response()->json($entry, 201);
    }

    public function show(Entry $entry)
    {
        if ($entry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $entry;
    }

    public function update(Request $request, Entry $entry)
    {
        if ($entry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'title'   => 'sometimes|string|max:255',
            'date'    => 'sometimes|date',
            'content' => 'nullable|string',
            'color'   => 'nullable|string',
            'cover_image' => 'nullable|string',
        ]);

        $entry->update($validated);

        return response()->json($entry);
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
