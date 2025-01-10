import {useCallback, useEffect, useState} from 'react';
import AppService from "../services";
import {BaseFilter} from "../services/type";

const useTasksData = (
    toFetchAllData: boolean = true
    // if only used addTask, updateTask, deleteTask,... , no need to fetch all data
) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    const fetchTasks = useCallback( async () => {
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
    }, []);

    const getAllTasks = useCallback( async (params?: BaseFilter) => {
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
    }, []);

    const getAllTasksGroupByLabels = useCallback( async (params?: {
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
    }, []);

    const getTaskById = useCallback( async (id: string) => {
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
    }, []);

    const getTasksByLabel = useCallback( async (
        label: Label,
        params?: {
            isCompleted?: boolean
            date?: Date,
    } & BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getTasksByLabel(label, params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching task by label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTasksWithoutLabel = useCallback( async (params?: {
        isCompleted?: boolean,
        date?: Date,
    } & BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getTasksWithoutLabel(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching tasks without label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRepeatTasks = useCallback( async (params?: BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getRepeatTasks(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching repeat tasks";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const addTask = useCallback( async (task: Partial<Task>) => {
        try {
            setLoading(true);
            const msg = await AppService.addTask(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks([...allTasks, msg.getData()]);

            if (task.repeat) {
                await generateTaskInstance(msg.getData());
            }

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
    }, [allTasks]);

    const updateTask = useCallback( async (task: Partial<Task>) => {
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
    }, [allTasks]);

    const deleteTask = useCallback( async (task: Task) => {
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
    }, [allTasks]);

    const getTaskInstances = useCallback( async (task: Task) => {
        try {
            setLoading(true);
            const msg = await AppService.getTaskInstances(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching task instances";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const generateTaskInstance = useCallback( async (task: Task) => {
        try {
            setLoading(true);
            const msg = await AppService.generateTaskInstances(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks([...allTasks, ...msg.getData()]);
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error generating task instance";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [allTasks]);

    const getTaskInstancesOverdue = useCallback( async (task: Task) => {
        try {
            setLoading(true);
            const msg = await AppService.getTaskInstancesOverdue(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error fetching task instances overdue";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteForceTaskInstance = useCallback( async (task: Task) => {
        try {
            setLoading(true);
            const msg = await AppService.deleteForceTaskInstance(task);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllTasks(allTasks.filter((item) => item._id !== task._id));
            return msg.getData();
        } catch (e) {
            console.error("useTasksData.ts: ", e);
            let errorMessage = "Error deleting force task instance";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [allTasks]);

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
        getTasksByLabel,
        getTasksWithoutLabel,
        getAllTasks,
        getRepeatTasks,

        getTaskInstances,
        getTaskInstancesOverdue,
        generateTaskInstance,
        deleteForceTaskInstance,
    };
};

export default useTasksData;
