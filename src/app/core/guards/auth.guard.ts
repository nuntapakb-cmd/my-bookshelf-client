// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
 providedIn: 'root'
})
export class AuthGuard implements CanActivate {
 constructor(private auth: AuthService, private router: Router) {}


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
   console.log('[AuthGuard] canActivate called - requestedUrl=', state.url);
   const logged = this.auth.isLoggedIn();
   console.log('[AuthGuard] isLoggedIn=', logged, ' token=', this.auth.getToken());
   if (logged) return true;


 // Send returnUrl as the actual URL the user attempted to access (use state.url).
 return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
 }
}



