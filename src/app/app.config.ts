// src/app/app.config.ts
import {
 ApplicationConfig,
 provideBrowserGlobalErrorListeners,
 provideZoneChangeDetection,
 importProvidersFrom
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { TokenInterceptor } from './core/interceptors/token.interceptor';

// ngx-translate imports
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from './translate-loader';
import { HttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
 providers: [
   provideBrowserGlobalErrorListeners(),
   provideZoneChangeDetection({ eventCoalescing: true }),
   provideRouter(routes),

   // enable HttpClient and allow interceptors from DI
   provideHttpClient(withInterceptorsFromDi()),

   // for ngModel / template-driven forms
   importProvidersFrom(FormsModule),

   // register interceptor in DI
   { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },

   // Import TranslateModule with our loader factory so ngx-translate
   // will load ./assets/i18n/<lang>.json using the HttpClient available via provideHttpClient.
   importProvidersFrom(
     TranslateModule.forRoot({
       loader: {
         provide: TranslateLoader,
         useFactory: createTranslateLoader,
         deps: [HttpClient]
       },
       // <-- Use fallbackLang instead of defaultLanguage / useDefaultLang
       fallbackLang: 'en'
     })
   )
 ]
};
