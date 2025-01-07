import StorageService from "./StorageService";
import { generateId } from "../../utils/generator";
import { Message } from "../models"
import { Colors } from "../../styles";
import {slugInclude} from "../../utils/slugUtil";
import {BaseFilter, isKeyOf, LabelFilter} from "../type";
import {generalCompare} from "../../utils/sortUtil";
import {Primary} from "../../styles/colors";

interface LabelDAOType {
    addLabel:               (label: Partial<LabelEntity>) => Promise<Message<LabelEntity>>,

    getAllLabels:           (params?: BaseFilter) => Promise<Message<LabelEntity[]>>,
    getLabelById:           (_id: string) => Promise<Message<LabelEntity>>,
    getLabelsByCriteria:    (params?: LabelFilter & BaseFilter) => Promise<Message<LabelEntity[]>>,

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
            label.color = Colors.primary[label.color as Primary] ?? Colors.getRandomColor();

            return StorageService.addData<LabelEntity>(label as LabelEntity, 'label', numberOfLabels);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getAllLabels(params?: BaseFilter): Promise<Message<LabelEntity[]>> {
        try {
            return await StorageService.getAllDataByType<LabelEntity>('label', params);
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

    async function getLabelsByCriteria(params: LabelFilter & BaseFilter = {}) : Promise<Message<LabelEntity[]>> {
        try {
            const message : Message<LabelEntity[]> = await getAllLabels();
            if (!message.getIsSuccess()) return message;

            const labels : LabelEntity[] = message.getData();

            const { searchTerm, color, limit, offset = 0, sortBy, sortOrder } = params;
            if ( sortBy && labels[0] && isKeyOf<LabelEntity>(sortBy, labels[0]) ) {
                throw new Error(`Invalid sortBy key: ${sortBy}`);
            }
            const _sortBy = sortBy as keyof LabelEntity;

            const result : LabelEntity[] = labels.filter(label =>
                (!searchTerm
                    || slugInclude(label.name, searchTerm)) &&
                (!color
                    || label.color === color)
            )
                .sort((a, b) => {
                    if (!sortBy) return 0;
                    return generalCompare(a[_sortBy], b[_sortBy], sortOrder);
                })
                .slice(offset, limit ? offset + limit : undefined);

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