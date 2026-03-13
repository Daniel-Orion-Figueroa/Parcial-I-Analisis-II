import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TipoUsuario } from '../../../core/interfaces/user';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true
})
export class HeaderComponent implements OnInit {
  userName = signal('Usuario');
  userRole = signal<TipoUsuario | null>(null);
  isMenuOpen = signal(false);

  // Exponer TipoUsuario para el template
  TipoUsuario = TipoUsuario;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName.set(currentUser.name);
      this.userRole.set(currentUser.tipoUsuario);
    }
  }

  get isAdmin(): boolean {
    return this.userRole() === TipoUsuario.ADMIN;
  }

  get isTeacher(): boolean {
    return this.userRole() === TipoUsuario.DOCENTE;
  }

  get isStudent(): boolean {
    return this.userRole() === TipoUsuario.ESTUDIANTE;
  }

  getRoleIcon(): string {
    switch (this.userRole()) {
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

  getRoleColor(): string {
    switch (this.userRole()) {
      case TipoUsuario.ESTUDIANTE:
        return '#28a745';
      case TipoUsuario.DOCENTE:
        return '#007bff';
      case TipoUsuario.ADMIN:
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getRoleDescription(): string {
    switch (this.userRole()) {
      case TipoUsuario.ESTUDIANTE:
        return 'Estudiante';
      case TipoUsuario.DOCENTE:
        return 'Docente';
      case TipoUsuario.ADMIN:
        return 'Administrador';
      default:
        return 'Usuario';
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.closeMenu();
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
    this.closeMenu();
  }

  navigateToLoans(): void {
    this.router.navigate(['/loans']);
    this.closeMenu();
  }

  navigateToReservations(): void {
    this.router.navigate(['/reservations']);
    this.closeMenu();
  }

  navigateToBooksManagement(): void {
    this.router.navigate(['/admin/books-management']);
    this.closeMenu();
  }

  navigateToUsersManagement(): void {
    this.router.navigate(['/admin/users-management']);
    this.closeMenu();
  }

  navigateToLoansManagement(): void {
    this.router.navigate(['/admin/loans-management']);
    this.closeMenu();
  }

  navigateToReservationsManagement(): void {
    this.router.navigate(['/admin/reservations-management']);
    this.closeMenu();
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
