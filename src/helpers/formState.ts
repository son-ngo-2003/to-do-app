import {NoteFormState, TaskFormState} from "../types/formStateType";
import {getNextEntireHour} from "../utils/dateUtil";

const createInitialTask = (task: Task | undefined): TaskFormState => ({
    title: task?.title || '',
    note: task?.note,
    listLabels: task?.labels || [],
    startDate: task?.start || new Date(),
    endDate: task?.end || getNextEntireHour(new Date()),
    isAllDay: task?.isAllDay || false,
    repeat: task?.repeat || undefined,
    isAnnouncement: task?.isAnnouncement || false,
    isCompleted: task?.isCompleted || false,
});

const fromStateToTask = (taskFormState: TaskFormState): Partial<Task> => ({
    title: taskFormState.title,
    note: taskFormState.note,
    labels: taskFormState.listLabels,
    start: taskFormState.startDate,
    end: taskFormState.endDate,
    isAllDay: taskFormState.isAllDay,
    repeat: taskFormState.repeat,
    isAnnouncement: taskFormState.isAnnouncement,
    isCompleted: taskFormState.isCompleted,
});

const createInitialNote = (note: Note | undefined): NoteFormState => ({
    title: note?.title || '',
    content: note?.content || '',
    listLabels: note?.labels || [],
});

const fromStateToNote = (noteFormState: NoteFormState): Partial<Note> => ({
    title: noteFormState.title,
    content: noteFormState.content,
    labels: noteFormState.listLabels,
});

export {
    createInitialTask,
    createInitialNote,
    fromStateToTask,
    fromStateToNote,
}