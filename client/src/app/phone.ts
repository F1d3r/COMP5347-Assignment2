import { User } from './user';
import { Review } from "./review";

export interface Phone {
    _id: string,
    title: string;
    brand: string;
    stock: number;
    seller: User;
    price: number;
    reviews: Review[];
    disabled: boolean;
    avgRating?: number;
}
