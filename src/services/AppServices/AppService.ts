import LabelService from "./LabelService";
import NoteService from "./NoteService";
import TaskService from "./TaskService";
import { Message } from "../models";
import {RANGE_TASK_INSTANCES_GENERATE, UNLABELED_KEY} from "../../constant";
import {BaseFilter} from "../type";
import {addDate, getNearestDateOfRepeatTask, getRangeOfDate} from "../../utils/dateUtil";

interface AppServiceType {
    // LabelService methods
    getAllLabels:   (params?: BaseFilter) => Promise<Message<Label[]>>,
    getStatusOfLabel: (label: Label | typeof UNLABELED_KEY) => Promise<Message<{taskTotal: number, taskCompleted: number, noteTotal: number}>>,
    getLabelById:   (id: string) => Promise<Message<Label>>,
    addLabel:       (label: Partial<Label>) => Promise<Message<Label>>,
    updateLabel:    (label: Partial<Label>) => Promise<Message<Label>>,
    deleteLabel:    (label: Label) => Promise<Message<Label>>,

    // NoteService methods
    getAllNotes:    (params?: BaseFilter) => Promise<Message<Note[]>>,
    getNoteById:    (id: string) => Promise<Message<Note>>,
    addNote:        (note: Partial<Note>) => Promise<Message<Note>>,
    updateNote:     (note: Partial<Note>) => Promise<Message<Note>>,
    deleteNote:     (note: Note) => Promise<Message<Note>>,

    // TaskService methods
    getAllTasks:                (params?: BaseFilter) => Promise<Message<Task[]>>,
    getAllTasksGroupByLabels:   (params?: { date?: Date, isCompleted?: boolean, withTasksNoLabel?: boolean } & BaseFilter)  => Promise<Message< Record<Label['_id'], Task[] >>>,
    getTaskById:                (id: string) => Promise<Message<Task>>,
    getTasksByLabel:            (label: Label, params?: {isCompleted?: boolean, date?: Date} & BaseFilter) => Promise<Message<Task[]>>,
    getTasksWithoutLabel:       (params?: {isCompleted?: boolean, date?: Date} & BaseFilter) => Promise<Message<Task[]>>,
    getRepeatTasks:             (params?: BaseFilter) => Promise<Message<Task[]>>,
    addTask:                    (task: Partial<Task>) => Promise<Message<Task>>,
    updateTask:                 (task: Partial<Task>) => Promise<Message<Task>>,
    deleteTask:                 (task: Task) => Promise<Message<Task>>,

    getTaskInstancesOverdue:    (parentTask: Task) => Promise<Message<Task[]>>,
    getTaskInstances:           (parentTask: Task) => Promise<Message<Task[]>>,
    generateTaskInstances:      (task: Task) => Promise<Message<Task[]>>,
    deleteForceTaskInstance:    (task: Task) => Promise<Message<Task>>,
}

const AppService : AppServiceType = (() => {

    // ======================== LabelService methods ========================
    async function getAllLabels(params?: BaseFilter): Promise<Message<Label[]>> {
        try {
            const msg: Message<Label[]> = await LabelService.getAllLabels(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getStatusOfLabel(label: Label | typeof UNLABELED_KEY): Promise<Message<{taskTotal: number, taskCompleted: number, noteTotal: number}>> {
        try {
            const labelId = label === UNLABELED_KEY ? UNLABELED_KEY : label._id;
            const tasksMsg: Message<Task[]> = await TaskService.getTasksByCriteria({labelIds: [labelId]});
            if (!tasksMsg.getIsSuccess()) {
                throw new Error(tasksMsg.getError());
            }

            const notesMsg: Message<Note[]> = await NoteService.getNotesByCriteria({labelIds: [labelId]});
            if (!notesMsg.getIsSuccess()) {
                throw new Error(notesMsg.getError());
            }

            const taskTotal = tasksMsg.getData().length;
            const taskCompleted = tasksMsg.getData().filter(task => task.isCompleted).length;
            const noteTotal = tasksMsg.getData().length;
            return Message.success({taskTotal, taskCompleted, noteTotal});
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getLabelById(id: string): Promise<Message<Label>> {
        try {
            const msg: Message<Label> = await LabelService.getLabelById(id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function addLabel(label: Partial<Label>): Promise<Message<Label>> {
        try {
            const msg: Message<Label> = await LabelService.addLabel(label);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function updateLabel(label: Partial<Label>): Promise<Message<Label>> {
        try {
            const msg: Message<Label> = await LabelService.updateLabel(label);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function deleteLabel(label: Label): Promise<Message<Label>> {
        try {
            const msg: Message<Label> = await LabelService.deleteLabel(label);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }


    // ======================== NoteService methods ========================
    async function getAllNotes(params?: BaseFilter): Promise<Message<Note[]>> {
        try {
            const msg: Message<Note[]> = await NoteService.getAllNotes(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getNoteById(id: string): Promise<Message<Note>> {
        try {
            const msg: Message<Note> = await NoteService.getNoteById(id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function addNote(note: Partial<Note>): Promise<Message<Note>> {
        try {
            const msg: Message<Note> = await NoteService.addNote(note);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function updateNote(note: Partial<Note>): Promise<Message<Note>> {
        try {
            const msg: Message<Note> = await NoteService.updateNote(note);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function deleteNote(note: Note): Promise<Message<Note>> {
        try {
            const msg: Message<Note> = await NoteService.deleteNote(note);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }


    // ======================== TaskService methods ========================

    async function getAllTasks(params?: BaseFilter): Promise<Message<Task[]>> {
        try {
            const msg: Message<Task[]> = await TaskService.getAllTasks(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getAllTasksGroupByLabels( params?: {
        date?: Date,
        isCompleted?: boolean,
        withTasksNoLabel?: boolean,
    } & BaseFilter): Promise<Message<Record<Label["_id"], Task[]>>> {
        try {
            const allLabelsMsg: Message<Label[]> = await LabelService.getAllLabels();
            if (!allLabelsMsg.getIsSuccess()) {
                throw new Error(allLabelsMsg.getError());
            }
            const allLabelIds: Label["_id"][] = allLabelsMsg.getData().map(label => label._id);
            if (params?.withTasksNoLabel) {
                allLabelIds.push(UNLABELED_KEY);
            }

            const tasksByLabel: Record<Label['_id'], Task[]> = {};
            const tasksMsgs: Message<Task[]>[] = await Promise.all(
                allLabelIds.map(labelId => TaskService.getTasksByCriteria({...params, labelIds: [labelId]}))
            );

            tasksMsgs.forEach((msg, index) => {
                if (msg.getIsSuccess()) {
                    tasksByLabel[allLabelIds[index]] = msg.getData();
                } else {
                    throw new Error(msg.getError());
                }
            });

            return Message.success(tasksByLabel);
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getTaskById(id: string): Promise<Message<Task>> {
        try {
            const msg: Message<Task> = await TaskService.getTaskById(id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getTasksByLabel(label: Label, params?: {isCompleted?: boolean, date?: Date} & BaseFilter): Promise<Message<Task[]>> {
        try {
            const msg: Message<Task[]> = await TaskService.getTasksByCriteria({labelIds: [label._id], ...params});
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getTasksWithoutLabel(params?: {isCompleted?: boolean, date?: Date} & BaseFilter): Promise<Message<Task[]>> {
        try {
            const msg: Message<Task[]> = await TaskService.getTasksByCriteria({labelIds: [UNLABELED_KEY], ...params});
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getRepeatTasks(params?: BaseFilter): Promise<Message<Task[]>> {
        try {
            const msg: Message<Task[]> = await TaskService.getRepeatTasks(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function addTask(task: Partial<Task>): Promise<Message<Task>> {
        try {
            const msg: Message<Task> = await TaskService.addTask(task);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function updateTask(task: Partial<Task>): Promise<Message<Task>> {
        try {
            const msg: Message<Task> = await TaskService.updateTask(task);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function deleteTask(task: Task): Promise<Message<Task>> {
        try {
            const msg: Message<Task> = await TaskService.deleteTask(task);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getTaskInstances(parentTask: Task): Promise<Message<Task[]>> {
        try {
            const msg: Message<Task[]> = await TaskService.getTasksByCriteria({parentTaskId: parentTask._id, sortBy: 'start', sortOrder: 'asc'});
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function getTaskInstancesOverdue(parentTask: Task): Promise<Message<Task[]>> {
        try {
            const msg: Message<Task[]> = await TaskService.getTasksByCriteria({parentTaskId: parentTask._id, isOverdue: true});
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function generateTaskInstances(task: Task): Promise<Message<Task[]>> {
        try {
            if (!task.repeat) {
                throw new Error("Task does not have repeat configuration!");
            }
            if (!task.start) {
                throw new Error("Task does not have start date!");
            }

            const nearestInstanceDate: Date = getNearestDateOfRepeatTask(task.start, task.repeat);
            const farestInstanceRepeatDate: Date = addDate(nearestInstanceDate, RANGE_TASK_INSTANCES_GENERATE.value, RANGE_TASK_INSTANCES_GENERATE.unit);
            const startTaskInstance = getRangeOfDate(nearestInstanceDate, farestInstanceRepeatDate, task.repeat);

            const taskInstances: Task[] = startTaskInstance.map(date => ({
                ...task,
                parentTask: task,
                start: date,
                end: addDate(date, task.repeat?.value , task.repeat?.unit),
            }));

            const msgs: Message<Task>[] = await Promise.all( taskInstances.map(taskInstance => TaskService.addTask(taskInstance)) );
            const results: Task[] = msgs.map(msg => {
                if (!msg.getIsSuccess()) {
                    throw new Error(msg.getError());
                }
                return msg.getData();
            });
            return Message.success(results);
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    async function deleteForceTaskInstance(task: Task): Promise<Message<Task>> {
        try {
            const msg: Message<Task> = await TaskService.deleteForceTaskInstance(task);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            console.error("AppService.ts: ", error);
            return Message.failure(error);
        }
    }

    return {
        // LabelService methods
        getAllLabels,
        getLabelById,
        getStatusOfLabel,
        addLabel,
        updateLabel,
        deleteLabel,

        // NoteService methods
        getAllNotes,
        getNoteById,
        addNote,
        updateNote,
        deleteNote,

        // TaskService methods
        getAllTasks,
        getAllTasksGroupByLabels,
        getRepeatTasks,
        getTaskById,
        getTasksByLabel,
        getTasksWithoutLabel,
        addTask,
        updateTask,
        deleteTask,

        getTaskInstances,
        getTaskInstancesOverdue,
        generateTaskInstances,
        deleteForceTaskInstance,
    };
})();

export default AppService;