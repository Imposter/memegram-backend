import { Role } from "../../core/common";

export interface AuthCreateResult {
    name: string;
    email: string;
    role: Role;
}