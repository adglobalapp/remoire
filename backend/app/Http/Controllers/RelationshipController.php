<?php

namespace App\Http\Controllers;

use App\Models\Relationship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RelationshipController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return response()->json($user->friends()->get(), 200);
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
            return response()->json([], 200);
        }

        $blockedUserIds = Relationship::where(function ($q) use ($currentUser) {
            $q->where('user_id', $currentUser->id)->orWhere('target_id', $currentUser->id);
        })->where('status', 'blocked')->get()->map(function ($f) use ($currentUser) {
            return $f->user_id === $currentUser->id ? $f->target_id : $f->user_id;
        });

        $users = User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('friend_code', $query);
        })
            ->where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $blockedUserIds)
            ->get();

        $userIds = $users->pluck('id');
        $relationships = Relationship::where(function ($q) use ($currentUser, $userIds) {
            $q->where('user_id', $currentUser->id)->whereIn('target_id', $userIds);
        })->orWhere(function ($q) use ($currentUser, $userIds) {
            $q->whereIn('user_id', $userIds)->where('target_id', $currentUser->id);
        })->get();

        $users->map(function ($user) use ($currentUser, $relationships) {
            $relationship = $relationships->first(function ($r) use ($currentUser, $user) {
                return ($r->user_id === $currentUser->id && $r->target_id === $user->id) ||
                    ($r->user_id === $user->id && $r->target_id === $currentUser->id);
            });

            $user->relationship_status = $relationship ? $relationship->status : 'none';
            if ($user->relationship_status === 'pending') {
                $user->is_requester = $relationship->user_id === $currentUser->id;
            }

            return $user;
        });

        return response()->json($users, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'target_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $targetId = $request->target_id;

        if ($user->id == $targetId) {
            return response()->json(['message' => 'You cannot connect with yourself'], 400);
        }

        $existing = Relationship::where(function ($q) use ($user, $targetId) {
            $q->where('user_id', $user->id)->where('target_id', $targetId);
        })->orWhere(function ($q) use ($user, $targetId) {
            $q->where('user_id', $targetId)->where('target_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Already connected or request pending'], 400);
        }

        Relationship::create([
            'user_id' => $user->id,
            'target_id' => $targetId,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Request sent'], 200);
    }

    public function accept(User $user)
    {
        $currentUser = Auth::user();

        $relationship = Relationship::where('user_id', $user->id)
            ->where('target_id', $currentUser->id)
            ->where('status', 'pending')
            ->first();

        if (! $relationship) {
            return response()->json(['message' => 'Friend request no longer exists'], 404);
        }

        $relationship->update(['status' => 'accepted']);

        return response()->json(['message' => 'Request accepted'], 200);
    }

    public function destroy(User $user)
    {
        $currentUser = Auth::user();

        $relationship = Relationship::where(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('target_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $user->id)->where('target_id', $currentUser->id);
        })->first();

        if (! $relationship) {
            return response()->json(['message' => 'Relationship no longer exists'], 404);
        }

        $status = $relationship->status;
        $isRequester = $relationship->user_id === $currentUser->id;

        $relationship->delete();

        $message = 'Connection removed';
        if ($status === 'pending') {
            $message = $isRequester ? 'Request removed' : 'Request rejected';
        } elseif ($status === 'accepted') {
            $message = 'Friend removed';
        }

        return response()->json(['message' => $message], 200);
    }

    public function block(User $user)
    {
        $currentUser = Auth::user();

        $relationship = Relationship::where(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('target_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('user_id', $user->id)->where('target_id', $currentUser->id);
        })->first();

        if ($relationship) {
            $relationship->update([
                'user_id' => $currentUser->id,
                'target_id' => $user->id,
                'status' => 'blocked',
            ]);
        } else {
            Relationship::create([
                'user_id' => $currentUser->id,
                'target_id' => $user->id,
                'status' => 'blocked',
            ]);
        }

        return response()->json(['message' => 'User blocked'], 200);
    }
}
