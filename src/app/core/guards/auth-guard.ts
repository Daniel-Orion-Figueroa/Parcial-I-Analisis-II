import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Verificando autenticación...');

  return authService.user$.pipe(
    take(1),
    map(user => {

      // Verificar tanto el BehaviorSubject como el localStorage
      const currentUser = user || authService.getCurrentUser();
      
      console.log('AuthGuard: Usuario encontrado:', currentUser);
      console.log('AuthGuard: Usuario del BehaviorSubject:', user);
      console.log('AuthGuard: Usuario del localStorage:', authService.getCurrentUser());
      
      if (currentUser) {
        console.log('AuthGuard: Acceso permitido al dashboard');
        return true;
      }

      console.log('AuthGuard: Acceso denegado, redirigiendo al login');
      router.navigate(['/auth/login']);
      return false;

    })
  );

}