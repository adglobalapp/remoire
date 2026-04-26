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

        $message = 'Profile updated';
        if ($request->has('avatar_url')) {
            $message = $request->avatar_url ? 'Avatar updated' : 'Avatar removed';
        }

        return response()->json([
            'message' => $message,
            'user' => $user,
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors()->toArray();

            if (isset($errors['password'])) {
                $confirmErrors = [];
                $passwordErrors = [];

                foreach ($errors['password'] as $msg) {
                    if (str_contains(strtolower($msg), 'confirmation')) {
                        $confirmErrors[] = $msg;
                    } else {
                        $passwordErrors[] = $msg;
                    }
                }

                if (! empty($confirmErrors)) {
                    $errors['password'] = empty($passwordErrors) ? [''] : $passwordErrors;
                    $errors['password_confirmation'] = $confirmErrors;
                }
            }

            return response()->json([
                'message' => 'The given data was invalid',
                'errors' => $errors,
            ], 422);
        }

        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated'], 200);
    }

    public function blockedUsers()
    {
        $user = Auth::user();

        $blocked = Relationship::where('user_id', $user->id)
            ->where('status', 'blocked')
            ->with('target')
            ->get()
            ->pluck('target');

        return response()->json($blocked, 200);
    }

    public function unblock(User $user)
    {
        $currentUser = Auth::user();

        Relationship::where('user_id', $currentUser->id)
            ->where('target_id', $user->id)
            ->where('status', 'blocked')
            ->delete();

        return response()->json(['message' => 'User unblocked'], 200);
    }
}
