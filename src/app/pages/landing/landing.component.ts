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

  onGetStarted(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);      // if loged in ➜ /home
    } else {
      this.router.navigate(['/register']);  // if not logged in ➜ /register

    }
  }
}