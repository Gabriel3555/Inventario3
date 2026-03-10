import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import type { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  readonly roles: { value: 'ADMIN' | 'VENDEDOR'; label: string }[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'VENDEDOR', label: 'Vendedor' }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['VENDEDOR', Validators.required]
    });
    if (this.auth.isLoggedIn()) {
      this.auth.redirectByRole();
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const body: RegisterRequest = this.form.getRawValue();
    this.auth.register(body).subscribe({
      next: () => this.auth.redirectByRole(),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message ?? 'Error al registrarse. Intenta de nuevo.';
      }
    });
  }
}
