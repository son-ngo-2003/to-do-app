import StorageService from "./storageService";

interface LabelServiceType {
    addLabel: (label: Label) => Promise<void>,
    getAllLabels: () => Promise<Label[]>,
}

const LabelService : LabelServiceType = (() => {
    let numberOfLabels: number = 0;  
    async function addLabel(label: Label): Promise<void> {
        try {
            numberOfLabels++;
            await StorageService.addData<Label>(label, 'label', numberOfLabels);
        }
        catch (error) {
            console.log(error);
            numberOfLabels--;
        }
    }

    async function getAllLabels(): Promise<Label[]> {
        try {
            const labels = await StorageService.getAllDataByType<Label>('label', numberOfLabels);
            return labels;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }

    return {
        addLabel,
        getAllLabels
    };
})();

export default LabelService;