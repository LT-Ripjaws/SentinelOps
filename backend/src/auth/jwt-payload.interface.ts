import {UserRole} from "../users/user-role.enum";

export interface JwtPayload {
    sub: string; // user ID
    email: string;
    role: UserRole;
}

// The JwtPayload interface defines the structure of the payload that will be included in the JWT token. 
// It includes the user's ID (sub), email, and role. 
// This information can be used to identify the user and their permissions when they make requests to protected routes.