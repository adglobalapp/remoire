<?php

namespace App\Http\Controllers;

use App\Models\Relationship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar_url' => 'nullable|string',
        ]);

        if ($request->has('avatar_url')) {
            $newAvatar = $request->avatar_url;
            if ($user->avatar_url && $user->avatar_url !== $newAvatar) {
                $oldPath = str_replace(asset('storage/'), '', $user->avatar_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $user->avatar_url = $newAvatar;
        }

        $user->name = $request->name;
        $user->bio = $request->bio;
        $user->save();

        return response()->json([
            'message' => 'Profile updated',
            'user' => $user,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated',
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
            'message' => 'User unblocked',
        ]);
    }
}
