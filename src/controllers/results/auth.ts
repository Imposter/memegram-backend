import { RoleType } from "../../core/common";

export interface AuthCreateResult {
    email: string;
    role: RoleType;
}