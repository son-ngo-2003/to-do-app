import LabelService from "./LabelService";
import NoteService from "./NoteService";
import TaskService from "./TaskService";
import { Message } from "../models";
import {UNLABELED_KEY} from "../../constant";
import {BaseFilter} from "../type";

interface AppServiceType {
    // LabelService methods
    getAllLabels:   (params?: BaseFilter) => Promise<Message<Label[]>>,
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
    addTask:                    (task: Partial<Task>) => Promise<Message<Task>>,
    updateTask:                 (task: Partial<Task>) => Promise<Message<Task>>,
    deleteTask:                 (task: Task) => Promise<Message<Task>>,
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

        return {
            // LabelService methods
            getAllLabels,
            getLabelById,
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
            getTaskById,
            addTask,
            updateTask,
            deleteTask,
        };
})();

export default AppService;