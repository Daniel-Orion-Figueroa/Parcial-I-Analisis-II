import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  standalone: true
})
export class DashboardPage {
  userName = signal('Usuario');
  activeLoans = signal(3);
  overdueLoans = signal(1);
  reservedBooks = signal(2);
  recentActivity = signal([
    {
      id: 1,
      type: 'loan',
      title: 'El Principito',
      date: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      type: 'return',
      title: '1984',
      date: '2024-01-10',
      status: 'returned'
    },
    {
      id: 3,
      type: 'reservation',
      title: 'Cien Años de Soledad',
      date: '2024-01-20',
      status: 'pending'
    }
  ]);

  constructor(private router: Router) {}

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  navigateToLoans(): void {
    this.router.navigate(['/loans']);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'loan':
        return '📚';
      case 'return':
        return '✅';
      case 'reservation':
        return '📋';
      default:
        return '📖';
    }
  }

  getActivityText(type: string): string {
    switch (type) {
      case 'loan':
        return 'Préstamo';
      case 'return':
        return 'Devolución';
      case 'reservation':
        return 'Reserva';
      default:
        return 'Actividad';
    }
  }
}
