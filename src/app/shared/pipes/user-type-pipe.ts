import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userType',
})
export class UserTypePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
