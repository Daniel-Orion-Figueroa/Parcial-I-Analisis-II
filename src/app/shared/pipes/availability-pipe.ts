import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'availability'
})
export class AvailabilityPipe implements PipeTransform {

  transform(availableAmount: number): string {

    if (availableAmount > 0) {
      return 'Disponible';
    }

    return 'No disponible';
  }
}
