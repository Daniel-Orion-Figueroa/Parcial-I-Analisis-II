import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TipoUsuario } from '../../../../core/interfaces/user';
import { BookService } from '../../../../core/services/book.service';
import { LoanService } from '../../../../core/services/loan.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { UserService } from '../../../../core/services/user.service';
import { HeaderComponent } from '../../../../shared/components/header/header';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  standalone: true
})
export class DashboardPage implements OnInit {
  userName = signal('Usuario');
  userRole = signal<TipoUsuario | null>(null);
  
  // Estadísticas reales de la base de datos
  totalBooks = signal(0);
  availableBooks = signal(0);
  totalUsers = signal(0);
  activeLoans = signal(0);
  overdueLoans = signal(0);
  reservedBooks = signal(0);
  totalReservations = signal(0);
  
  // Exponer TipoUsuario para el template
  TipoUsuario = TipoUsuario;

  constructor(
    private router: Router,
    private authService: AuthService,
    private bookService: BookService,
    private loanService: LoanService,
    private reservationService: ReservationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName.set(currentUser.name);
      this.userRole.set(currentUser.tipoUsuario);
    }
    
    // Cargar datos reales de la base de datos
    this.loadRealData();
  }

  private async loadRealData(): Promise<void> {
    try {
      // Cargar todas las estadísticas en paralelo
      const [books, loans, reservations, users] = await Promise.all([
        this.bookService.getBooks().toPromise(),
        this.loanService.getAllLoans().toPromise(),
        this.reservationService.getAllReservations().toPromise(),
        this.userService.getUsers().toPromise()
      ]);

      // Actualizar estadísticas
      this.totalBooks.set(books?.length || 0);
      this.availableBooks.set(books?.filter((book: any) => book.disponible).length || 0);
      
      this.activeLoans.set(loans?.filter((loan: any) => loan.status === 'ACTIVE').length || 0);
      this.overdueLoans.set(loans?.filter((loan: any) => loan.status === 'LATE').length || 0);
      
      this.reservedBooks.set(reservations?.filter((res: any) => res.estado === 'ACTIVA').length || 0);
      this.totalReservations.set(reservations?.length || 0);
      this.totalUsers.set(users?.length || 0);
      
    } catch (error) {
      console.error('Error cargando datos reales del dashboard:', error);
      // En caso de error, mantener valores en 0
      this.totalBooks.set(0);
      this.availableBooks.set(0);
      this.totalUsers.set(0);
      this.activeLoans.set(0);
      this.overdueLoans.set(0);
      this.reservedBooks.set(0);
      this.totalReservations.set(0);
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
