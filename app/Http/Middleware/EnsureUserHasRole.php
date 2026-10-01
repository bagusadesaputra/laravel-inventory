<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Allow the request through when the user holds one of the given roles.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string  ...$roles  Values from \App\Enums\UserRole.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $role = $request->user()?->role?->value;

        abort_unless(
            $role !== null && in_array($role, $roles, true),
            403,
            'Your role does not allow this action.',
        );

        return $next($request);
    }
}
