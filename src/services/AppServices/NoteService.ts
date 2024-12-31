//services
import { NoteDAO } from "../DAO";
import Mapping from "./mapping";
import { Message } from "../models";

interface NoteServiceType {
    getAllNotes:        () => Promise<Message<Note[]>>,

    addNote:           (note: Partial<Note>) => Promise<Message<Note>>,
    updateNote:        (note: Partial<Note>) => Promise<Message<Note>>,
    deleteNote:        (note: Partial<Note>) => Promise<Message<Note>>,
}

const NoteService : NoteServiceType = (() => {
    async function getAllNotes(): Promise<Message<Note[]>> {
        try {
            const msg: Message<NoteEntity[]> = await NoteDAO.getAllNotes();
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            const notes: Note[] = await Promise.all(msg.getData().map( async note => {
                return await Mapping.noteFromEntity(note);
            }));

            return Message.success(notes);
        } catch (error) {
            return Message.failure(error);
        }
    }

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

    async function updateNote(note: Partial<Note>): Promise<Message<Note>> {
        try {
            if (!note._id) {
                throw new Error('Note id is required');
            }
            const msg: Message<NoteEntity> = await NoteDAO.updateNoteById(note._id, note);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.noteFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteNote(note: Partial<Note>): Promise<Message<Note>> {
        try {
            if (!note._id) {
                throw new Error('Note id is required');
            }
            const msg: Message<NoteEntity> = await NoteDAO.deleteNoteById(note._id);
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            return Message.success(await Mapping.noteFromEntity(msg.getData()));

        } catch (error) {
            return Message.failure(error);
        }
    }

    return {
        getAllNotes,
        addNote,
        updateNote,
        deleteNote,
    };
})();

export default NoteService;