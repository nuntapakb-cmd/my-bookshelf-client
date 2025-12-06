// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service'; 
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  model = {
    username: '',
    password: ''
  };

  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loading) return;

    this.loading = true;
    this.error = null;

    this.auth.login(this.model.username, this.model.password)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res && res.token) {
            localStorage.setItem('mybooks_token', res.token);
          }

          const userToStore = res && res.user ? res.user : { username: this.model.username };
          localStorage.setItem('mybooks_user', JSON.stringify(userToStore));

          // Go to the Home page after login
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.error = err?.error?.message || 'Login failed. Please check your credentials.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
