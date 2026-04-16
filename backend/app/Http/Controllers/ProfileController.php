<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Relationship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar_url' => 'nullable|string',
        ]);

        $user->update($request->only('name', 'bio', 'avatar_url'));

        return response()->json([
            'message' => 'Profile updated',
            'user' => $user
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        /** @var User $user */
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated'
        ]);
    }

    public function blockedUsers()
    {
        $user = Auth::user();

        $blocked = Relationship::where('user_id', $user->id)
            ->where('status', 'blocked')
            ->with('target')
            ->get()
            ->pluck('target');

        return response()->json($blocked);
    }

    public function unblock(User $user)
    {
        $currentUser = Auth::user();

        Relationship::where('user_id', $currentUser->id)
            ->where('target_id', $user->id)
            ->where('status', 'blocked')
            ->delete();

        return response()->json([
            'message' => 'User unblocked'
        ]);
    }
}
