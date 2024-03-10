import StorageService from "./StorageService";

interface LabelServiceType {
    addLabel:           (label: Label) => Promise<Message<Label>>,
    getAllLabels:       () => Promise<Message<Label[]>>,
    getLabelByID:       (id: string) => Promise<Message<Label>>,
    getLabelsByName:    (name: string) => Promise<Message<Label[]>>,
    updateLabelById:    (id: string, newData: Partial<Label>) => Promise<Message<Label>>,
    deleteLabelById:    (id: string) => Promise<Message<Label>>,
}

const LabelService : LabelServiceType = (() => {
    let numberOfLabels: number = 0;  
    const limitLabel: number = 500;

    async function addLabel(label: Label): Promise<Message<Label>> {
        try {
            numberOfLabels++;
            if (numberOfLabels >= limitLabel) {
                throw new Error(`Label service has reached the limit of ${limitLabel} labels`);
            }

            label.createdAt = new Date();
            return StorageService.addData<Label>(label, 'label', numberOfLabels);
        } catch (error) {
            numberOfLabels--;
            return Message.failure(error);
        }
    }

    async function getAllLabels(): Promise<Message<Label[]>> {
        try {
            return await StorageService.getAllDataByType<Label>('label');
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelByID(id: string) : Promise<Message<Label>> {
        try {
            return await StorageService.getDataByTypeAndId<Label>('label', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelsByName(name: string) : Promise<Message<Label[]>> { 
        try {
            const message : Message<Label[]> = await getAllLabels();
            if (!message.getIsSuccess()) return message;

            const labels : Label[] = message.getData();
            labels.filter(label => label.name.toLowerCase().includes( name.toLowerCase() ));
            return Message.success(labels);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateLabelById(id: string, newData: Partial<Label>): Promise<Message<Label>> {
        try {
            newData.updatedAt = new Date();
            return await StorageService.updateDataByTypeAndId<Label>('label', id, newData);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteLabelById(id: string): Promise<Message<Label>> {
        try {
            numberOfLabels--;
            return await StorageService.deleteSoftDataByTypeAndId<Label>('label', id);
        } catch (error) {
            numberOfLabels++;
            return Message.failure(error);
        }
    }

    return {
        addLabel,
        getAllLabels,
        getLabelByID,
        getLabelsByName,
        updateLabelById,
        deleteLabelById,
    };
})();

export default LabelService;