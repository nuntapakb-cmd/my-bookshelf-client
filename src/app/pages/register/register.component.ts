// src/app/pages/register/register.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, FontAwesomeModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  model = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  error: string | null = null;
  loading = false;

  // Control show/hide password
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    library: FaIconLibrary 
  ) {
    library.addIcons(faEye, faEyeSlash);
  }

  passwordsMatch(): boolean {
    return this.model.password === this.model.confirmPassword;
  }

  // Switch password fields
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Toggle the confirm password field
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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
