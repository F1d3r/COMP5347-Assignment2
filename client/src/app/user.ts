export interface User {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    isVerified: boolean;
    isAdmin: boolean;
    disabled: boolean;
    registDate: Date;
    verifyToken?: string;  // Optional with ? since it has default: null
}