import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class LoginComponent {
  isLoading = signal(false);
  showPassword = signal(false);
  
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;
      
      console.log('Login data:', { email, password });
      
      // Usar API real del backend
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          console.log('Usuario en AuthService:', this.authService.getCurrentUser());
          console.log('Token guardado:', this.authService.getStoredToken());
          this.isLoading.set(false);
          
          // Pequeño retraso para asegurar que el estado se actualice
          setTimeout(() => {
            console.log('Intentando redirigir al dashboard...');
            // Redirigir al dashboard
            this.router.navigate(['/dashboard']).then(navSuccess => {
              console.log('Redirección exitosa:', navSuccess);
            }).catch(navError => {
              console.error('Error en redirección:', navError);
            });
          }, 100);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading.set(false);
          
          // Mostrar mensaje de error
          alert('Error de inicio de sesión: ' + (error.message || 'Credenciales incorrectas'));
        }
      });
    } else {
      console.log('Formulario inválido:', this.loginForm);
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
