import { RoleType } from "../../core/common";

export interface AuthCreateResult {
    name: string;
    email: string;
    role: RoleType;
}