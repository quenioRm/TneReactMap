<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Lidar com uma solicitação recebida.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        // Verifica se o usuário está autenticado e tem a role necessária
        if (!Auth::check() || !$request->user()->hasRole($role)) {
            // Retorna uma resposta JSON com status 403
            return response()->json(['globalMessage' => 'Acesso negado.'], 403);
        }

        return $next($request);
    }
}
