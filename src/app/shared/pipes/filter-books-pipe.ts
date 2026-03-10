import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBooks',
})
export class FilterBooksPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
