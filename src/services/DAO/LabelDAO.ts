import StorageService from "./StorageService";
import { generateId } from "../../utils/generator";
import { Message } from "../models"
import { Colors } from "../../styles";
import {slugInclude} from "../../utils/slugUtil";

interface LabelDAOType {
    addLabel:               (label: Partial<LabelEntity>) => Promise<Message<LabelEntity>>,

    getAllLabels:           (params?: { limit?: number, offset?: number }) => Promise<Message<LabelEntity[]>>,
    getLabelById:           (_id: string) => Promise<Message<LabelEntity>>,
    getLabelsByCriteria:    (params?: { searchTerm?: string, color?: string, limit?: number, offset?: number }) => Promise<Message<LabelEntity[]>>,

    updateLabelById:        (_id: string, newData: Partial<LabelEntity>) => Promise<Message<LabelEntity>>,
    deleteLabelById:        (_id: string) => Promise<Message<LabelEntity>>,
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

    async function getAllLabels(params?: { limit?: number, offset?: number }): Promise<Message<LabelEntity[]>> {
        try {
            return await StorageService.getAllDataByType<LabelEntity>('label', params?.limit, params?.offset);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelById(id: string) : Promise<Message<LabelEntity>> {
        try {
            return await StorageService.getDataByTypeAndId<LabelEntity>('label', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelsByCriteria(params: {
        searchTerm?: string,
        color?: string,
        limit?: number,
        offset?: number
    } = {}) : Promise<Message<LabelEntity[]>> {
        try {
            const message : Message<LabelEntity[]> = await getAllLabels();
            if (!message.getIsSuccess()) return message;

            const labels : LabelEntity[] = message.getData();

            const { searchTerm, color, limit, offset = 0 } = params;
            const result : LabelEntity[] = labels.filter(label =>
                (!searchTerm
                    || slugInclude(label.name, searchTerm)) &&
                (!color
                    || label.color === color)
            ).slice(offset, limit ? offset + limit : undefined);

            return Message.success(result);
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
        getLabelById,
        getLabelsByCriteria,
        updateLabelById,
        deleteLabelById,
    };
})();

export default LabelDAO;