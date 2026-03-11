import { Pipe, PipeTransform } from '@angular/core';
import { Book } from '../../core/interfaces/book';

@Pipe({
  name: 'filterBooks'
})
export class FilterBooksPipe implements PipeTransform {

  transform(books: Book[], search: string): Book[] {

    if (!books) return [];
    if (!search) return books;

    const searchLower = search.toLowerCase();

    return books.filter(book =>
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.category.toLowerCase().includes(searchLower)
    );
  }
}
