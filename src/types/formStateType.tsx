interface TaskFormState {
    _id?: string;
    title: string;
    note?: Note;
    labels: Label[];
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    repeat?: { value: number, unit: 'day' | 'week' | 'month' | 'year' };
    isAnnouncement: boolean;
    isCompleted: boolean;
}

interface NoteFormState {
    _id?: string;
    title: string;
    content: string;
    labels: Label[];
}

type FormState = TaskFormState | NoteFormState;

export type { FormState, TaskFormState, NoteFormState };