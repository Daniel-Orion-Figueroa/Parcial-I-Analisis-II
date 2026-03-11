import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-card',
  imports: [CommonModule],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
  standalone: true
})
export class BookCardComponent {
  @Input() book: any;
  @Input() showActions = true;
}
