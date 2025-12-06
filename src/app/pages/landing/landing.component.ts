// src/app/pages/landing/landing.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';  
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  constructor(private router: Router) {}   

  onStart() {
    this.router.navigate(['/home']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}
