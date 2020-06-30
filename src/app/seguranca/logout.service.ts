import { Injectable } from '@angular/core';

import { AuthHttp } from 'angular2-jwt';
import { environment } from 'environments/environment';

import { AuthService } from './auth.service';

@Injectable()
export class LogoutService {

  // Remove o refreshToken
  tokensRevokeUrl: string;

  constructor(
    private http: AuthHttp,
    private auth: AuthService,
  ) { 
    this.tokensRevokeUrl = `${environment.apiUrl}/tokens/revoke`;
  }

  logout() {
    return this.http.delete(this.tokensRevokeUrl, { withCredentials: true })
      .toPromise()
      .then(() => {
        this.auth.limparAccessToken();
      });
  }

}
