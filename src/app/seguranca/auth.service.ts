import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { JwtHelper } from 'angular2-jwt';

import 'rxjs/add/operator/toPromise';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {

  oauthTokenUrl: string;
  jwtPayload: any;

  constructor(
    private http: Http,
    private jwtHelper: JwtHelper
  ) {
    this.carregarToken();
    this.oauthTokenUrl = `${environment.apiUrl}/oauth/token`;
  }

  login(usuario: string, senha: string): Promise<void> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic YW5ndWxhcjpAbmd1bEByMA==');

    const body = `username=${usuario}&password=${senha}&grant_type=password`;

    return this.http.post(this.oauthTokenUrl, body, 
        { headers, withCredentials: true })
      .toPromise()
      .then(response => {
        this.armazenarToken(response.json().access_token);
      })
      .catch(response => {
        if(response.status === 400) {
          const responseJson = response.json();

          if(responseJson.error === 'invalid_grant') {
            return Promise.reject('Usuário ou senha inválida');
          }

          return Promise.reject(response);
        }
      });
  }

  isAccessTokenInvalido() {
    const token = localStorage.getItem('token');

    return !token || this.jwtHelper.isTokenExpired(token);
  }

  obterNovoAccessToken(): Promise<void> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic YW5ndWxhcjpAbmd1bEByMA==');

    const body = 'grant_type=refresh_token';

    // usamos o withCredencials: true quando a porta de origem é diferente da porta do cliente 
    return this.http.post(this.oauthTokenUrl, body,
        { headers, withCredentials: true })
      .toPromise()
      .then(response => {
        this.armazenarToken(response.json().access_token);

        console.log('AccessToken criado com sucesso!');

        return Promise.resolve(null);
      })
      .catch(response => {
        console.error('Erro ao criar novo accessToken', response);
        return Promise.resolve(null);
      })
  }

  // verifica uma unica role
  temPermissao(permissao: string) {
    return this.jwtPayload && this.jwtPayload.authorities.includes(permissao);
  }

  // percorre todas as roles
  temQualquerPermissao(roles) {
    for (const role of roles) {
      if (this.temPermissao(role)) {
        return true;
      }
    }

    return false;
  }

  limparAccessToken() {
    localStorage.removeItem('token');
    this.jwtPayload = null;
  }

  private armazenarToken(token: string) {
    //jwtPayload: traduz o access token para que a aplicação entenda
    this.jwtPayload = this.jwtHelper.decodeToken(token);
    /* localstorage: faz com que o token seja armazenado em um local, para evitar que
    quando ocorra um refresh no navegador o token não seja perdido */
    /* sem esse localStorage um novo accessToken seria criado a cada refresh no browser, logo,
    teria que logar novamente */
    localStorage.setItem('token', token);
  }

  // inicializa o token na aplicação, se esse token não existir o usuario terá que fazer o login
  // metodo criado para evitar que quando der refresh sem ter feito um logout, o usuario continue conectado
  private carregarToken() {
    const token = localStorage.getItem('token');

    if (token) {
      this.armazenarToken(token);
    }
  }
  
}
