import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ReservationModalComponent } from '../../../../shared/components/reservation-modal/reservation-modal';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { BookService } from '../../../../core/services/book.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Book } from '../../../../core/interfaces/book';
import { ReservationStatus } from '../../../../core/interfaces/reservation';

@Component({
  selector: 'app-books-list-page',
  imports: [CommonModule, FormsModule, BookCardComponent, SearchBarComponent, EmptyState, ReservationModalComponent, ConfirmDialog],
  templateUrl: './books-list-page.html',
  styleUrls: ['./books-list-page.css'],
  standalone: true
})
export class BooksListPage implements OnInit {
  books = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  searchTerm = '';
  isLoading = signal(false);
  
  // Propiedades para el modal de reserva
  selectedBook = signal<Book | null>(null);
  isModalVisible = signal(false);
  isReserving = signal(false);
  
  // Propiedades para el modal de confirmación
  isConfirmDialogVisible = signal(false);
  confirmMessage = signal('');

  constructor(
    private bookService: BookService,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.isLoading.set(true);
    
    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('BooksListPage: Libros cargados:', books);
        this.books.set(books);
        this.filteredBooks.set(books);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('BooksListPage: Error cargando libros:', error);
        this.isLoading.set(false);
        // Si hay error, mostrar mensaje pero no cargar datos mock
        alert('Error loading books from API. Please check backend connection.');
      }
    });
  }

  onSearch(searchData: { term: string; filter?: string }): void {
    const books = this.books();
    let filtered = books;

    if (searchData.term) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchData.term.toLowerCase()) ||
        book.author.toLowerCase().includes(searchData.term.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchData.term.toLowerCase())
      );
    }

    if (searchData.filter && searchData.filter !== 'Todos') {
      filtered = filtered.filter(book => book.category === searchData.filter);
    }

    this.filteredBooks.set(filtered);
  }

  onReserveBook(book: Book): void {
    console.log('BooksListPage: Iniciando reserva del libro:', book.title);
    
    // Verificar que el usuario esté autenticado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('❌ Debes iniciar sesión para reservar un libro');
      return;
    }
    
    console.log('BooksListPage: Usuario autenticado:', currentUser);
    
    // Verificar disponibilidad del libro
    if (book.availableQuantity <= 0) {
      alert('❌ Este libro no está disponible para reserva');
      return;
    }
    
    // Abrir modal de confirmación
    this.selectedBook.set(book);
    this.isModalVisible.set(true);
  }

  // Métodos para el modal
  onModalClose(): void {
    this.isModalVisible.set(false);
    this.selectedBook.set(null);
  }

  onModalConfirm(book: Book): void {
    console.log('BooksListPage: Usuario confirmó reserva desde modal');
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.onModalClose();
      return;
    }
    
    this.isReserving.set(true);
    
    // Preparar datos para la reserva
    const reservationData = {
      bookId: book.id,
      userId: Number(currentUser.id), // Asegurar que sea número
      reservationDate: new Date().toISOString().split('T')[0],
      status: ReservationStatus.ACTIVE
    };
    
    console.log('BooksListPage: Datos de reserva:', reservationData);
    console.log('BooksListPage: bookId (type):', typeof book.id);
    console.log('BooksListPage: userId (type):', typeof Number(currentUser.id));
    
    // Llamar a la API para crear la reserva
    this.reservationService.createReservation(reservationData).subscribe({
      next: (newReservation) => {
        console.log('BooksListPage: ✅ Reserva creada exitosamente:', newReservation);
        this.isReserving.set(false);
        this.onModalClose();
        
        // Mostrar notificación de éxito usando modal
        this.showSuccessModal(`✅ ¡Reserva exitosa!\n\n"${book.title}" ha sido reservado para ti.\n📅 Fecha de reserva: ${newReservation.reservationDate}`);
        
        // Recargar libros para actualizar disponibilidad
        this.loadBooks();
      },
      error: (error) => {
        console.error('BooksListPage: ❌ Error al crear reserva:', error);
        console.error('BooksListPage: Error details:', error);
        this.isReserving.set(false);
        
        // Mostrar error específico del backend
        const backendMessage = error.error?.message || error.error?.error || error.message || 'Error desconocido';
        alert(`❌ Error al reservar libro: ${backendMessage}`);
      }
    });
  }

  onViewBookDetails(book: Book): void {
    console.log('Ver detalles del libro:', book.title);
    // TODO: Implementar navegación a detalles
    alert('Función de detalles en desarrollo.');
  }

  refreshBooks(): void {
    console.log('🔄 Refrescando libros desde API...');
    this.loadBooks();
  }

  // Métodos para el modal de confirmación
  showSuccessModal(message: string): void {
    this.confirmMessage.set(message);
    this.isConfirmDialogVisible.set(true);
  }

  onSuccessDialogClose(): void {
    this.isConfirmDialogVisible.set(false);
    this.confirmMessage.set('');
  }
}
