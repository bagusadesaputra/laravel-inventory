<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

/**
 * End registration on the login screen instead of a dashboard visit.
 *
 * Fortify's controller always signs the new account in, and /login only accepts
 * guests, so the session has to be dropped again before redirecting there.
 */
class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     * @return Response
     */
    public function toResponse($request)
    {
        Auth::guard(config('fortify.guard'))->logout();
        $request->session()->invalidate();

        return $request->wantsJson()
            ? new JsonResponse('', 201)
            : redirect()->route('login')->with('status', 'Akun Anda berhasil dibuat. Silakan masuk.');
    }
}
