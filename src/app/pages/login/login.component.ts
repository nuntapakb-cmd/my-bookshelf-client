// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs/operators';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  model = {
    email: '',
    password: ''
  };

  loading = false;
  error: string | null = null;

  // Toggle show/hide password
  showPassword = false;

  constructor(
    private auth: AuthService, 
    private router: Router, 
    library: FaIconLibrary
  ) {
  library.addIcons(faEye, faEyeSlash);
  }


  // Eye shape swap function
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loading) return;
    
    if (!this.model.email || !this.model.password) {
      this.error = 'Please fill all fields.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.login(this.model.email, this.model.password)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res && res.token) {
            localStorage.setItem('mybooks_token', res.token);
          }

          // Store the returned user data, or fallback to the login email
          const userToStore = (res && res.user)
            ? res.user
            : { email: res?.email ?? this.model.email };

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
