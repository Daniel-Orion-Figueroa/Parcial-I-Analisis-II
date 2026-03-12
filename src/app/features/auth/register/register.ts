import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { TipoUsuario } from '../../../core/interfaces/user';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true
})
export class RegisterComponent {
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  registerForm: FormGroup;
  userTypes = Object.values(TipoUsuario);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      tipoUsuario: [TipoUsuario.ESTUDIANTE, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      
      const formData = this.registerForm.value;
      const userToRegister = {
        id: Date.now(), // ID único basado en timestamp
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tipoUsuario: formData.tipoUsuario,
        fechaRegistro: new Date().toISOString().split('T')[0]
      };
      
      console.log('Register data:', userToRegister);
      
      // Guardar usuario y navegar al dashboard
      this.saveNewUser(userToRegister);
    }
  }

  private saveNewUser(user: any): void {
    // Usar API real del AuthService
    this.authService.register(user).subscribe({
      next: (registeredUser) => {
        // El AuthService ya maneja el almacenamiento y actualización del estado
        setTimeout(() => {
          this.isLoading.set(false);
          alert(`¡Registro exitoso! Bienvenido ${registeredUser.name} (${registeredUser.tipoUsuario})`);
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.isLoading.set(false);
        alert('Error de registro: ' + (error.message || 'No se pudo completar el registro'));
      }
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get tipoUsuario() { return this.registerForm.get('tipoUsuario'); }

  getRoleDescription(tipo: TipoUsuario): string {
    switch (tipo) {
      case TipoUsuario.ESTUDIANTE:
        return 'Estudiante - Acceso a préstamos y reservas';
      case TipoUsuario.DOCENTE:
        return 'Docente - Acceso extendido a recursos';
      case TipoUsuario.ADMIN:
        return 'Administrador - Acceso completo al sistema';
      default:
        return '';
    }
  }

  getRoleIcon(tipo: TipoUsuario): string {
    switch (tipo) {
      case TipoUsuario.ESTUDIANTE:
        return '🎓';
      case TipoUsuario.DOCENTE:
        return '👨‍🏫';
      case TipoUsuario.ADMIN:
        return '👑';
      default:
        return '👤';
    }
  }
}
