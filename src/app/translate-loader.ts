// src/app/translate-loader.ts
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';


/**
* Simple TranslateLoader using HttpClient directly.
* This avoids constructor / typing mismatch with TranslateHttpLoader versions.
*/
export function createTranslateLoader(http: HttpClient): TranslateLoader {
 return {
   getTranslation: (lang: string): Observable<any> => {
     return http.get(`/assets/i18n/${lang}.json`);
   }
 } as TranslateLoader;
}