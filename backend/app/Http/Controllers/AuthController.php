<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
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

                if (!empty($confirmErrors)) {
                    $errors['password'] = empty($passwordErrors) ? [''] : $passwordErrors;
                    $errors['password_confirmation'] = $confirmErrors;
                }
            }

            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $errors,
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
                'errors' => [
                    'email' => [''],
                    'password' => ['The provided credentials are incorrect.'],
                ],
            ], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['last_seen_at' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
