import { useEffect, useState } from 'react';
import AppService from "../services";
import {BaseFilter} from "../services/type";

const useTasksData = (
    toFetchAllData: boolean = true
    // if only use addTask, updateTask, deleteTask,... , no need to fetch all data
) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const msg = await AppService.getAllTasks();
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks(msg.getData());
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching tasks";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getAllTasks = async (params?: BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getAllTasks(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching tasks";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    const getAllTasksGroupByLabels = async (params: {
        //TODO: add limit number of tasks for each label, and fix bug: "when added or updated task, the new interface will become like before pressing the show more button"
        withTasksNoLabel?: boolean,
        date?: Date,
        isCompleted?: boolean,
    } & BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getAllTasksGroupByLabels(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching tasks group by labels";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const getTaskById = async (id: string) => {
        try {
            setLoading(true);
            const msg = await AppService.getTaskById(id);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching task by id";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (task: Partial<Task>) => {
        try {
            setLoading(true);
            const msg = await AppService.addTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks([...allTasks, msg.getData()]);
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error adding task";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (task: Partial<Task>) => {
        try {
            setLoading(true);
            const msg = await AppService.updateTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks(allTasks.map((item) => (item._id === msg.getData()._id ? msg.getData() : item)));
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error updating task";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (task: Task) => {
        try {
            setLoading(true);
            const msg = await AppService.deleteTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks(allTasks.filter((item) => item._id !== task._id));
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error deleting task";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (toFetchAllData) fetchTasks();
    }, []);

    return {
        allTasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        getAllTasksGroupByLabels,
        getAllTasks,
    };
};

export default useTasksData;
