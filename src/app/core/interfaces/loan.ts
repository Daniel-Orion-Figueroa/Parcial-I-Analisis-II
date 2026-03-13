import { User } from './user';
import { Book } from './book';

export interface Loan {
    id: number;
    user: User;
    book: Book;
    loanDate: string;
    returnDate?: string;
    status: LoanStatus;
}

export enum LoanStatus {
    ACTIVE = 'ACTIVE',
    RETURNED = 'RETURNED', 
    LATE = 'LATE'
}

export interface CreateLoanRequest {
    bookId: number;
    userId: number;
    dueDate: string;
    notes?: string;
}

export interface UpdateLoanRequest {
    dueDate?: string;
    status?: LoanStatus;
    notes?: string;
}