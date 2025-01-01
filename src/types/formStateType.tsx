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

interface LabelFormState {
    _id?: string;
    name: string;
    color: string;
}

type FormState = TaskFormState | NoteFormState | LabelFormState;

export type { FormState, TaskFormState, NoteFormState, LabelFormState };