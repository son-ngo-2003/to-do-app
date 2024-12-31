import {NoteFormState, TaskFormState} from "../types/formStateType";
import {getNextEntireHour} from "../utils/dateUtil";

const createInitialTask = (task: Task | undefined): TaskFormState => ({
    title: task?.title || '',
    note: task?.note,
    labels: task?.labels || [],
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
    labels: taskFormState.labels,
    start: taskFormState.startDate,
    end: taskFormState.endDate,
    isAllDay: taskFormState.isAllDay,
    repeat: taskFormState.repeat,
    isAnnouncement: taskFormState.isAnnouncement,
    isCompleted: taskFormState.isCompleted,
});

const isStateOfTask = (taskState: TaskFormState, task: Task): boolean => {
    return taskState.title === task.title &&
        taskState.note === task.note &&
        taskState.labels === task.labels &&
        taskState.startDate === task.start &&
        taskState.endDate === task.end &&
        taskState.isAllDay === task.isAllDay &&
        taskState.repeat === task.repeat &&
        taskState.isAnnouncement === task.isAnnouncement &&
        taskState.isCompleted === task.isCompleted;
}

const createInitialNote = (note: Note | undefined): NoteFormState => ({
    title: note?.title || '',
    content: note?.content || '',
    labels: note?.labels || [],
});

const fromStateToNote = (noteFormState: NoteFormState): Partial<Note> => ({
    title: noteFormState.title,
    content: noteFormState.content,
    labels: noteFormState.labels,
});

const isStateOfNote = (noteState: NoteFormState, note: Note): boolean => {
    return noteState.title === note.title &&
        noteState.content === note.content &&
        noteState.labels === note.labels;
}

export {
    createInitialTask,
    createInitialNote,
    fromStateToTask,
    fromStateToNote,
    isStateOfTask,
    isStateOfNote,
}