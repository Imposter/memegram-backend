export class FNV1A {
    private static prime32: number = 0x01000193;
    private static offset32: number = 0x811C9DC5;
    private static prime64: number = 0x00000100000001B3;
    private static offset64: number = 0xCBF29CE484222325;

    public static hash32(data: Buffer | string, prime?: number, offset?: number): number {
        var p = prime || FNV1A.prime32;
        var o = offset || FNV1A.offset32;

        var hash = o;
        for (var i = 0; i < data.length; i++) {
            hash *= prime;
            hash ^= data[i] as number;
        }

        return hash;
    }

    public static hash64(data: Buffer | string, prime?: number, offset?: number): number {
        var p = prime || FNV1A.prime64;
        var o = offset || FNV1A.offset64;

        var hash = o;
        for (var i = 0; i < data.length; i++) {
            hash *= prime;
            hash ^= data[i] as number;
        }

        return hash;
    }
}

export function toHexString(hash: number): string {
    return hash.toString(16);
}