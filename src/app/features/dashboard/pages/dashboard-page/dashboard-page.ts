import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TipoUsuario } from '../../../../core/interfaces/user';
import { ClearStorageUtil } from '../../../../core/utils/clear-storage.util';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  standalone: true
})
export class DashboardPage implements OnInit {
  userName = signal('Usuario');
  userRole = signal<TipoUsuario | null>(null);
  activeLoans = signal(3);
  overdueLoans = signal(1);
  reservedBooks = signal(2);
  totalBooks = signal(150);
  totalUsers = signal(45);
  availableBooks = signal(120);
  
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

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  navigateToLoans(): void {
    this.router.navigate(['/loans']);
  }

  navigateToReservations(): void {
    this.router.navigate(['/reservations']);
  }

  navigateToLoansManagement(): void {
    this.router.navigate(['/admin/loans-management']);
  }

  navigateToReservationsManagement(): void {
    this.router.navigate(['/admin/reservations-management']);
  }

  navigateToUsersManagement(): void {
    this.router.navigate(['/admin/users-management']);
  }

  clearAllData(): void {
    if (confirm('¿Estás seguro de eliminar todos los datos locales? Esto borrará usuarios mock, libros, préstamos, reservas, cookies y forzará la recarga completa de la página.')) {
      ClearStorageUtil.clearAndReload();
      alert('✅ Todos los datos locales han sido eliminados. La página se recargará automáticamente.');
    }
  }

  checkStorageData(): void {
    ClearStorageUtil.checkStorage();
  }

  navigateToBooksManagement(): void {
    this.router.navigate(['/admin/books-management']);
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  getWelcomeMessage(): string {
    switch (this.userRole()) {
      case TipoUsuario.ESTUDIANTE:
        return 'Bienvenido a tu biblioteca digital';
      case TipoUsuario.DOCENTE:
        return 'Bienvenido al portal docente';
      case TipoUsuario.ADMIN:
        return 'Panel de Administración';
      default:
        return 'Bienvenido';
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
}
