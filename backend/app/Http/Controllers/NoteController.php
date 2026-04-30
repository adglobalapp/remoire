<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index()
    {
        return auth()->user()->notes()
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'is_pinned' => 'nullable|boolean',
        ]);

        $validated['user_id'] = $request->user()->id;

        $note = Note::create($validated);

        return response()->json(array_merge($note->toArray(), [
            'message' => 'Note created',
        ]), 201);
    }

    public function show(Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $note;
    }

    public function update(Request $request, Note $note)
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'is_pinned' => 'nullable|boolean',
        ]);

        $note->update($validated);

        return response()->json(array_merge($note->toArray(), [
            'message' => 'Note updated',
        ]), 200);
    }

    public function destroy(Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted'], 200);
    }
}
