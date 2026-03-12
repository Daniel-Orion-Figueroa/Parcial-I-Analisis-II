import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TipoUsuario } from '../../../core/interfaces/user';

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
      
      // Simulación de usuarios para demostración
      this.mockLogin(email, password);
    } else {
      console.log('Formulario inválido:', this.loginForm);
    }
  }

  private mockLogin(email: string, password: string): void {
    // Base de datos simulada de usuarios
    const defaultUsers = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.ESTUDIANTE,
        fechaRegistro: '2024-01-15'
      },
      {
        id: 2,
        name: 'María García',
        email: 'maria@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.DOCENTE,
        fechaRegistro: '2024-01-10'
      },
      {
        id: 3,
        name: 'Carlos Admin',
        email: 'admin@university.edu',
        password: 'admin123',
        tipoUsuario: TipoUsuario.ADMIN,
        fechaRegistro: '2023-12-15'
      },
      {
        id: 4,
        name: 'Ana Estudiante',
        email: 'ana@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.ESTUDIANTE,
        fechaRegistro: '2024-02-01'
      }
    ];

    // Obtener usuarios registrados adicionalmente
    const registeredUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    // Combinar usuarios por defecto y registrados
    const allUsers = [...defaultUsers, ...registeredUsers];
    
    // Buscar usuario por email y password
    const user = allUsers.find(u => u.email === email && u.password === password);

    setTimeout(() => {
      this.isLoading.set(false);
      
      if (user) {
        // Login exitoso - guardar en AuthService
        this.saveUserSession(user);
        
        console.log('Login exitoso:', user);
        alert(`¡Bienvenido ${user.name}! (${user.tipoUsuario})`);
        
        // Navegar al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Login fallido
        console.log('Credenciales incorrectas');
        alert('Email o contraseña incorrectos. Intenta de nuevo.');
      }
    }, 1000);
  }

  private saveUserSession(user: any): void {
    // Guardar en localStorage
    localStorage.setItem('token', 'mock-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(user));
    
    // Actualizar el estado del AuthService
    this.authService['userSubject'].next(user);
    this.authService['tokenSubject'].next('mock-token-' + Date.now());
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
