export interface Reservation {
    id: number;
    bookId: number;
    userId: number;
    reservationDate: Date;
    status: string;
}
