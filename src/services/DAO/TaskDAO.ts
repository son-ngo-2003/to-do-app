//services
import StorageService from "./StorageService";
import { Message } from "../models";

//utils
import { generateId } from "../../utils/generator";
import { slugInclude } from "../../utils/slugUtil";
import { isDateBetween } from "../../utils/dateUtil";

interface TaskDAOType {
    addTask:           (task: Partial<TaskEntity>) => Promise<Message<TaskEntity>>,

    getAllTasks:       () => Promise<Message<TaskEntity[]>>,
    getTaskByID:       (_id: string) => Promise<Message<TaskEntity>>,
    getTasksByCriteria:    (searchWord?: string, labelId?: Label['_id'][], noteIds?: Note['_id'][], date?: Date, isCompleted?: boolean) => Promise<Message<TaskEntity[]>>,
    //TODO: get completed tasks, get deleted tasks
    //TODO: add params isCompleted for getTasksByCriteria

    updateTaskById:    (_id: string, newData: Partial<TaskEntity>) => Promise<Message<TaskEntity>>,
    addLabelToTask:    (labelId: Label['_id'], taskId: Task['_id']) => Promise<Message<TaskEntity>>, //TODO:move this to serviceß
    //TODO: check if label deja exist for addLabelToNote
    //TODO: removeLabelFromNote: (labelId: Label['_id'], noteId: string) => Promise<Message<Note>>,ß
    
    deleteTaskById:    (_id: string) => Promise<Message<TaskEntity>>,
}

const TaskDAO : TaskDAOType = (() => {
    const limitTask: number = 500; //TODO: add this to constant

    async function addTask(task: Partial<TaskEntity>): Promise<Message<TaskEntity>> {
        try {
            //check required fields
            if (!task.title && !task.start) {
                throw new Error('Task title and start time is required');
            }

            //Check if number of tasks reached the limit
            const msg = await getAllTasks();
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            let numberOfTasks: number = msg.getData().length;
            if (numberOfTasks >= limitTask) {
                throw new Error(`Task service has reached the limit of ${limitTask} tasks`);
            }

            task.isDeleted = task.isDeleted ?? false;
            task.isCompleted = task.isCompleted ?? false;
            task.createdAt = new Date();
            task.completedAt = task.isCompleted ? new Date() : undefined;
            task._id = generateId();
            task.repeat = task.repeat ?? undefined;
            task.labelIds = task.labelIds ?? [];
            task.noteId = task.noteId ?? undefined;


            return StorageService.addData<TaskEntity>(task as TaskEntity, 'task', numberOfTasks);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getAllTasks(): Promise<Message<TaskEntity[]>> {
        try {
            return await StorageService.getAllDataByType<TaskEntity>('task');
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTaskByID(id: string) : Promise<Message<TaskEntity>> {
        try {
            return await StorageService.getDataByTypeAndId<TaskEntity>('task', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTasksByCriteria(searchWord?: string, labelIds?: Label['_id'][], noteIds?: Note['_id'][], date?: Date, isCompleted?: boolean) : Promise<Message<TaskEntity[]>> {
        try {
            const message : Message<TaskEntity[]> = await getAllTasks();
            if (!message.getIsSuccess()) return message;

            const tasks : TaskEntity[] = message.getData();

            const results = tasks.filter(task =>
                (!searchWord 
                    || slugInclude(task.title, searchWord)) &&
                (!noteIds
                    || (task.noteId && noteIds.includes(task.noteId))) &&
                (!labelIds
                    || task.labelIds.some( labelId => labelIds.includes(labelId) )) &&
                (!isCompleted
                    || task.isCompleted === isCompleted) &&
                (!date 
                    ||  isDateBetween(date, task.start, task.end))
                //TODO: improve search later with possibility of searching string date: like '24/12' will return all tasks that start at 24/12 in every year, and also searching filter also apply in case repeat
            );

            return Message.success(results);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateTaskById(id: string, newData: Partial<TaskEntity>): Promise<Message<TaskEntity>> {
        try {
            newData.updatedAt = new Date();
            return await StorageService.updateDataByTypeAndId<TaskEntity>('task', id, newData);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function addLabelToTask(labelID: Label['_id'], taskId: Task['_id']): Promise<Message<TaskEntity>> {
        try {
            const message : Message<TaskEntity> = await getTaskByID(taskId);
            if (!message.getIsSuccess()) return message;

            const task : TaskEntity = message.getData();
            task.labelIds.push(labelID);
            return await updateTaskById(taskId, task);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteTaskById(id: string): Promise<Message<TaskEntity>> {
        try {
            return await StorageService.deleteSoftDataByTypeAndId<TaskEntity>('task', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    return {
        addTask,

        getAllTasks,
        getTaskByID,
        getTasksByCriteria,

        updateTaskById,
        addLabelToTask,

        deleteTaskById,
    };
})();

export default TaskDAO;