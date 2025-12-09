// src/app/pages/landing/landing.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Get Started — it's free
  onGetStarted(): void {
    if (this.authService.isLoggedIn()) {
      // already logged in → go to home
      this.router.navigate(['/home']);
    } else {
      // not logged in → go to register
      this.router.navigate(['/register']);
    }
  }

  // I already have an account
  onAlreadyHaveAccount(): void {
    if (this.authService.isLoggedIn()) {
      // already logged in → go to home
      this.router.navigate(['/home']);
    } else {
      // not logged in → go to login
      this.router.navigate(['/login']);
    }
  }
}
