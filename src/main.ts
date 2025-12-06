import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, HttpClient } from '@angular/common/http';




import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { Observable } from 'rxjs';




export function createTranslateLoader(http: HttpClient): TranslateLoader {
return {
  getTranslation: (lang: string): Observable<any> => {
    return http.get(`/assets/i18n/${lang}.json`);
  }
} as TranslateLoader;
}




bootstrapApplication(App, {
...appConfig,
providers: [
  ...(appConfig.providers || []),
  provideHttpClient(),
  importProvidersFrom(
    TranslateModule.forRoot({
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  )
]
}).catch(err => console.error(err));


