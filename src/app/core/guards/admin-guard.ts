import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { USER_TYPES } from '../constants/user-types.constants';

export const adminGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (user && user.type === USER_TYPES.ADMIN) {
    return true;
  }

  router.navigate(['/home']);
  return false;

}
