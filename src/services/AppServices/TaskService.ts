//services
import { TaskDAO } from "../DAO";
import Mapping from "./mapping";
import { Message } from "../models";
import {BaseFilter} from "../type";

interface TaskServiceType {
    addTask:           (task: Partial<Task>) => Promise<Message<Task>>,
    updateTask:        (task: Partial<Task>) => Promise<Message<Task>>,
    deleteTask:        (task: Partial<Task>) => Promise<Message<Task>>,

    getAllTasks:        (params?: BaseFilter) => Promise<Message<Task[]>>,
    getTaskById:        (_id: Task['_id']) => Promise<Message<Task>>,
    getTasksByCriteria: (params?: {searchTerm?: string, labelIds?: Label['_id'][], noteIds?: Note['_id'][], date?: Date, isCompleted?: boolean } & BaseFilter) => Promise<Message<Task[]>>,
}

const TaskService : TaskServiceType = (() => {
    async function getAllTasks(params?: BaseFilter): Promise<Message<Task[]>> {
        try {
            const msg: Message<TaskEntity[]> = await TaskDAO.getAllTasks(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const tasks: Task[] = await Promise.all(msg.getData().map( async task => {
                return await Mapping.taskFromEntity(task);
            }))

            return Message.success(tasks);

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTaskById(_id: Task['_id']): Promise<Message<Task>> {
        try {
            const msg: Message<TaskEntity> = await TaskDAO.getTaskByID(_id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.taskFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTasksByCriteria(params?: {
        searchTerm?: string,
        labelIds?: Label['_id'][],
        noteIds?: Note['_id'][],
        date?: Date,
        isCompleted?: boolean,
    } & BaseFilter): Promise<Message<Task[]>> {
        try {
            const msg: Message<TaskEntity[]> = await TaskDAO.getTasksByCriteria(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const tasks: Task[] = await Promise.all(msg.getData().map( async task => {
                return await Mapping.taskFromEntity(task);
            }))

            return Message.success(tasks);

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function addTask(task: Partial<Task>): Promise<Message<Task>> {
        try {
            const labelIds = task.labels ? task.labels.map(label => label._id) : [];
            const noteId = task.note ? task.note._id : undefined;
            const { note, labels, ...taskWithoutNoteLabels} = task;
            const msg: Message<TaskEntity> = await TaskDAO.addTask( { ...taskWithoutNoteLabels, labelIds, noteId } );
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.taskFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateTask(task: Partial<Task>): Promise<Message<Task>> {
        try {
            if (!task._id) {
                throw new Error('Task id is required');
            }
            const labelIds = task.labels ? task.labels.map(label => label._id) : [];
            const noteId = task.note ? task.note._id : undefined;
            const { note, labels, ...taskWithoutNoteLabels} = task;
            const msg: Message<TaskEntity> = await TaskDAO.updateTaskById(task._id, { ...taskWithoutNoteLabels, labelIds, noteId });
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.taskFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteTask(task: Partial<Task>): Promise<Message<Task>> {
        try {
            if (!task._id) {
                throw new Error('Task id is required');
            }
            const msg: Message<TaskEntity> = await TaskDAO.deleteTaskById(task._id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.taskFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    return {
        addTask,
        updateTask,
        deleteTask,

        getAllTasks,
        getTaskById,
        getTasksByCriteria,
    };
})();

export default TaskService;