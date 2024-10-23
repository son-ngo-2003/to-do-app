import StorageService from "./StorageService";
import { generateId } from "../../utils/generator";
import { Message } from "../models"
import { Colors } from "../../styles";

interface LabelDAOType {
    addLabel:           (label: Partial<LabelEntity>) => Promise<Message<LabelEntity>>,
    getAllLabels:       () => Promise<Message<LabelEntity[]>>,
    getLabelByID:       (_id: string) => Promise<Message<LabelEntity>>,
    getLabelsByName:    (name: string) => Promise<Message<LabelEntity[]>>,
    //TODO: get deleted labels
    updateLabelById:    (_id: string, newData: Partial<LabelEntity>) => Promise<Message<LabelEntity>>,
    deleteLabelById:    (_id: string) => Promise<Message<LabelEntity>>,
}

const LabelDAO : LabelDAOType = (() => {
    const limitLabel: number = 500; //TODO: add this to constant

    async function addLabel(label: Partial<LabelEntity>): Promise<Message<LabelEntity>> {
        try {
            //check required fields
            if (!label.name) {
                throw new Error('Label name is required');
            }

            //Check if number of labels reached the limit
            const msg = await getAllLabels();
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            let numberOfLabels: number = msg.getData().length;
            if (numberOfLabels >= limitLabel) {
                throw new Error(`Label storage has reached the limit of ${limitLabel} labels`);
            }

            label.isDeleted = label.isDeleted ?? false;
            label.createdAt = new Date();
            label._id = generateId();
            label.color = label.color ?? Colors.getRandomColor();

            return StorageService.addData<LabelEntity>(label as LabelEntity, 'label', numberOfLabels);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getAllLabels(): Promise<Message<LabelEntity[]>> {
        try {
            return await StorageService.getAllDataByType<LabelEntity>('label');
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelByID(id: string) : Promise<Message<LabelEntity>> {
        try {
            return await StorageService.getDataByTypeAndId<LabelEntity>('label', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelsByName(name: string) : Promise<Message<LabelEntity[]>> {
        try {
            const message : Message<LabelEntity[]> = await getAllLabels();
            if (!message.getIsSuccess()) return message;

            const labels : LabelEntity[] = message.getData();
            labels.filter(label => label.name.toLowerCase().includes( name.toLowerCase() ));
            return Message.success(labels);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateLabelById(id: string, newData: Partial<LabelEntity>): Promise<Message<LabelEntity>> {
        try {
            newData.updatedAt = new Date();
            return await StorageService.updateDataByTypeAndId<LabelEntity>('label', id, newData);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteLabelById(id: string): Promise<Message<LabelEntity>> {
        try {
            return await StorageService.deleteSoftDataByTypeAndId<LabelEntity>('label', id);
        } catch (error) {
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

export default LabelDAO;