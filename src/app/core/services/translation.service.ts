// src/app/core/services/translation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';


export type Lang = 'en' | 'sv' | 'th';


@Injectable({ providedIn: 'root' })
export class TranslationService {
 // Modify the default value as required
 private _lang$ = new BehaviorSubject<Lang>((localStorage.getItem('app_lang') as Lang) || 'en');
 lang$ = this._lang$.asObservable();


 // Store translations
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
   },
   th: {
     APP_TITLE: 'MyBookshelf',
     LOGIN_PROMPT: 'ยังไม่มีบัญชี?',
     REGISTER: 'สมัครสมาชิก',
     ALREADY_ACCOUNT: 'มีบัญชีอยู่แล้ว?',
     LOGIN: 'เข้าสู่ระบบ',
     HOME_HEADLINE: 'เก็บหนังสือและคำคมที่ชอบไว้ในที่เดียว',
   }
 };


 constructor(private translateService: TranslateService) {
   // sync initial language with ngx-translate
   const lang = this.currentLang;
   this.translateService.setDefaultLang('en');
   this.translateService.use(lang);
 }


 get currentLang(): Lang {
   return this._lang$.value;
 }


 setLang(lang: Lang) {
   this._lang$.next(lang);
   localStorage.setItem('app_lang', lang);
   // sync to ngx-translate
   this.translateService.use(lang);
 }


 // simple local lookup (fallback)
 translate(key: string): string {
   const lang = this.currentLang;
   return this.translations[lang]?.[key] ?? key;
 }


 instant(key: string): string {
   // prefer ngx-translate instant (it will include merged MT results)
   const t = this.translateService.instant(key);
   if (t && t !== key) return t;
   return this.translate(key);
 }
}



