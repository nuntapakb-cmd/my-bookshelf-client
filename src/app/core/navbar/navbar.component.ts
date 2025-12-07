// src/app/core/navbar/navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIf, RouterModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileOpen = false;
  selectedLang = 'en';
  isMobile = false;

  // MediaQueryList references for listener management
  private mql?: MediaQueryList;
  private mqlListener?: (e: MediaQueryListEvent) => void;

  constructor(
    public auth: AuthService,
    public themeService: ThemeService,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.selectedLang = savedLang;
    this.translate.use(savedLang);
  }

  ngOnInit(): void {
    // Set up MediaQueryList and listener so isMobile updates immediately on change
    this.mql = window.matchMedia('(max-width: 768px)');
    this.isMobile = this.mql.matches;

    // Create listener function that updates isMobile
    this.mqlListener = (e: MediaQueryListEvent) => {
      this.isMobile = e.matches;
      // optionally close mobile drawer when switching to desktop
      if (!this.isMobile) {
        this.mobileOpen = false;
      }
    };

    // Use modern addEventListener when available, otherwise fallback to addListener
    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', this.mqlListener);
    } else {
      this.mql.addListener(this.mqlListener);
    }
  }

  ngOnDestroy(): void {
    // Clean up listener
    if (!this.mql || !this.mqlListener) { return; }
    if (this.mql.removeEventListener) {
      this.mql.removeEventListener('change', this.mqlListener);
    } else {
      this.mql.removeListener(this.mqlListener);
    }
  }

  // ------ Mobile Menu ------
  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
  closeMobile() { this.mobileOpen = false; }

  // ------ Logout ------
  logout() {
    this.auth.logout();
    this.closeMobile();
  }

  // ------ Theme Toggle ------
  toggleTheme() { this.themeService.toggle(); }
  isDark() { return this.themeService.isDark(); }

  // ------ Language Switch ------
  setLang(lang: string) {
    this.selectedLang = lang;
    localStorage.setItem('lang', lang);

    this.translate.use(lang).subscribe({
      next: () => { console.log('Language switched to', lang); },
      error: err => { console.error('Failed to load language', err); }
    });
  }
}
