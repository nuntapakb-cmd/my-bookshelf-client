// src/app/pages/register/register.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  model = {
    email: '',         // required
    password: '',
    confirmPassword: ''
  };

  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  passwordsMatch(): boolean {
    return this.model.password === this.model.confirmPassword;
  }

  onSubmit() {
    if (this.loading) return;

    // basic front-end validation
    if (!this.model.email || !this.model.password) {
      this.error = 'Please fill required fields correctly.';
      return;
    }

    if (!this.passwordsMatch()) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload = {
      email: this.model.email,
      password: this.model.password,
      confirmPassword: this.model.confirmPassword
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Register failed.';
        this.loading = false;
      }
    });
  }
}
