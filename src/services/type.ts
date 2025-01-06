export type BaseFilter = {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export function isKeyOf<T extends object>(key: string | number | symbol, obj: T): key is keyof T {
    if (typeof obj !== 'object') return false;
    if (!obj) return false;
    return key in obj;
}