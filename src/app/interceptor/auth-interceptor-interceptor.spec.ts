import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor-interceptor';
import { KeycloackService } from '@services/keycloak';

describe('AuthInterceptor', () => {
  let keycloakMock: any;

  beforeEach(() => {
    keycloakMock = {
      keycloack: {
        token: null
      }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloackService, useValue: keycloakMock }
      ]
    });
  });

  it('should add Authorization header when token exists', () => {
    keycloakMock.keycloack.token = 'fake-token';

    const req = new HttpRequest('GET', '/test');
    const next = jest.fn();

    TestBed.runInInjectionContext(() => {
      AuthInterceptor(req, next);
    });

    const modifiedReq = next.mock.calls[0][0];

    expect(modifiedReq.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('should not add Authorization header when token is null', () => {
    keycloakMock.keycloack.token = null;

    const req = new HttpRequest('GET', '/test');
    const next = jest.fn();

    TestBed.runInInjectionContext(() => {
      AuthInterceptor(req, next);
    });

    const modifiedReq = next.mock.calls[0][0];

    expect(modifiedReq.headers.has('Authorization')).toBe(false);
  });

  it('should call next with request', () => {
    const req = new HttpRequest('GET', '/test');
    const next = jest.fn();

    TestBed.runInInjectionContext(() => {
      AuthInterceptor(req, next);
    });

    expect(next).toHaveBeenCalledWith(req);
  });
});