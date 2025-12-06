// src/app/core/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common'; 

@Component({
selector: 'app-navbar',
standalone: true,
imports: [CommonModule, RouterModule, TranslateModule],
templateUrl: './navbar.component.html',
styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
mobileOpen = false;
selectedLang = 'en'; 

constructor(
  public auth: AuthService,
  public themeService: ThemeService,
  private translate: TranslateService
) {

 // Load the language from localStorage if available
  const savedLang = localStorage.getItem('lang') || 'en';
  this.selectedLang = savedLang;

  // Set the language for translate to use
  this.translate.use(savedLang);
}

// ------ Mobile Menu ------
toggleMobile() {
  this.mobileOpen = !this.mobileOpen;
}

closeMobile() {
  this.mobileOpen = false;
}

// ------ Logout ------
logout() {
  this.auth.logout();
  this.closeMobile();
}

// ------ Theme Toggle ------
toggleTheme() {
  this.themeService.toggle();
}

isDark() {
  return this.themeService.isDark();
}

// ------ Language Switch ------
setLang(lang: string) {
 this.selectedLang = lang;
 localStorage.setItem('lang', lang);

 this.translate.use(lang).subscribe({
   next: () => {
     console.log('Language switched to', lang);
   },
   error: err => {
     console.error('Failed to load language', err);
   }
 });
}


}



