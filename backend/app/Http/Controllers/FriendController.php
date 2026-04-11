<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return response()->json($user->friends()->get());
    }

    public function requests()
    {
        $user = Auth::user();

        $pending = $user->pendingFriendRequests()->get();
        $sent = $user->sentFriendRequests()->get();

        return response()->json([
            'pending' => $pending,
            'sent' => $sent,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->query('q');
        $currentUser = Auth::user();

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $blockedUserIds = Friend::where(function ($q) use ($currentUser) {
            $q->where('user_id', $currentUser->id)->orWhere('friend_id', $currentUser->id);
        })->where('status', 'blocked')->get()->map(function ($f) use ($currentUser) {
            return $f->user_id === $currentUser->id ? $f->friend_id : $f->user_id;
        });

        $users = User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('friend_code', $query);
        })
            ->where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $blockedUserIds)
            ->get();

        $users->map(function ($user) use ($currentUser) {
            $friendship = Friend::where(function ($q) use ($currentUser, $user) {
                $q->where('user_id', $currentUser->id)->where('friend_id', $user->id);
            })->orWhere(function ($q) use ($currentUser, $user) {
                $q->where('user_id', $user->id)->where('friend_id', $currentUser->id);
            })->first();

            $user->friend_status = $friendship ? $friendship->status : 'none';
            if ($user->friend_status === 'pending') {
                $user->is_requester = $friendship->user_id === $currentUser->id;
            }
            return $user;
        });

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $friendId = $request->friend_id;

        if ($user->id == $friendId) {
            return response()->json(['message' => 'You cannot friend yourself.'], 400);
        }

        $existing = Friend::where(function ($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($user, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Already friends or request pending.'], 400);
        }

        Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Friend request sent.']);
    }

    public function accept(User $user)
    {
        $currentUser = Auth::user();

        $friendship = Friend::where('user_id', $user->id)
            ->where('friend_id', $currentUser->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return response()->json(['message' => 'Friend request accepted.']);
    }

    public function destroy(User $user)
    {
        $currentUser = Auth::user();

        $friendship = Friend::where(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('friend_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $user->id)->where('friend_id', $currentUser->id);
        })->firstOrFail();

        $friendship->delete();

        return response()->json(['message' => 'Friendship removed/request rejected.']);
    }

    public function block(User $user)
    {
        $currentUser = Auth::user();

        $friendship = Friend::where(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('friend_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $user->id)->where('friend_id', $currentUser->id);
        })->first();

        if ($friendship) {
            $friendship->update([
                'user_id' => $currentUser->id,
                'friend_id' => $user->id,
                'status' => 'blocked'
            ]);
        } else {
            Friend::create([
                'user_id' => $currentUser->id,
                'friend_id' => $user->id,
                'status' => 'blocked'
            ]);
        }

        return response()->json(['message' => 'User blocked.']);
    }
}
