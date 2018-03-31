import { RoleType } from "../../core/common";

export interface AuthResult {
    email: string;
    role: RoleType;
}