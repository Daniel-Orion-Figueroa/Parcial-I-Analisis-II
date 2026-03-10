export interface Loan {
    id: number;
    userId: number;
    bookId: number;
    loanDate: Date;
    returnDate: Date;
    status: string;
}