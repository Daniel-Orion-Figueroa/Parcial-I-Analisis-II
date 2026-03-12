import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () =>
        import('./features/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'dashboard',
        loadChildren: () =>
        import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [authGuard]
    },
    {
        path: 'books',
        loadChildren: () =>
        import('./features/books/books.module').then(m => m.BooksModule),
        canActivate: [authGuard]
    },
    {
        path: 'loans',
        loadChildren: () =>
        import('./features/loans/loans.module').then(m => m.LoansModule),
        canActivate: [authGuard]
    },
    {
        path: 'reservations',
        loadChildren: () =>
        import('./features/reservations/reservations.module').then(m => m.ReservationsModule),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        loadChildren: () =>
        import('./features/admin/admin.module').then(m => m.AdminModule),
        canActivate: [authGuard, adminGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
]