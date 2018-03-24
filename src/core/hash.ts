import { FNV1A, toHexString } from "../utility/hash";

export function hash1(salt: string, email: string, userName: string, password: string): string {
    return toHexString(FNV1A.hash32(email + userName) + FNV1A.hash64(password + salt));
}