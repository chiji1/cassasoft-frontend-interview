import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { from, Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.handle(request, next));
  }

  async handle(request: HttpRequest<any>, next: HttpHandler) {
    const authToken = localStorage.getItem('jwt-token');
    if (authToken) {
      const authRequest = request.clone({
        headers: request.headers.set("Authorization", `Bearer ${authToken}`)
      });
      return next.handle(authRequest).toPromise();
    }
    return next.handle(request).toPromise();
  }
}
