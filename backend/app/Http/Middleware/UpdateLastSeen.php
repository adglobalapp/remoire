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

            $user->checkAnniversariesOncePerDay();

            if (! $user->last_seen_at || ! $user->last_seen_at->isToday()) {
                $user->update(['last_seen_at' => now()]);
            }
        }

        return $next($request);
    }
}
