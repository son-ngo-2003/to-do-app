//services
import { TaskDAO } from "../DAO";
import Mapping from "./mapping";
import { Message } from "../models";

interface TaskServiceType {
    addTask:           (task: Partial<Task>) => Promise<Message<Task>>,
    updateTask:        (task: Partial<Task>) => Promise<Message<Task>>,
    deleteTask:        (task: Partial<Task>) => Promise<Message<Task>>,

    getAllTasks:        () => Promise<Message<Task[]>>,
    getTasksByLabel:   (labelId: Label['_id'], isCompleted?: boolean, limit?: number) => Promise<Message<Task[]>>,
    getTasksByCriteria: (searchWord?: string, labelIds?: Label['_id'][], noteIds?: Note['_id'][], date?: Date, isCompleted?: boolean) => Promise<Message<Task[]>>,
}

const TaskService : TaskServiceType = (() => {
    async function getAllTasks(): Promise<Message<Task[]>> {
        try {
            const msg: Message<TaskEntity[]> = await TaskDAO.getAllTasks();
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

    async function getTasksByLabel(labelId: Label['_id'], isCompleted?: boolean, limit?: number): Promise<Message<Task[]>> {
        try {
            const msg: Message<TaskEntity[]> = await TaskDAO.getTasksByCriteria(undefined, [labelId], undefined, undefined, isCompleted);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const tasks: Task[] = await Promise.all(msg.getData().slice(0,limit).map( async task => {
                return await Mapping.taskFromEntity(task);
            }))

            return Message.success(tasks);

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTasksByCriteria(searchWord?: string, labelIds?: Label['_id'][], noteIds?: Note['_id'][], date?: Date, isCompleted?: boolean): Promise<Message<Task[]>> {
        try {
            const msg: Message<TaskEntity[]> = await TaskDAO.getTasksByCriteria(searchWord, labelIds, noteIds, date, isCompleted);
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
            const msg: Message<TaskEntity> = await TaskDAO.updateTaskById(task._id, task);
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
        getTasksByLabel,
        getTasksByCriteria,
    };
})();

export default TaskService;