import { User } from "./user";

export interface Review {
    _id?: string;
    reviewer: User;
    rating: number;
    comment: string;
    hidden: boolean;
}
