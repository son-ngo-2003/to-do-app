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

type FormState = TaskFormState;

export type { FormState, TaskFormState };