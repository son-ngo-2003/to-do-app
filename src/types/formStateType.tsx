interface TaskFormState {
    title: string;
    note?: Note;
    listLabels: Label[];
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    repeat?: { value: number, unit: 'day' | 'week' | 'month' | 'year' };
    isAnnouncement: boolean;
    isCompleted: boolean;
}

interface NoteFormState {
    title: string;
    content: string;
    listLabels: Label[];
}

type FormState = TaskFormState | NoteFormState;

export type { FormState, TaskFormState, NoteFormState };