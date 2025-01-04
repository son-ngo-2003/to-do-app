import {LabelFormState, NoteFormState, TaskFormState} from "../types/formStateType";
import {getNextEntireHour} from "../utils/dateUtil";

const createInitialTask = (task?: Task): TaskFormState => ({
    _id: task?._id || '',
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
    _id: taskFormState._id,
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
        taskState.note?._id === task.note?._id &&
        taskState.labels === task.labels &&
        taskState.startDate === task.start &&
        taskState.endDate === task.end &&
        taskState.isAllDay === task.isAllDay &&
        taskState.repeat === task.repeat &&
        taskState.isAnnouncement === task.isAnnouncement &&
        taskState.isCompleted === task.isCompleted &&
        taskState._id === task._id;
}

const isTaskStateEmpty = (taskState: TaskFormState): boolean => {
    return taskState.title === '' &&
        taskState.note === undefined &&
        taskState.labels.length === 0 &&
        taskState.repeat === undefined &&
        taskState._id === '';
}

const createInitialNote = (note?: Note): NoteFormState => ({
    _id: note?._id || '',
    title: note?.title || '',
    content: note?.content || '',
    labels: note?.labels || [],
});

const fromStateToNote = (noteFormState: NoteFormState): Partial<Note> => ({
    _id: noteFormState._id,
    title: noteFormState.title,
    content: noteFormState.content,
    labels: noteFormState.labels,
});

const isStateOfNote = (noteState: NoteFormState, note: Note): boolean => {
    return noteState.title === note.title &&
        noteState.content === note.content &&
        noteState.labels === note.labels &&
        noteState._id === note._id;
}

const isNoteStateEmpty = (noteState: NoteFormState): boolean => {
    return noteState.title === '' &&
        noteState.content === '' &&
        noteState.labels.length === 0 &&
        noteState._id === '';
}

const createInitialLabel = (label?: Label): LabelFormState => ({
    _id: label?._id || '',
    name: label?.name || '',
    color: label?.color || '',
});

const fromStateToLabel = (labelFormState: LabelFormState): Partial<Label> => ({
    _id: labelFormState._id,
    name: labelFormState.name,
    color: labelFormState.color,
});

const isStateOfLabel = (labelState: LabelFormState, label: Label): boolean => {
    return labelState.name === label.name &&
        labelState.color === label.color &&
        labelState._id === label._id;
}

const isLabelStateEmpty = (labelState: LabelFormState): boolean => {
    return labelState.name === '' &&
        labelState.color === '' &&
        labelState._id === '';
}

export {
    createInitialTask,
    createInitialNote,
    createInitialLabel,
    fromStateToTask,
    fromStateToNote,
    fromStateToLabel,
    isStateOfTask,
    isStateOfNote,
    isStateOfLabel,
    isTaskStateEmpty,
    isNoteStateEmpty,
    isLabelStateEmpty,
}