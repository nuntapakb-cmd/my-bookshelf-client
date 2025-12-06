import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NavbarComponent } from './core/navbar/navbar.component';
import { TokenInterceptorProvider } from './core/interceptors/token.interceptor';




@Component({
 selector: 'app-root',
 standalone: true,
 imports: [RouterModule, NavbarComponent],
 templateUrl: './app.html',
})
export class App {}





