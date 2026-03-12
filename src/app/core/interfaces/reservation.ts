import { User } from './user';
import { Book } from './book';

export interface Reservation {
    id: number;
    user: User;
    book: Book;
    reservationDate: string;
    status: ReservationStatus;
}

export enum ReservationStatus {
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}
