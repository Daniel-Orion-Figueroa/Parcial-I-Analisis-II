import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  imports: [CommonModule],
  templateUrl: './form-input.html',
  styleUrl: './form-input.css',
  standalone: true
})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() error: string | null = null;
  @Input() value: string = '';
  @Input() showPasswordToggle: boolean = false;
  @Input() showPassword: boolean = false;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
  
  onBlur(): void {
    this.blur.emit();
  }
  
  onFocus(): void {
    this.focus.emit();
  }
}
