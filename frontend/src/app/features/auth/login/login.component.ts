import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import type { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    if (this.auth.isLoggedIn()) {
      this.auth.redirectByRole();
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const body: LoginRequest = this.form.getRawValue();
    this.auth.login(body).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.auth.redirectByRole(),
      error: (err) => {
        const errBody = err?.error;
        if (errBody && typeof errBody === 'object' && errBody.message) {
          this.errorMessage.set(errBody.message);
        } else if (typeof errBody === 'string' && errBody) {
          this.errorMessage.set(errBody);
        } else {
          this.errorMessage.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        }
      }
    });
  }
}
