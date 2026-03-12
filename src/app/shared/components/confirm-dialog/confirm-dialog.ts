import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  standalone: true
})
export class ConfirmDialog {
  @Input() title: string = 'Confirmar Acción';
  @Input() message: string = '¿Estás seguro de realizar esta acción?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() isOpen: boolean = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
    this.closeDialog();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeDialog();
  }

  closeDialog(): void {
    this.close.emit();
  }

  getDialogClass(): string {
    return `confirm-dialog confirm-dialog--${this.type}`;
  }

  getConfirmButtonClass(): string {
    return `btn btn--confirm btn--${this.type}`;
  }
}
