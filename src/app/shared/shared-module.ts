import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityPipe } from './pipes/availability-pipe';
import { FilterBooksPipe } from './pipes/filter-books-pipe';
import { LoanStatusPipe } from './pipes/loan-status-pipe';
import { UserTypePipe } from './pipes/user-type-pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AvailabilityPipe,
    FilterBooksPipe,
    LoanStatusPipe,
    UserTypePipe,
  ],
  exports: [
    AvailabilityPipe,
    FilterBooksPipe,
    LoanStatusPipe,
    UserTypePipe
  ]
})
export class SharedModule {}
