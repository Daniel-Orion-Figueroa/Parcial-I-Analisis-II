import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
  standalone: true
})
export class Loader {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() text: string = '';
  @Input() showText: boolean = false;

  getLoaderClass(): string {
    return `loader loader--${this.size} loader--${this.color}`;
  }

  getTextClass(): string {
    return `loader-text loader-text--${this.size}`;
  }
}
