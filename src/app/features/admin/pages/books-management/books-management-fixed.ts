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
    
    // CONSUMIR API REAL
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.filteredBooks.set(books);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading.set(false);
      }
    });
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
      // ELIMINAR CON API REAL
      this.bookService.deleteBook(book.id).subscribe({
        next: () => {
          const currentBooks = this.books().filter(b => b.id !== book.id);
          this.books.set(currentBooks);
          this.filterBooks();
          alert('Libro eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error deleting book:', error);
        }
      });
    }
  }

  onSaveBook(): void {
    if (this.editingBook()) {
      // Editar libro existente - API REAL
      this.bookService.updateBook(this.editingBook()!.id, this.formData()).subscribe({
        next: (updatedBook) => {
          const books = this.books().map(b =>
            b.id === updatedBook.id ? updatedBook : b
          );
          this.books.set(books);
          this.onCancelForm();
          this.filterBooks();
        },
        error: (error) => {
          console.error('Error updating book:', error);
        }
      });
    } else {
      // Crear nuevo libro - API REAL
      this.bookService.createBook(this.formData()).subscribe({
        next: (newBook) => {
          this.books.set([...this.books(), newBook]);
          this.onCancelForm();
          this.filterBooks();
        },
        error: (error) => {
          console.error('Error creating book:', error);
        }
      });
    }
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
