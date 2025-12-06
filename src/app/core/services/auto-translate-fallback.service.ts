// src/app/core/services/auto-translate-fallback.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AutoTranslateFallbackService {
 private cache = new Map<string, string>();


 constructor(private translate: TranslateService, private http: HttpClient) {}


 private cacheKey(lang: string, keyOrText: string) {
   return `${lang}||${keyOrText}`;
 }


 /**
  * Ensure a translation exists for keyOrText in target language.
  * keyOrText can be either a translation key (e.g. 'BOOKS_EMPTY') or raw English text.
  * The method will:
  *  - return existing translation if present
  *  - otherwise call backend /api/translate to get a machine translation,
  *    cache it and merge into TranslateService (so pipes reactively update)
  */
 async ensure(keyOrText: string, targetLang?: string): Promise<string> {
   const lang = targetLang || this.translate.currentLang || (this.translate as any).defaultLang || 'en';


   // If TranslateService already resolves to a translation, return it
   const existing = this.translate.instant(keyOrText);
   if (existing && existing !== keyOrText) return existing;


   // Already cached?
   const ck = this.cacheKey(lang, keyOrText);
   if (this.cache.has(ck)) return this.cache.get(ck)!;


   // Prepare source text: if keyOrText looks like a key but you want to translate raw text,
   // pass the English source instead. Here we assume keyOrText is the source text if it contains spaces,
   // otherwise it's still used as source text (you can adjust).
   const sourceText = keyOrText;


   // call backend proxy: POST /api/translate { q, source: 'en', target: lang }
   let translated = sourceText;
   try {
     const res: any = await firstValueFrom(this.http.post('/api/translate', { q: sourceText, source: 'en', target: lang }));
     translated = res?.translatedText ?? sourceText;
   } catch (err) {
     console.error('Auto-translate failed', err);
     translated = sourceText;
   }


   // cache and merge into TranslateService so that pipes like {{ 'KEY' | translate }} pick up the value
   this.cache.set(ck, translated);
   const toAdd: any = {};
   toAdd[keyOrText] = translated;
   this.translate.setTranslation(lang, toAdd, true); // merge = true


   return translated;
 }


 /**
  * Preload an array of keys or English texts for the currently active language.
  * Useful at bootstrap or when user switches language.
  */
 async ensureAll(items: string[], targetLang?: string) {
   const lang = targetLang || this.translate.currentLang || (this.translate as any).defaultLang || 'en';
   for (const it of items) {
     // sequential to avoid rate-limit bursts (can be parallelized if desired)
     // eslint-disable-next-line no-await-in-loop
     await this.ensure(it, lang);
   }
 }
}



