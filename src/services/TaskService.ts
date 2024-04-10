//services
import StorageService from "./StorageService";
import { Message } from "./models";

//utils
import { generateId } from "../utils/generator";
import { slugInclude } from "../utils/slugUtil";
import { isDateBetween } from "../utils/dateUtil";

interface TaskServiceType {
    addTask:           (task: Partial<Task>) => Promise<Message<Task>>,

    getAllTasks:       () => Promise<Message<Task[]>>,
    getTaskByID:       (_id: string) => Promise<Message<Task>>,
    getTasksByCriteria:    (searchWord?: string, label?: Label, date?: Date) => Promise<Message<Task[]>>,
    //TODO: get completed tasks, get deleted tasks
    //TODO: add params isCompleted for getTasksByCriteria

    updateTaskById:    (_id: string, newData: Partial<Task>) => Promise<Message<Task>>,
    addLabelToTask:    (label: Label, taskId: string) => Promise<Message<Task>>,
    
    deleteTaskById:    (_id: string) => Promise<Message<Task>>,
}

const TaskService : TaskServiceType = (() => {
    let numberOfTasks: number = 0;  
    const limitTask: number = 500;

    async function addTask(task: Partial<Task>): Promise<Message<Task>> {
        try {
            numberOfTasks++;
            if (numberOfTasks >= limitTask) {
                throw new Error(`Task service has reached the limit of ${limitTask} tasks`);
            }

            task.isDeleted = task.isDeleted ?? false;
            task.isCompleted = task.isCompleted ?? false;
            task.createdAt = new Date();
            task.completedAt = task.isCompleted ? new Date() : undefined;
            task._id = generateId();

            return StorageService.addData<Task>(task as Task, 'task', numberOfTasks);
        } catch (error) {
            numberOfTasks--;
            return Message.failure(error);
        }
    }

    async function getAllTasks(): Promise<Message<Task[]>> {
        try {
            return await StorageService.getAllDataByType<Task>('task');
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTaskByID(id: string) : Promise<Message<Task>> {
        try {
            return await StorageService.getDataByTypeAndId<Task>('task', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getTasksByCriteria(searchWord?: string, label?: Label, date?: Date) : Promise<Message<Task[]>> { 
        try {
            const message : Message<Task[]> = await getAllTasks();
            if (!message.getIsSuccess()) return message;

            const tasks : Task[] = message.getData();
            tasks.filter(task => 
                (!searchWord 
                    || slugInclude(task.title, searchWord) 
                    || slugInclude(task.note.content, searchWord)) &&
                (!label 
                    || task.labels.includes(label)) &&
                (!date 
                    ||  isDateBetween(date, task.start, task.end))    
            );
            return Message.success(tasks);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateTaskById(id: string, newData: Partial<Task>): Promise<Message<Task>> {
        try {
            newData.updatedAt = new Date();
            return await StorageService.updateDataByTypeAndId<Task>('task', id, newData);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function addLabelToTask(label: Label, taskId: string): Promise<Message<Task>> {
        try {
            const message : Message<Task> = await getTaskByID(taskId);
            if (!message.getIsSuccess()) return message;

            const task : Task = message.getData();
            task.labels.push(label);
            return await updateTaskById(taskId, task);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteTaskById(id: string): Promise<Message<Task>> {
        try {
            numberOfTasks--;
            return await StorageService.deleteSoftDataByTypeAndId<Task>('task', id);
        } catch (error) {
            numberOfTasks++;
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

export default TaskService;