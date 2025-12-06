// src/app/core/services/theme.service.ts
import { Injectable } from '@angular/core';

const THEME_KEY = 'mybooks_theme'; // 'light' | 'dark'
const LEGACY_KEY = 'darkMode';     // boolean legacy

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  // Service internal state
  private dark = false;

  constructor() {
    // ----- migrate legacy -----
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
      const val: Theme = legacy === 'true' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, val);
      localStorage.removeItem(LEGACY_KEY);
    }

    // ----- Load the previously saved theme -----
    const saved = localStorage.getItem(THEME_KEY);

    if (saved === 'dark' || saved === 'light') {
      this.apply(saved);
    } else {
      this.apply('light');
    }
  }

  // Sync with the actual state in the DOM
  isDark(): boolean {
    return this.dark;
  }

  toggle(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(THEME_KEY, next);
  }

  apply(theme: Theme): void {
    this.dark = theme === 'dark'; // sync state

    if (this.dark) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('app-dark-mode');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('app-dark-mode');
    }
  }
}
