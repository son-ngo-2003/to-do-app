//services
import { NoteDAO, LabelDAO, TaskDAO } from "../DAO";
import Mapping from "./mapping";
import { Message } from "../models";

interface NoteServiceType {
    addNote:           (note: Partial<Note>) => Promise<Message<Note>>,
}

const NoteService : NoteServiceType = (() => {
    async function addNote(note: Partial<Note>): Promise<Message<Note>> {
        try {
            const labelIds = note.labels ? note.labels.map(label => label._id) : [];
            const { labels, ...noteWithoutLabels} = note;
            const msg: Message<NoteEntity> = await NoteDAO.addNote( { ...noteWithoutLabels, labelIds } );
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.noteFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    return {
        addNote,
    };
})();

export default NoteService;