import { useEffect, useState } from 'react';
import AppService from "../services";
import {BaseFilter} from "../services/type";

const useLabelsData = (
    toFetchAllData: boolean = true
    // if only use addLabel, updateLabel, deleteLabel, no need to fetch all data
) => {
    const [allLabels, setAllLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    const fetchLabels = async () => {
        try {
            setLoading(true);
            const msg = await AppService.getAllLabels();
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllLabels(msg.getData());
        } catch (e) {
            console.error("useLabelsData.ts", e);
            let errorMessage = "Error fetching labels";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getAllLabels = async (params?: BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getAllLabels(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useLabelsData.ts", e);
            let errorMessage = "Error fetching labels";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const getLabelById = async (id: string) => {
        try {
            setLoading(true);
            const msg = await AppService.getLabelById(id);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useLabelsData.ts", e);
            let errorMessage = "Error getting label by id";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const addLabel = async (label: Partial<Label>) => {
        try {
            setLoading(true);
            const msg = await AppService.addLabel(label);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllLabels([...allLabels, msg.getData()]);
            return msg.getData();
        } catch (e) {
            console.error("useLabelsData.ts", e);
            let errorMessage = "Error adding label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const updateLabel = async (label: Partial<Label>) => {
        try {
            setLoading(true);
            const msg = await AppService.updateLabel(label);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllLabels(allLabels.map((item) => (item._id === msg.getData()._id ? msg.getData() : item)));
            return msg.getData();
        } catch (e) {
            console.error("useLabelsData.ts", e);
            let errorMessage = "Error updating label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const deleteLabel = async (label: Label) => {
        try {
            setLoading(true);
            const msg = await AppService.deleteLabel(label);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllLabels(allLabels.filter((item) => item._id !== label._id));
            return msg.getData();
        } catch (e) {
            console.error("useLabelsData.ts", e);
            let errorMessage = "Error deleting label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (toFetchAllData) fetchLabels();
    }, []);

    return {
        allLabels,
        loading,
        error,
        addLabel,
        updateLabel,
        deleteLabel,
        getLabelById,
        fetchLabels,
        getAllLabels,
    };
};

export default useLabelsData;
