const basicCompare = (val_a: any, val_b: any) : number => {
    if (val_a > val_b) return 1;
    if (val_a < val_b) return -1;
    return 0;
}

export const generalCompare = (a: any, b: any, sortOrder?: 'asc' | 'desc') : number => {
    if (myIsFalsy(a)) return myIsFalsy(b) ? 0 : -1;
    if (myIsFalsy(b)) return 1;
    if (typeof a !== typeof b) return 0;

    if (typeof a === 'boolean' && typeof b === 'boolean') {
        return (a === b ? 0 : a ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1);
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * (sortOrder === 'asc' ? 1 : -1);
    }

    if (typeof a === 'string' && typeof b === 'string') {
        return basicCompare(a, b) * (sortOrder === 'asc' ? 1 : -1);
    }

    if (a instanceof Date && b instanceof Date) {
        return (a.getTime() - b.getTime()) * (sortOrder === 'asc' ? 1 : -1);
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            const result = generalCompare(a[i], b[i], sortOrder);
            if (result !== 0) return result;
        }
        return basicCompare(a.length, b.length) * (sortOrder === 'asc' ? 1 : -1);
    }

    return basicCompare(a, b) * (sortOrder === 'asc' ? 1 : -1);
}

const myIsFalsy = (val: any) => {
    if (val === undefined) return true;
    if (val === null) return true;
    if (isNaN(val)) return true;
    return false;
}