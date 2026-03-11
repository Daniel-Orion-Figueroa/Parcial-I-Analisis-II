import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-books-list-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './books-list-page.html',
  styleUrl: './books-list-page.css',
  standalone: true
})
export class BooksListPage {
  searchTerm = '';
  
  books = signal([
    {
      id: 1,
      title: 'El Principito',
      author: 'Antoine de Saint-Exupéry',
      isbn: '978-3-12-132724-7',
      year: 1943,
      category: 'Ficción',
      available: true,
      coverImage: '/assets/el-principito.jpg'
    },
    {
      id: 2,
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-452-28423-4',
      year: 1949,
      category: 'Ciencia Ficción',
      available: false,
      coverImage: '/assets/1984.jpg'
    },
    {
      id: 3,
      title: 'Cien Años de Soledad',
      author: 'Gabriel García Márquez',
      isbn: '978-0-06-088328-7',
      year: 1967,
      category: 'Realismo Mágico',
      available: true,
      coverImage: '/assets/cien-anos.jpg'
    }
  ]);

  filteredBooks = signal([...this.books()]);

  onSearch(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value;
    
    const books = this.books();
    if (!searchTerm) {
      this.filteredBooks.set(books);
      return;
    }

    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
    );
    
    this.filteredBooks.set(filtered);
  }

  onReserveBook(book: any): void {
    console.log('Reservando libro:', book.title);
    // TODO: Implementar lógica de reserva
  }
}
