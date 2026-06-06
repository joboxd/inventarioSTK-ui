import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiCrudService } from './ApiCrud-service';

describe('ApiCrudService', () => {
  let service: ApiCrudService;
  let httpMock: any;

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ApiCrudService,
        { provide: HttpClient, useValue: httpMock },
        { provide: 'StorageService', useValue: {} },
        { provide: 'KeycloackService', useValue: {} }
      ]
    });

    service = TestBed.inject(ApiCrudService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should perform GET without params', () => {
    httpMock.get.mockReturnValue(of({}));

    service.get('url').subscribe();

    expect(httpMock.get).toHaveBeenCalled();
    const args = httpMock.get.mock.calls[0];
    expect(args[0]).toBe('url');
    expect(args[1].headers).toBeDefined();
  });

  it('should perform GET with params', () => {
    httpMock.get.mockReturnValue(of({}));

    service.get('url', [{ a: 1 }, { b: 'test' }]).subscribe();

    const args = httpMock.get.mock.calls[0];
    expect(args[1].params.keys().length).toBeGreaterThan(0);
  });

  it('should perform POST without params', () => {
    httpMock.post.mockReturnValue(of({}));

    service.post('url', { test: true }).subscribe();

    expect(httpMock.post).toHaveBeenCalled();
    const args = httpMock.post.mock.calls[0];
    expect(args[1]).toEqual({ test: true });
    expect(args[2].headers).toBeDefined();
  });

  it('should perform POST with params', () => {
    httpMock.post.mockReturnValue(of({}));

    service.post('url', {}, [{ a: 1 }]).subscribe();

    const args = httpMock.post.mock.calls[0];
    expect(args[2].params.keys().length).toBeGreaterThan(0);
  });

  it('should perform PUT', () => {
    httpMock.put.mockReturnValue(of({}));

    service.put('url', { data: 1 }).subscribe();

    expect(httpMock.put).toHaveBeenCalled();
    const args = httpMock.put.mock.calls[0];
    expect(args[1]).toEqual({ data: 1 });
    expect(args[2].headers).toBeDefined();
  });

  it('should perform PUT with params', () => {
    httpMock.put.mockReturnValue(of({}));

    service.put('url', {}, [{ a: 1 }]).subscribe();

    const args = httpMock.put.mock.calls[0];
    expect(args[2].params.keys().length).toBeGreaterThan(0);
  });

  it('should perform DELETE without body', () => {
    httpMock.delete.mockReturnValue(of({}));

    service.delete('url').subscribe();

    expect(httpMock.delete).toHaveBeenCalled();
    const args = httpMock.delete.mock.calls[0];
    expect(args[1].headers).toBeDefined();
  });

  it('should perform DELETE with body', () => {
    httpMock.delete.mockReturnValue(of({}));

    service.delete('url', { id: 1 }).subscribe();

    const args = httpMock.delete.mock.calls[0];
    expect(args[1].body).toEqual({ id: 1 });
  });

  it('should perform DELETE with params', () => {
    httpMock.delete.mockReturnValue(of({}));

    service.delete('url', undefined, [{ a: 1 }]).subscribe();

    const args = httpMock.delete.mock.calls[0];
    expect(args[1].params.keys().length).toBeGreaterThan(0);
  });

  it('should not override headers if provided', () => {
    httpMock.get.mockReturnValue(of({}));

    const customHeaders = { headers: { test: '1' } as any };

    service.get('url', undefined, customHeaders).subscribe();

    const args = httpMock.get.mock.calls[0];
    expect(args[1].headers).toEqual(customHeaders.headers);
  });

  it('should handle empty reqOpts object', () => {
  httpMock.get.mockReturnValue(of({}));

  service.get('url', undefined, {}).subscribe();

  const args = httpMock.get.mock.calls[0];
  expect(args[1]).toBeDefined();
});

it('should handle params with multiple keys in one object', () => {
  httpMock.get.mockReturnValue(of({}));

  service.get('url', [{ a: 1, b: 2 }]).subscribe();

  const args = httpMock.get.mock.calls[0];
  const params = args[1].params;

  expect(params.get('a')).toBe('1');
  expect(params.get('b')).toBe('2');
});

it('should NOT set headers if already present in PUT', () => {
  httpMock.put.mockReturnValue(of({}));

  const reqOpts = {
    headers: { custom: '1' } as any
  };

  service.put('url', {}, undefined, reqOpts).subscribe();

  const args = httpMock.put.mock.calls[0];
  expect(args[2].headers).toEqual(reqOpts.headers);
});

it('should NOT set headers if already present in DELETE', () => {
  httpMock.delete.mockReturnValue(of({}));

  const reqOpts = {
    headers: { custom: '1' } as any
  };

  service.delete('url', undefined, undefined, reqOpts).subscribe();

  const args = httpMock.delete.mock.calls[0];
  expect(args[1].headers).toEqual(reqOpts.headers);
});

it('should call DELETE with null body explicitly', () => {
  httpMock.delete.mockReturnValue(of({}));

  service.delete('url', null).subscribe();

  const args = httpMock.delete.mock.calls[0];

  expect(args[1].body).toBeNull();
});

it('should handle empty params array', () => {
  httpMock.get.mockReturnValue(of({}));

  service.get('url', []).subscribe();

  const args = httpMock.get.mock.calls[0];
  expect(args[1].params).toBeDefined();
});

it('should handle params with empty object', () => {
  httpMock.get.mockReturnValue(of({}));

  service.get('url', [{}]).subscribe();

  const args = httpMock.get.mock.calls[0];
  expect(args[1].params.keys().length).toBe(0);
});

it('should handle multiple param objects', () => {
  httpMock.get.mockReturnValue(of({}));

  service.get('url', [{ a: 1 }, { b: 2 }]).subscribe();

  const args = httpMock.get.mock.calls[0];
  const params = args[1].params;

  expect(params.get('a')).toBe('1');
  expect(params.get('b')).toBe('2');
});

it('should handle param object without enumerable properties', () => {
  httpMock.get.mockReturnValue(of({}));

  const obj = Object.create(null);

  service.get('url', [obj]).subscribe();

  const args = httpMock.get.mock.calls[0];
  expect(args[1].params.keys().length).toBe(0);
});

it('should set headers when not provided and call http.post', () => {
  httpMock.post.mockReturnValue(of({}));

  service.post('url', { data: 123 }).subscribe();

  expect(httpMock.post).toHaveBeenCalled();

  const args = httpMock.post.mock.calls[0];

  expect(args[2].headers).toBeDefined();

  expect(args[0]).toBe('url');
  expect(args[1]).toEqual({ data: 123 });
});

it('should add default headers when reqOpts exists but headers missing', () => {
  httpMock.post.mockReturnValue(of({}));

  const reqOpts = {};

  service.post('url', {}, undefined, reqOpts).subscribe();

  const args = httpMock.post.mock.calls[0];

  expect(args[2].headers).toBeDefined();
});

it('should NOT override headers if already provided in POST', () => {
  httpMock.post.mockReturnValue(of({}));

  const customHeaders = { headers: { test: '1' } as any };

  service.post('url', {}, undefined, customHeaders).subscribe();

  const args = httpMock.post.mock.calls[0];

  expect(args[2].headers).toEqual(customHeaders.headers);
});

it('should set headers when reqOpts exists without headers in PUT', () => {
  httpMock.put.mockReturnValue(of({}));

  const reqOpts = {};

  service.put('url', { data: 1 }, undefined, reqOpts).subscribe();

  const args = httpMock.put.mock.calls[0];

  expect(args[2].headers).toBeDefined();

  expect(args[0]).toBe('url');
  expect(args[1]).toEqual({ data: 1 });
});

it('should initialize reqOpts and set headers in PUT when undefined', () => {
  httpMock.put.mockReturnValue(of({}));

  service.put('url', { data: 2 }).subscribe();

  const args = httpMock.put.mock.calls[0];

  expect(args[2]).toBeDefined();
  expect(args[2].headers).toBeDefined();
});

it('should NOT override headers if already present in PUT', () => {
  httpMock.put.mockReturnValue(of({}));

  const customHeaders = {
    headers: { custom: '1' } as any
  };

  service.put('url', {}, undefined, customHeaders).subscribe();

  const args = httpMock.put.mock.calls[0];

  expect(args[2].headers).toEqual(customHeaders.headers);
});

});
