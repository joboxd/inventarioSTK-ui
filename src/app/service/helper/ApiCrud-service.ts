import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import {Observable} from "rxjs";
import { KeycloackService } from '../keycloak/keycloak';


interface RequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  body?: unknown;
  requireJWT?: boolean;
}

type HttpParamsList = Record<string, string | number | boolean>[];

@Injectable({
  providedIn: 'root'
})
export class ApiCrudService {

  private readonly http = inject(HttpClient);
  private readonly keycloackService = inject(KeycloackService);

  private buildHeaders(requireJWT?: boolean): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // const shouldUseJWT = requireJWT !== false;

    // if (shouldUseJWT) {
    //   const token = this.keycloackService.getToken();
    //   if (token) {
    //     headers = headers.set('Authorization', `Bearer ${token}`);
    //   }
    // }

    return headers;
  }

  private buildParams(params?: HttpParamsList): HttpParams | undefined {
    if (!params) return undefined;

    let httpParams = new HttpParams();
    for (const item of params) {
      for (const k in item) {
        httpParams = httpParams.append(k, item[k]);
      }
    }
    return httpParams;
  }

  get(url: string, params?: HttpParamsList, reqOpts: RequestOptions = {}): Observable<object> {
    return this.http.get(url, {
      ...reqOpts,
      params: this.buildParams(params),
      headers: reqOpts.headers ?? this.buildHeaders(reqOpts.requireJWT),
    });
  }

  post(url: string, body?: unknown, params?: HttpParamsList, reqOpts: RequestOptions = {}): Observable<object> {
    return this.http.post(url, body, {
      ...reqOpts,
      params: this.buildParams(params),
      headers: reqOpts.headers ?? this.buildHeaders(reqOpts.requireJWT),
    });
  }

  put(url: string, body: unknown = null, params?: HttpParamsList, reqOpts: RequestOptions = {}): Observable<object> {
    return this.http.put(url, body, {
      ...reqOpts,
      params: this.buildParams(params),
      headers: reqOpts.headers ?? this.buildHeaders(reqOpts.requireJWT),
    });
  }

  delete(url: string, body?: unknown, params?: HttpParamsList, reqOpts: RequestOptions = {}): Observable<object> {
    return this.http.delete(url, {
      ...reqOpts,
      body,
      params: this.buildParams(params),
      headers: reqOpts.headers ?? this.buildHeaders(reqOpts.requireJWT),
    });
  }
}
