import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
  standalone: true
})
export class EmptyState {
  @Input() icon: string = '📚';
  @Input() title: string = 'No hay datos disponibles';
  @Input() message: string = 'No se encontraron elementos para mostrar';
  @Input() actionText: string = '';
  @Input() showAction: boolean = false;
  
  @Output() action = new EventEmitter<void>();

  onActionClick(): void {
    this.action.emit();
  }
}
