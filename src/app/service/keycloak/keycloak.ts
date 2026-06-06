import { Injectable } from '@angular/core';
import { UserProfile } from './user-profile';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

interface KeycloakResource {
  roles?: string[];
}

interface KeycloakTokenParsed {
  resource_access?: Record<string, KeycloakResource>;
}
@Injectable({
  providedIn: 'root',
})
export class KeycloackService {
  private _keycloack: Keycloak | undefined;
  private _profile: UserProfile | undefined;
  private _roles: string[] = [];
  private refreshTokenPromise: Promise<string | undefined> | null = null;
  get keycloack(){
    if (!this._keycloack) {
      this._keycloack = new Keycloak({
        url:  environment.keycloack.url,
        realm: environment.keycloack.realm,
        clientId: environment.keycloack.clientId
      })
    }
    return this._keycloack;
  }
  get profile():UserProfile | undefined {
    return this._profile;
  }

  async init(){
    const authenticated = await this.keycloack?.init({
      onLoad: 'login-required',
    })
    if (authenticated) {
      this._profile = (await this.keycloack?.loadUserProfile()) as UserProfile;
      const tokenParsed = this.keycloack.tokenParsed as KeycloakTokenParsed | undefined;

      const resourceAccess = tokenParsed?.resource_access ?? {};

      this._roles = Object.values(resourceAccess)
        .flatMap((resource) => resource.roles ?? []);
    }
  }

  login(){
    return this.keycloack?.login();
  }

  logout(): Promise<void> {
    return this.keycloack.logout({
      redirectUri: environment.keycloack.logoutRedirectUri
    });
  }

  hasRole(role: string): boolean {
    return this._roles.includes(role);
  }

  getRoles(){
    return this._roles;
  }

  getToken(): string | undefined {
    return this.keycloack.token;
  }

  async getValidToken(): Promise<string | undefined> {
    if (!this.keycloack) return undefined;

    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        await this.keycloack.updateToken(30);
        return this.keycloack.token;
      } catch (error) {
        console.error('Error al actualizar token en Keycloak, cerrando sesión...', error);
        await this.logout();
        return undefined;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

}
