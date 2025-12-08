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
  // ใช้ email แทน username
  model = {
    email: '',
    password: ''
  };

  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loading) return;

    // เบื้องต้นให้เช็กฟิลด์ด้วย จะช่วยลด request เปล่า ๆ
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

          // เก็บข้อมูลผู้ใช้ที่ backend ส่งกลับ หากไม่มี ให้เก็บ email ที่ใช้ล็อกอิน
          const userToStore = (res && res.user)
            ? res.user
            : { email: res?.email ?? this.model.email };

          localStorage.setItem('mybooks_user', JSON.stringify(userToStore));

          // ไปที่หน้า Home หลังล็อกอิน
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
