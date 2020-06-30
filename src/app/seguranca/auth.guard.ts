import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  //se retornar true o usuario pode ter acesso aquela requisição
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // Aula 19.15: caso tente acessar uma requisicao na url com o token invalido, voce é direcionado para login
    if(this.auth.isAccessTokenInvalido()) {
      console.log('Navegação com access token inválido. Obtendo novo token...');

      return this.auth.obterNovoAccessToken()
        .then(() => {
          if(this.auth.isAccessTokenInvalido()) {
            this.router.navigate(['/login'])
            return false;
          }

          return true;
        });
    } else if (next.data.roles && !this.auth.temQualquerPermissao(next.data.roles)) {
      // se o usuario nao tiver acesso a alguma role, irá navegar para nao-autorizado
      this.router.navigate(['/nao-autorizado']);
      return false;
    }

    return true;
  }
}
