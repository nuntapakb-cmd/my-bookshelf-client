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
  model = { username: '', password: '', confirmPassword: '' };
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  passwordsMatch(): boolean {
    return (
      !!this.model.password &&
      this.model.password === this.model.confirmPassword
    );
  }

  onSubmit() {
    if (this.loading) return;

    if (!this.model.username || !this.model.password) {
      this.error = 'Please fill all fields.';
      return;
    }

    if (!this.passwordsMatch()) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.register(this.model.username, this.model.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Register failed', err);
        this.error = err?.error?.message || 'Register failed.';
        this.loading = false;
      }
    });
  }
}
