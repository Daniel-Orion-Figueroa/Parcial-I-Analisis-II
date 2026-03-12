import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, TipoUsuario } from '../../../../core/interfaces/user';
import { AuthService } from '../../../../core/services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    
    // Datos mock que coinciden con el backend
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.ESTUDIANTE,
        fechaRegistro: '2024-01-15'
      },
      {
        id: 2,
        name: 'María García',
        email: 'maria.garcia@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.DOCENTE,
        fechaRegistro: '2024-01-10'
      },
      {
        id: 3,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.ESTUDIANTE,
        fechaRegistro: '2024-02-01'
      },
      {
        id: 4,
        name: 'Ana Martínez',
        email: 'ana.martinez@university.edu',
        password: 'password123',
        tipoUsuario: TipoUsuario.ADMIN,
        fechaRegistro: '2023-12-15'
      }
    ];

    this.users.set(mockUsers);
    this.filteredUsers.set(mockUsers);
    this.isLoading.set(false);
  }

  onSearch(searchData: { term: string; filter?: string }): void {
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
      console.log('Eliminando usuario:', user);
      
      const currentUsers = this.users().filter(u => u.id !== user.id);
      this.users.set(currentUsers);
      this.filterUsers();
      
      alert('Usuario eliminado exitosamente');
    }
  }

  onSaveUser(): void {
    const userData = this.formData();
    
    if (this.editingUser()) {
      // Editar usuario existente
      const updatedUser = { ...this.editingUser()!, ...userData };
      const currentUsers = this.users().map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      this.users.set(currentUsers);
      alert('Usuario actualizado exitosamente');
    } else {
      // Agregar nuevo usuario
      const newUser: User = {
        id: Math.max(...this.users().map(u => u.id)) + 1,
        name: userData.name || '',
        email: userData.email || '',
        password: userData.password || '',
        tipoUsuario: userData.tipoUsuario || TipoUsuario.ESTUDIANTE,
        fechaRegistro: userData.fechaRegistro || new Date().toISOString().split('T')[0]
      };
      
      this.users.set([...this.users(), newUser]);
      alert('Usuario agregado exitosamente');
    }
    
    this.showAddForm.set(false);
    this.editingUser.set(null);
    this.filterUsers();
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingUser.set(null);
  }

  updateFormField(field: keyof User, value: any): void {
    const current = this.formData();
    this.formData.set({ ...current, [field]: value });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
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

  getRoleColor(tipoUsuario: TipoUsuario): string {
    switch (tipoUsuario) {
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

  getRoleIcon(tipoUsuario: TipoUsuario): string {
    switch (tipoUsuario) {
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
}
