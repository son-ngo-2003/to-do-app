import { useEffect, useState } from 'react';
import { TaskService } from "../../services";

const useTasksData = (
    toFetchAllData: boolean = true
    // if only use addTask, updateTask, deleteTask,... , no need to fetch all data
) => {
    const [data, setData] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>();

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const msg = await TaskService.getAllTasks();
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(msg.getData());
        } catch (e) {
            let errorMessage = "Error fetching tasks";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (task: Partial<Task>) => {
        try {
            setLoading(true);
            const msg = await TaskService.addTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData([...data, msg.getData()]);
            return msg.getData();
        } catch (e) {
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
            const msg = await TaskService.updateTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(data.map((item) => (item._id === msg.getData()._id ? msg.getData() : item)));
            return msg.getData();
        } catch (e) {
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
            const msg = await TaskService.deleteTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(data.filter((item) => item._id !== task._id));
            return msg.getData();
        } catch (e) {
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

    return { data, loading, error, addTask, updateTask, deleteTask };
};

export default useTasksData;
