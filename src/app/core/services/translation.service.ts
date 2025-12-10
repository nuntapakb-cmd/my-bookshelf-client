import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'en' | 'sv';

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private _lang$ = new BehaviorSubject<Lang>('en');
  lang$ = this._lang$.asObservable();

  private translations: Record<Lang, Record<string, string>> = {
    en: {
      APP_TITLE: 'MyBookshelf',
      LOGIN_PROMPT: "Don't have an account?",
      REGISTER: 'Register',
      ALREADY_ACCOUNT: 'Already have an account?',
      LOGIN: 'Login',
      HOME_HEADLINE: 'All your books & quotes in one place',
    },
    sv: {
      APP_TITLE: 'Min Bokhylla',
      LOGIN_PROMPT: 'Har du inget konto?',
      REGISTER: 'Registrera',
      ALREADY_ACCOUNT: 'Har du redan ett konto?',
      LOGIN: 'Logga in',
      HOME_HEADLINE: 'Alla dina böcker & citat på ett ställe',
    }
  };

  constructor(private translateService: TranslateService) {

    const savedLang = localStorage.getItem('app_lang') as Lang | null;

    let browserLang = this.translateService.getBrowserLang() || 'en';

    browserLang = browserLang.split('-')[0];

    let initialLang: Lang;

    if (savedLang) {
      initialLang = savedLang;
    } else if (['sv', 'en'].includes(browserLang)) {
      initialLang = browserLang as Lang;
    } else {
      initialLang = 'en';
    }


    this._lang$.next(initialLang);

    this.translateService.setDefaultLang('en');
    this.translateService.use(initialLang);
  }

  get currentLang(): Lang {
    return this._lang$.value;
  }

  setLang(lang: Lang) {
    this._lang$.next(lang);
    localStorage.setItem('app_lang', lang);
    this.translateService.use(lang);
  }

  translate(key: string): string {
    const lang = this.currentLang;
    return this.translations[lang]?.[key] ?? key;
  }

  instant(key: string): string {
    const t = this.translateService.instant(key);
    if (t && t !== key) return t;
    return this.translate(key);
  }
}
