<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Relationship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RelationshipController extends Controller
{
    public function index()
    {
        $friends = Auth::user()->friends()->get();

        return response()->json($friends, 200);
    }

    public function requests()
    {
        $user = Auth::user();
        $pending = $user->pendingFriendRequests()->latest('relationships.created_at')->get();
        $sent = $user->sentFriendRequests()->latest('relationships.created_at')->get();

        return response()->json([
            'pending' => $pending,
            'sent' => $sent,
        ]);
    }

    public function search(Request $request)
    {
        $q = $request->query('q');
        $me = Auth::user();

        if (strlen($q) < 2) {
            return response()->json([], 200);
        }

        $blockedIds = Relationship::where(fn ($query) => $query->where('user_id', $me->id)->orWhere('target_id', $me->id))
            ->where('status', 'blocked')
            ->get()
            ->map(fn ($rel) => $rel->user_id === $me->id ? $rel->target_id : $rel->user_id);

        $users = User::where(fn ($query) => $query->where('name', 'like', "%{$q}%")->orWhere('friend_code', 'like', "%{$q}%"))
            ->where('id', '!=', $me->id)
            ->whereNotIn('id', $blockedIds)
            ->get();

        $relationships = Relationship::where(fn ($query) => $query->where('user_id', $me->id)->whereIn('target_id', $users->pluck('id')))
            ->orWhere(fn ($query) => $query->whereIn('user_id', $users->pluck('id'))->where('target_id', $me->id))
            ->get();

        $users->each(function ($user) use ($me, $relationships) {
            $rel = $relationships->first(fn ($rel) => ($rel->user_id === $me->id && $rel->target_id === $user->id) || ($rel->user_id === $user->id && $rel->target_id === $me->id));
            $user->relationship_status = $rel ? $rel->status : 'none';
            if ($user->relationship_status === 'pending') {
                $user->is_requester = $rel->user_id === $me->id;
            }
        });

        return response()->json($users, 200);
    }

    public function store(Request $request)
    {
        $request->validate(['target_id' => 'required|exists:users,id']);
        $me = Auth::user();
        $targetId = $request->target_id;

        if ($me->id == $targetId) {
            return response()->json(['message' => 'You cannot connect with yourself'], 400);
        }

        if (Relationship::between($me->id, $targetId)->exists()) {
            return response()->json(['message' => 'Already connected or request pending'], 400);
        }

        Relationship::create(['user_id' => $me->id, 'target_id' => $targetId, 'status' => 'pending']);

        Notification::create([
            'user_id' => $targetId,
            'type' => 'friend_request',
            'data' => ['requester_id' => $me->id, 'requester_name' => $me->name],
        ]);

        return response()->json(['message' => 'Request sent'], 200);
    }

    public function accept(User $user)
    {
        $me = Auth::user();
        $rel = Relationship::where('user_id', $user->id)->where('target_id', $me->id)->where('status', 'pending')->first();

        if (! $rel) {
            return response()->json(['message' => 'Friend request no longer exists'], 404);
        }

        $rel->update(['status' => 'accepted']);

        return response()->json(['message' => 'Request accepted'], 200);
    }

    public function destroy(User $user)
    {
        $me = Auth::user();
        $rel = Relationship::between($me->id, $user->id)->first();

        if (! $rel) {
            return response()->json(['message' => 'Relationship no longer exists'], 404);
        }

        $status = $rel->status;
        $isRequester = $rel->user_id === $me->id;
        $rel->delete();

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
        $me = Auth::id();
        Relationship::between($me, $user->id)->delete();
        Relationship::create(['user_id' => $me, 'target_id' => $user->id, 'status' => 'blocked']);

        return response()->json(['message' => 'User blocked'], 200);
    }
}
