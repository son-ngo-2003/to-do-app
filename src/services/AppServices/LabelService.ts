//services
import { LabelDAO } from "../DAO";
import Mapping from "./mapping";
import { Message } from "../models";

interface LabelServiceType {
    addLabel:          (label: Partial<Label>) => Promise<Message<Label>>,
    getAllLabels:       () => Promise<Message<Label[]>>,
    updateLabel:       (label: Partial<Label>) => Promise<Message<Label>>,
    deleteLabel:       (label: Partial<Label>) => Promise<Message<Label>>,
}

const LabelService : LabelServiceType = (() => {
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

    async function getAllLabels(): Promise<Message<Label[]>> {
        try {
            const msg: Message<LabelEntity[]> = await LabelDAO.getAllLabels();
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const labels: Label[] = msg.getData()

            return Message.success(labels);

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
        getAllLabels,
        updateLabel,
        deleteLabel,
    };
})();

export default LabelService;