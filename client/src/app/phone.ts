import { Review } from "./review";

export interface Phone {
    title: string;
    brand: string;
    stock: number;
    seller: string;
    price: number;
    reviews: Review[];
    disabled: boolean;
    avgRating?: number;
}
