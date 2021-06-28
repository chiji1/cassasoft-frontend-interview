import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private readonly angularFireAuth: AngularFireAuth,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
  : boolean {
    const token = localStorage.getItem('jwt-token');
    if (token) {
      return true;
    }
    else {
      this.authService.onLogout();
      return false;
    }
  }
}
