import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-books-list-page',
  imports: [CommonModule, FormsModule, BookCardComponent, SearchBarComponent, EmptyState],
  templateUrl: './books-list-page.html',
  styleUrls: ['./books-list-page.css'],
  standalone: true
})
export class BooksListPage {
  books = signal([
    {
      id: 1,
      title: 'El Principito',
      author: 'Antoine de Saint-Exupéry',
      isbn: '978-3-16-148410-0',
      year: 1943,
      category: 'Ficción',
      availability: 'available',
      coverImage: '/assets/el-principito.jpg',
      description: 'Un clásico de la literatura que narra las aventuras de un pequeño príncipe en diferentes planetas.'
    },
    {
      id: 2,
      title: 'Cien Años de Soledad',
      author: 'Gabriel García Márquez',
      isbn: '978-0-06-088328-7',
      year: 1967,
      category: 'Realismo Mágico',
      availability: 'borrowed',
      coverImage: '/assets/cien-anos.jpg',
      description: 'La saga de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.'
    },
    {
      id: 3,
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-452-28423-4',
      year: 1949,
      category: 'Ciencia Ficción',
      availability: 'reserved',
      coverImage: '/assets/1984.jpg',
      description: 'Una novela distópica que explora los peligros del totalitarismo y la vigilancia masiva.'
    }
  ]);

  filteredBooks = signal([...this.books()]);
  searchTerm = '';

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

  onReserveBook(book: any): void {
    console.log('Reservando libro:', book.title);
    // TODO: Implementar lógica de reserva
  }

  onViewBookDetails(book: any): void {
    console.log('Ver detalles del libro:', book.title);
    // TODO: Implementar navegación a detalles
  }
}
