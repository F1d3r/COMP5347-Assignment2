import { Review } from "./review";


export interface Phone {
    _id: string,
    title: string;
    brand: string;
    stock: number;
    seller: string;
    price: number;
    reviews: Review[];
    disabled: boolean;
    avgRating?: number;
}
