<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();

            if (! $user->last_seen_at || ! $user->last_seen_at->isToday()) {
                $lockKey = 'anniversary_check_lock_'.$user->id;
                if (\Illuminate\Support\Facades\Cache::add($lockKey, true, 60)) {
                    $user->checkAnniversaries();
                    $user->update(['last_seen_at' => now()]);
                }
            }
        }

        return $next($request);
    }
}
