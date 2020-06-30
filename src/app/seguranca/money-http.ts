import { Injectable } from '@angular/core';
import { Http, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';

import { AuthConfig, AuthHttp } from 'angular2-jwt';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

export class NotAuthenticatedError {}

@Injectable()
export class MoneyHttp extends AuthHttp {

  constructor(
    private auth: AuthService,
    options: AuthConfig,
    http: Http, defOpts?: RequestOptions
  ) {
    super(options, http, defOpts);
  }

  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.delete(url, options));
  }

  public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.patch(url, options));
  }

  public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.head(url, options));
  }

  public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.options(url, options));
  }

  public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.get(url, options));
  }

  public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.post(url, body, options));
  }

  public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.fazerRequisicao(() => super.put(url, body, options));
  }

//   essa funçao automatiza a chamada de um novo accessToken
  private fazerRequisicao(fn: Function): Observable<Response> {
    if (this.auth.isAccessTokenInvalido()) {
      console.log('Requisição HTTP com access token inválido. Obtendo novo token...');

      const chamadaNovoAccessToken = this.auth.obterNovoAccessToken()
        .then(() => {
          // caso o refreshToken expire e tente criar um acessToken novamente, lança-se essa excessao
          // observe em errorHandlerSerivice a mensagem que é mandada quando isso acontece
          // faz com que o usuario nao consiga acessar uma requisição pela url, pois nao tem o refreshToken
          if(this.auth.isAccessTokenInvalido()) {
            throw new NotAuthenticatedError();
          }

        // fn() é a funcao chamada no arrowFunction que esta vazia: ()
          return fn().toPromise();
        });

    //   transforma a promise em um observable
      return Observable.fromPromise(chamadaNovoAccessToken);
    } else {
      return fn();
    }
  }

}