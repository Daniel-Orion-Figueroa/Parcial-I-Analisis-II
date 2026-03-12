import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Loader } from '../../../../shared/components/loader/loader';

@Component({
  selector: 'app-book-details-page',
  imports: [CommonModule, BookCardComponent, ConfirmDialog, Loader],
  templateUrl: './book-details-page.html',
  styleUrl: './book-details-page.css',
  standalone: true
})
export class BookDetailsPage {
  book = signal<any>(null);
  loading = signal(false);
  showConfirmDialog = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBook();
  }

  loadBook(): void {
    this.loading.set(true);
    
    // Simular carga de datos
    setTimeout(() => {
      const bookId = this.route.snapshot.paramMap.get('id');
      this.book.set(this.getMockBook(bookId));
      this.loading.set(false);
    }, 1000);
  }

  getMockBook(id: string | null): any {
    const books = [
      {
        id: '1',
        title: 'El Principito',
        author: 'Antoine de Saint-Exupéry',
        isbn: '978-3-16-148410-0',
        year: 1943,
        category: 'Ficción',
        availability: 'available',
        coverImage: '/assets/el-principito.jpg',
        description: 'Un clásico de la literatura que narra las aventuras de un pequeño príncipe en diferentes planetas. A través de sus encuentros con diversos personajes, el autor reflexiona sobre la vida, el amor y la pérdida.',
        publisher: 'Editorial Sudamericana',
        pages: 96,
        language: 'Español',
        rating: 4.5,
        reviews: 234
      },
      {
        id: '2',
        title: 'Cien Años de Soledad',
        author: 'Gabriel García Márquez',
        isbn: '978-0-06-088328-7',
        year: 1967,
        category: 'Realismo Mágico',
        availability: 'borrowed',
        coverImage: '/assets/cien-anos.jpg',
        description: 'La saga de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo. Una obra maestra del realismo mágico que explora la soledad y el destino latinoamericano.',
        publisher: 'Editorial Sudamericana',
        pages: 417,
        language: 'Español',
        rating: 4.8,
        reviews: 892
      }
    ];
    
    return books.find(book => book.id === id) || books[0];
  }

  onReserveBook(book: any): void {
    this.showConfirmDialog.set(true);
  }

  onConfirmReservation(): void {
    this.showConfirmDialog.set(false);
    console.log('Reservando libro:', this.book()?.title);
    // TODO: Implementar lógica de reserva
  }

  onCancelReservation(): void {
    this.showConfirmDialog.set(false);
  }

  onGoBack(): void {
    this.router.navigate(['/books']);
  }

  onEditBook(): void {
    console.log('Editar libro:', this.book()?.title);
    // TODO: Implementar navegación a edición
  }

  onDeleteBook(): void {
    console.log('Eliminar libro:', this.book()?.title);
    // TODO: Implementar lógica de eliminación
  }
}
