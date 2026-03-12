import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../../../../core/interfaces/book';
import { BookService } from '../../../../core/services/book.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-books-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './books-management.html',
  styleUrl: './books-management.css',
  standalone: true
})
export class BooksManagement implements OnInit {
  books = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  showAddForm = signal(false);
  editingBook = signal<Book | null>(null);
  formData = signal<Partial<Book>>({});

  constructor(
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.isLoading.set(true);
    
    // Datos mock que coinciden con el backend
    const mockBooks: Book[] = [
      {
        id: 1,
        title: 'El Principito',
        author: 'Antoine de Saint-Exupéry',
        editorial: 'Santillana',
        publicationYear: 1943,
        isbn: '978-3-16-148410-0',
        category: 'Ficción',
        totalQuantity: 5,
        availableQuantity: 3,
        description: 'Un clásico de la literatura universal',
        imageUrl: ''
      },
      {
        id: 2,
        title: 'Cien Años de Soledad',
        author: 'Gabriel García Márquez',
        editorial: 'Oveja Negra',
        publicationYear: 1967,
        isbn: '978-0-06-088328-7',
        category: 'Realismo mágico',
        totalQuantity: 3,
        availableQuantity: 1,
        description: 'Obra maestra del realismo mágico',
        imageUrl: ''
      },
      {
        id: 3,
        title: '1984',
        author: 'George Orwell',
        editorial: 'Seix Barral',
        publicationYear: 1949,
        isbn: '978-0-452-28423-4',
        category: 'Ciencia ficción',
        totalQuantity: 4,
        availableQuantity: 2,
        description: 'Distopía clásica de Orwell',
        imageUrl: ''
      },
      {
        id: 4,
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        editorial: 'Cátedra',
        publicationYear: 1605,
        isbn: '978-84-376-0494-7',
        category: 'Clásicos',
        totalQuantity: 2,
        availableQuantity: 0,
        description: 'La obra cumbre de la literatura española',
        imageUrl: ''
      }
    ];

    this.books.set(mockBooks);
    this.filteredBooks.set(mockBooks);
    this.isLoading.set(false);
  }

  onSearch(searchData: { term: string; filter?: string }): void {
    this.searchTerm.set(searchData.term);
    this.filterBooks();
  }

  private filterBooks(): void {
    const term = this.searchTerm().toLowerCase();
    const allBooks = this.books();
    
    if (!term) {
      this.filteredBooks.set(allBooks);
      return;
    }

    const filtered = allBooks.filter(book => 
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.category.toLowerCase().includes(term)
    );

    this.filteredBooks.set(filtered);
  }

  onAddBook(): void {
    this.showAddForm.set(true);
    this.editingBook.set(null);
    this.formData.set({
      title: '',
      author: '',
      editorial: '',
      publicationYear: new Date().getFullYear(),
      isbn: '',
      category: '',
      totalQuantity: 1,
      availableQuantity: 1,
      description: '',
      imageUrl: ''
    });
  }

  onEditBook(book: Book): void {
    this.editingBook.set(book);
    this.showAddForm.set(true);
    this.formData.set({ ...book });
  }

  onDeleteBook(book: Book): void {
    if (confirm(`¿Estás seguro de eliminar "${book.title}"?`)) {
      // TODO: Implementar eliminación con backend
      console.log('Eliminando libro:', book);
      
      const currentBooks = this.books().filter(b => b.id !== book.id);
      this.books.set(currentBooks);
      this.filterBooks();
      
      alert('Libro eliminado exitosamente');
    }
  }

  onSaveBook(): void {
    const bookData = this.formData();
    
    if (this.editingBook()) {
      // Editar libro existente
      const updatedBook = { ...this.editingBook()!, ...bookData };
      const currentBooks = this.books().map(b => 
        b.id === updatedBook.id ? updatedBook : b
      );
      this.books.set(currentBooks);
      alert('Libro actualizado exitosamente');
    } else {
      // Agregar nuevo libro
      const newBook: Book = {
        id: Math.max(...this.books().map(b => b.id)) + 1,
        title: bookData.title || '',
        author: bookData.author || '',
        editorial: bookData.editorial || '',
        publicationYear: bookData.publicationYear || new Date().getFullYear(),
        isbn: bookData.isbn || '',
        category: bookData.category || '',
        totalQuantity: bookData.totalQuantity || 1,
        availableQuantity: bookData.availableQuantity || bookData.totalQuantity || 1,
        description: bookData.description || '',
        imageUrl: bookData.imageUrl || ''
      };
      
      this.books.set([...this.books(), newBook]);
      alert('Libro agregado exitosamente');
    }
    
    this.showAddForm.set(false);
    this.editingBook.set(null);
    this.filterBooks();
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingBook.set(null);
  }

  updateFormField(field: keyof Book, value: any): void {
    const current = this.formData();
    this.formData.set({ ...current, [field]: value });
  }

  parseNumber(value: string): number {
    return parseInt(value) || 0;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getTotalBooks(): number {
    return this.books().length;
  }

  getAvailableBooks(): number {
    return this.books().filter(book => book.availableQuantity > 0).length;
  }

  getUnavailableBooks(): number {
    return this.books().filter(book => book.availableQuantity === 0).length;
  }
}
