import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class Navbar {
  @Input() title: string = 'Biblioteca Online';
  @Input() showUserMenu: boolean = true;
  @Input() userName: string = 'Usuario';
  @Input() userAvatar: string = '';
  
  isMenuOpen = false;
  isUserMenuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.isUserMenuOpen = false;
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.isUserMenuOpen = false;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
