// src/app/core/services/i18n-merge.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class I18nMergeService {
  private cacheKeyPrefix = 'i18n_';

  constructor(private translate: TranslateService, private http: HttpClient) {}

  private assetPath(lang: string) {
    return `/assets/i18n/${lang}.json`;
  }

  async ensureLang(lang: string): Promise<void> {
    // 1) Try to load the translation available in assets (if any)
    let existing: any = {};
    try {
      existing = await this.http.get<any>(this.assetPath(lang)).toPromise();
    } catch {
      existing = {};
    }

    // 2) Load en.json (source)
    const en = await this.http.get<any>(this.assetPath('en')).toPromise();

    // 3) Find the missing keys
    const missing = this.findMissingKeys(en, existing);

    // 4) If none are missing, set/use and return
    if (Object.keys(missing).length === 0) {
      this.translate.setTranslation(lang, existing || {}, true);
      this.translate.use(lang);

      // ⭐ debug log
      console.group('i18n-merge debug [no missing]');
      console.log('lang used:', lang);
      console.log('existing keys:', Object.keys(existing).slice(0, 20));
      console.log('store →', (this.translate as any).store?.translations?.[lang]);
      console.groupEnd();
      return;
    }

    // 5) Check cache in localStorage
    const cached = localStorage.getItem(this.cacheKeyPrefix + lang);
    let cachedObj = cached ? JSON.parse(cached) : null;
    if (cachedObj) {
      existing = this.deepMerge(existing, cachedObj);
    }

    const missingAfterCache = this.findMissingKeys(en, existing);
    if (Object.keys(missingAfterCache).length === 0) {
      this.translate.setTranslation(lang, existing, true);
      this.translate.use(lang);

      // ⭐ debug log
      console.group('i18n-merge debug [missing resolved with cache]');
      console.log('lang used:', lang);
      console.log('existing keys:', Object.keys(existing).slice(0, 20));
      console.log('store →', (this.translate as any).store?.translations?.[lang]);
      console.groupEnd();
      return;
    }

    // 6) Call the backend to translate only the missing ones
    const translated = await this.http
      .post<any>('/api/translate', { source: missingAfterCache, targetLang: lang })
      .toPromise();

    // 7) Merge the result with the existing
    const merged = this.deepMerge(existing, translated);

    // 8) set translation runtime and use it
    this.translate.setTranslation(lang, merged, true);
    this.translate.use(lang);

    // ⭐⭐ 9) debug log — Check whether the translation was actually added
    console.group('i18n-merge debug [merged]');
    console.log('lang used:', lang);
    console.log('missing keys count:', Object.keys(missingAfterCache).length);
    console.log('merged sample keys:', Object.keys(merged).slice(0, 20));
    console.log('store translations for lang →',
      (this.translate as any).store?.translations?.[lang]
    );
    console.groupEnd();

    // 10) Store cache
    const newCache = this.deepMerge(cachedObj || {}, translated);
    localStorage.setItem(this.cacheKeyPrefix + lang, JSON.stringify(newCache));
  }

  private findMissingKeys(source: any, target: any): any {
    const result: any = {};
    for (const key of Object.keys(source)) {
      const s = source[key];
      const t = target ? target[key] : undefined;

      if (typeof s === 'string') {
        if (t === undefined || t === null || t === '') {
          result[key] = s;
        }
      } else if (typeof s === 'object' && s !== null) {
        const child = this.findMissingKeys(s, t || {});
        if (Object.keys(child).length > 0) result[key] = child;
      }
    }
    return result;
  }

  private deepMerge(a: any, b: any): any {
    if (!a) return JSON.parse(JSON.stringify(b));
    const out: any = Array.isArray(a) ? [...a] : { ...a };
    for (const key of Object.keys(b)) {
      if (typeof b[key] === 'object' && b[key] !== null && typeof out[key] === 'object') {
        out[key] = this.deepMerge(out[key], b[key]);
      } else {
        out[key] = b[key];
      }
    }
    return out;
  }
}
