import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooksManagement } from './pages/books-management/books-management';
import { UsersManagement } from './pages/users-management/users-management';
import { LoansManagementComponent } from './pages/loans-management/loans-management';
import { ReservationsManagementComponent } from './pages/reservations-management/reservations-management';

const routes: Routes = [
  {
    path: 'books-management',
    component: BooksManagement,
    title: 'Gestión de Libros'
  },
  {
    path: 'users-management',
    component: UsersManagement,
    title: 'Gestión de Usuarios'
  },
  {
    path: 'loans-management',
    component: LoansManagementComponent,
    title: 'Gestión de Préstamos'
  },
  {
    path: 'reservations-management',
    component: ReservationsManagementComponent,
    title: 'Gestión de Reservas'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
