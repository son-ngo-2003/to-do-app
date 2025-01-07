export type BaseFilter = {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export type TaskFilter = {
    searchTerm?: string,
    labelIds?: Label['_id'][],
    noteIds?: Note['_id'][],
    date?: Date,
    isCompleted?: boolean,
    isRepeat?: boolean,
    isOverdue?: boolean,
    parentTaskId?: Task['_id'],
}

export type LabelFilter = {
    searchTerm?: string,
    color?: string,
}

export type NoteFilter = {
    searchTerm?: string,
    labelIds?: Label['_id'][],
}

export function isKeyOf<T extends object>(key: string | number | symbol, obj: T): key is keyof T {
    if (typeof obj !== 'object') return false;
    if (!obj) return false;
    return key in obj;
}