import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

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
    private router: Router
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
      
      // Simulación de login exitoso temporal
      setTimeout(() => {
        this.isLoading.set(false);
        // Guardar sesión simulada
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Daniel',
          email: email,
          role: 'user'
        }));
        
        // Navegar al dashboard
        this.router.navigate(['/dashboard']);
      }, 1000);
    } else {
      console.log('Formulario inválido:', this.loginForm);
    }
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
