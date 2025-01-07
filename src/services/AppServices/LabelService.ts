//services
import { LabelDAO } from "../DAO";
import Mapping from "./mapping";
import { Message } from "../models";
import {BaseFilter, LabelFilter} from "../type";

interface LabelServiceType {
    getAllLabels:       (params?: BaseFilter) => Promise<Message<Label[]>>,
    getLabelById:       (id: string) => Promise<Message<Label>>,
    getLabelsByCriteria:    (params?: LabelFilter & BaseFilter) => Promise<Message<Label[]>>,

    addLabel:           (label: Partial<Label>) => Promise<Message<Label>>,
    updateLabel:        (label: Partial<Label>) => Promise<Message<Label>>,
    deleteLabel:        (label: Partial<Label>) => Promise<Message<Label>>,
}

const LabelService : LabelServiceType = (() => {
    async function getAllLabels(params?: BaseFilter): Promise<Message<Label[]>> {
        try {
            const msg: Message<LabelEntity[]> = await LabelDAO.getAllLabels(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const labels: Label[] = await Promise.all(msg.getData().map(Mapping.labelFromEntity));

            return Message.success(labels);

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelById(id: string): Promise<Message<Label>> {
        try {
            const msg: Message<LabelEntity> = await LabelDAO.getLabelById(id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.labelFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getLabelsByCriteria(params?: LabelFilter & BaseFilter): Promise<Message<Label[]>> {
        try {
            const msg: Message<LabelEntity[]> = await LabelDAO.getLabelsByCriteria(params);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const labels: Label[] = await Promise.all(msg.getData().map(Mapping.labelFromEntity));

            return Message.success(labels);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function addLabel(label: Partial<Label>): Promise<Message<Label>> {
        try {
            const msg: Message<LabelEntity> = await LabelDAO.addLabel(label);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.labelFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateLabel(label: Partial<Label>): Promise<Message<Label>> {
        try {
            if (!label._id) {
                throw new Error('Label id is required');
            }
            const msg: Message<LabelEntity> = await LabelDAO.updateLabelById(label._id, label);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.labelFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteLabel(label: Partial<Label>): Promise<Message<Label>> {
        try {
            if (!label._id) {
                throw new Error('Label id is required');
            }
            const msg: Message<LabelEntity> = await LabelDAO.deleteLabelById(label._id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.labelFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    return {
        addLabel,
        getLabelById,
        getAllLabels,
        getLabelsByCriteria,
        updateLabel,
        deleteLabel,
    };
})();

export default LabelService;