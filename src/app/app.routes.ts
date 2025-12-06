// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Landing (public)
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },

  // Protected home
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },

  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // Books
  {
    path: 'books',
    loadComponent: () =>
      import('./pages/books/list/list.component').then(m => m.BooksListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'books/new',
    loadComponent: () =>
      import('./pages/books/form/form.component').then(m => m.BookFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'books/edit/:id',
    loadComponent: () =>
      import('./pages/books/form/form.component').then(m => m.BookFormComponent),
    canActivate: [AuthGuard]
  },

  // Citat (quotes)
  {
    path: 'citat',
    loadComponent: () =>
      import('./pages/citat/list/list.component').then(m => m.CitatListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'citat/new',
    loadComponent: () =>
      import('./pages/citat/form/form.component').then(m => m.CitatFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'citat/edit/:id',
    loadComponent: () =>
      import('./pages/citat/form/form.component').then(m => m.CitatFormComponent),
    canActivate: [AuthGuard]
  },

  // fallback
  { path: '**', redirectTo: '' }
];
