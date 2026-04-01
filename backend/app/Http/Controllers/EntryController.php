<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function index()
    {
        return Entry::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'date'    => 'required|date',
            'content' => 'nullable|string',
            'user_id' => 'required|integer',
            'color'   => 'nullable|string',
            'cover_image' => 'nullable|string',
        ]);

        $entry = Entry::create($validated);

        return response()->json($entry, 201);
    }

    public function update(Request $request, Entry $entry)
    {
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
        $entry->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
