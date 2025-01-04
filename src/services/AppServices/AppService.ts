import LabelService from "./LabelService";
import NoteService from "./NoteService";
import TaskService from "./TaskService";
import { Message } from "../models";
import {UNLABELED_KEY} from "../../constant";

interface AppServiceType {
    getAllLabels: () => Promise<Message<Label[]>>,
    getAllNotes: (limit?: number) => Promise<Message<Note[]>>,
    getAllTasksGroupByLabels: (date?: Date, isCompleted?: boolean, limit?: number, withTasksNoLabel?: boolean) => Promise<Message< Record<Label['_id'], Task[] > >>
}

const AppService : AppServiceType = (() => {

    async function getAllLabels(): Promise<Message<Label[]>> {
        try {
            const msg: Message<Label[]> = await LabelService.getAllLabels();
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getAllNotes(limit?: number): Promise<Message<Note[]>> {
        try {
            const msg: Message<Note[]> = await NoteService.getAllNotes(limit);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(msg.getData());
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getAllTasksGroupByLabels( date?: Date, isCompleted?: boolean, limit?: number, withTasksNoLabel?: boolean ): Promise<Message< Record<Label['_id'] | string, Task[] > >> {
        try {
            const allLabelsMsg: Message<Label[]> = await LabelService.getAllLabels();
            if (!allLabelsMsg.getIsSuccess()) {
                throw new Error(allLabelsMsg.getError());
            }
            const allLabelIds: Label["_id"][] = allLabelsMsg.getData().map(label => label._id);
            if (withTasksNoLabel) {
                allLabelIds.push(UNLABELED_KEY);
            }

            const tasksByLabel: Record<Label['_id'], Task[]> = {};
            const tasksMsgs: Message<Task[]>[] = await Promise.all(
                allLabelIds.map(labelId => TaskService.getTasksByCriteria(undefined, [labelId], undefined, date, isCompleted, limit))
            );

            tasksMsgs.forEach((msg, index) => {
                if (msg.getIsSuccess()) {
                    tasksByLabel[allLabelIds[index]] = msg.getData();
                } else {
                    throw new Error(msg.getError());
                }
            });

            return Message.success(tasksByLabel);
        } catch (error) {
            return Message.failure(error);
        }
    }

    return {
        getAllLabels,
        getAllNotes,
        getAllTasksGroupByLabels,
    };
})();

export default AppService;