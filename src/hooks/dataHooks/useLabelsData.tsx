import { useEffect, useState } from 'react';
import { LabelService } from "../../services";

const useLabelsData = (
    toFetchAllData: boolean = true
    // if only use addLabel, updateLabel, deleteLabel, no need to fetch all data
) => {
    const [data, setData] = useState<Label[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>();

    const fetchLabels = async () => {
        try {
            setLoading(true);
            const msg = await LabelService.getAllLabels();
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(msg.getData());
        } catch (e) {
            let errorMessage = "Error fetching labels";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e; // Re-throw the error to propagate it if needed
        } finally {
            setLoading(false);
        }
    };

    const addLabel = async (label: Partial<Label>) => {
        try {
            setLoading(true);
            const msg = await LabelService.addLabel(label);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData([...data, msg.getData()]);
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error adding label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e; // Re-throw the error to propagate it if needed
        } finally {
            setLoading(false);
        }
    };

    const updateLabel = async (label: Partial<Label>) => {
        try {
            setLoading(true);
            const msg = await LabelService.updateLabel(label);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(data.map((item) => (item._id === msg.getData()._id ? msg.getData() : item)));
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error updating label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e; // Re-throw the error to propagate it if needed
        } finally {
            setLoading(false);
        }
    };

    const deleteLabel = async (label: Label) => {
        try {
            setLoading(true);
            const msg = await LabelService.deleteLabel(label);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(data.filter((item) => item._id !== label._id));
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error deleting label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e; // Re-throw the error to propagate it if needed
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (toFetchAllData) fetchLabels();
    }, []);

    return { data, loading, error, addLabel, updateLabel, deleteLabel };
};

export default useLabelsData;
