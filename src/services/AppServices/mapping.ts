//services
import { NoteDAO, LabelDAO } from "../DAO";
import { Message } from "../models";

interface MappingType {
    labelFromEntity:    (entity: LabelEntity) => Promise<Label>,
    taskFromEntity:     (entity: TaskEntity) => Promise<Task>,
    noteFromEntity:     (entity: NoteEntity) => Promise<Note>,
}

const Mapping : MappingType = (() => {
    async function labelFromEntity(entity: LabelEntity): Promise<Label> {
        return { ...entity };
    }

    async function taskFromEntity(entity: TaskEntity): Promise<Task> {
        const _noteId = entity.noteId;
        let note: Note | undefined = undefined;
        if (_noteId) {
            const noteMsg: Message<NoteEntity> = await NoteDAO.getNoteByID(_noteId);
            if (!noteMsg.getIsSuccess()) {
                throw new Error(noteMsg.getError());
            }
            note = await noteFromEntity(noteMsg.getData());
        }

        const _labelIds = entity.labelIds;
        const labels: Label[] = await Promise.all(_labelIds.map( async labelId => {
            const labelMsg: Message<Label> = await LabelDAO.getLabelByID(labelId);
            if (!labelMsg.getIsSuccess()) {
                throw new Error(labelMsg.getError());
            }
            return labelMsg.getData();
        } ))

        const { labelIds, noteId, ...entityWithoutNoteLabels} = entity;
        return { ...entityWithoutNoteLabels, note, labels };
    }

    async function noteFromEntity(entity: NoteEntity): Promise<Note> {
        const _labelIds = entity.labelIds;
        const labels: Label[] = await Promise.all(_labelIds.map( async labelId => {
            const labelMsg: Message<Label> = await LabelDAO.getLabelByID(labelId);
            if (!labelMsg.getIsSuccess()) {
                throw new Error(labelMsg.getError());
            }
            return labelMsg.getData();
        } ))
        const { labelIds, ...entityWithoutLabels} = entity;
        return { ...entityWithoutLabels, labels };
    }

    return {
        labelFromEntity,
        taskFromEntity,
        noteFromEntity,
    };
})();

export default Mapping;