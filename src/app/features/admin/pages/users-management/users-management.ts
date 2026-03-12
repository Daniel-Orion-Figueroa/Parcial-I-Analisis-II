import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, TipoUsuario } from '../../../../core/interfaces/user';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
  standalone: true
})
export class UsersManagement implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  showAddForm = signal(false);
  editingUser = signal<User | null>(null);
  formData = signal<Partial<User>>({});
  userTypes = Object.values(TipoUsuario);

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    
    // CONSUMIR API REAL CON USER SERVICE
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading.set(false);
        // Si falla la API, mostrar mensaje pero no cargar datos mock
        alert('Error loading users from API. Please check backend connection.');
      }
    });
  }

  onSearch(searchData: { term: string }): void {
    this.searchTerm.set(searchData.term);
    this.filterUsers();
  }

  private filterUsers(): void {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();
    
    if (!term) {
      this.filteredUsers.set(allUsers);
      return;
    }

    const filtered = allUsers.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.tipoUsuario.toLowerCase().includes(term)
    );

    this.filteredUsers.set(filtered);
  }

  onAddUser(): void {
    this.showAddForm.set(true);
    this.editingUser.set(null);
    this.formData.set({
      name: '',
      email: '',
      password: '',
      tipoUsuario: TipoUsuario.ESTUDIANTE,
      fechaRegistro: new Date().toISOString().split('T')[0]
    });
  }

  onEditUser(user: User): void {
    this.editingUser.set(user);
    this.showAddForm.set(true);
    this.formData.set({ ...user });
  }

  onDeleteUser(user: User): void {
    if (confirm(`¿Estás seguro de eliminar a "${user.name}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          // El servicio ya actualiza el estado internamente
          this.filterUsers();
          alert('Usuario eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user. Please try again.');
        }
      });
    }
  }

  onSaveUser(): void {
    if (this.editingUser()) {
      // Edit existing user
      this.userService.updateUser(this.editingUser()!.id, this.formData()).subscribe({
        next: (updatedUser) => {
          // El servicio ya actualiza el estado internamente
          this.showAddForm.set(false);
          this.editingUser.set(null);
          this.filterUsers();
          alert('Usuario actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Error updating user. Please try again.');
        }
      });
    } else {
      // Add new user
      this.userService.createUser(this.formData()).subscribe({
        next: (newUser) => {
          // El servicio ya actualiza el estado internamente
          this.showAddForm.set(false);
          this.editingUser.set(null);
          this.filterUsers();
          alert('Usuario creado exitosamente');
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert('Error creating user. Please try again.');
        }
      });
    }
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingUser.set(null);
  }

  updateFormField(field: keyof User, value: any): void {
    const current = this.formData();
    this.formData.set({ ...current, [field]: value });
  }

  getTotalUsers(): number {
    return this.users().length;
  }

  getStudentsCount(): number {
    return this.users().filter(user => user.tipoUsuario === TipoUsuario.ESTUDIANTE).length;
  }

  getTeachersCount(): number {
    return this.users().filter(user => user.tipoUsuario === TipoUsuario.DOCENTE).length;
  }

  getAdminsCount(): number {
    return this.users().filter(user => user.tipoUsuario === TipoUsuario.ADMIN).length;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getRoleIcon(tipoUsuario: string): string {
    switch (tipoUsuario) {
      case 'ESTUDIANTE': return '👨‍🎓';
      case 'DOCENTE': return '👨‍🏫';
      case 'ADMIN': return '👨‍💼';
      default: return '👤';
    }
  }
 
  getRoleColor(tipoUsuario: string): string {
    switch (tipoUsuario) {
      case 'ESTUDIANTE': return '#4CAF50';
      case 'DOCENTE': return '#2196F3';
      case 'ADMIN': return '#FF5722';
      default: return '#9E9E9E';
    }
  }

  refreshUsers(): void {
    console.log('🔄 Refrescando usuarios desde API...');
    this.loadUsers();
  }
}
