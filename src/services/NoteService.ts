//services
import StorageService from "./StorageService";
import { Message } from "./models";

//utils
import { generateId } from "../utils/generator";
import { slugInclude } from "../utils/slugUtil";


interface NoteServiceType {
    addNote:           (note: Partial<Note>) => Promise<Message<Note>>,

    getAllNotes:       () => Promise<Message<Note[]>>,
    getNoteByID:       (_id: string) => Promise<Message<Note>>,
    getNotesByCriteria:    (searchWord?: string, label?: Label) => Promise<Message<Note[]>>,

    updateNoteById:    (_id: string, newData: Partial<Note>) => Promise<Message<Note>>,
    addLabelToNote:    (label: Label, noteId: string) => Promise<Message<Note>>,

    deleteNoteById:    (_id: string) => Promise<Message<Note>>,
}

const NoteService : NoteServiceType = (() => {
    let numberOfNotes: number = 0;  
    const limitNote: number = 500;

    async function addNote(note: Partial<Note>): Promise<Message<Note>> {
        try {
            numberOfNotes++;
            if (numberOfNotes >= limitNote) {
                throw new Error(`Note service has reached the limit of ${limitNote} notes`);
            }

            note.isDeleted = note.isDeleted ?? false;
            note.createdAt = new Date();
            note._id = generateId();

            return StorageService.addData<Note>(note as Note, 'note', numberOfNotes);
        } catch (error) {
            numberOfNotes--;
            return Message.failure(error);
        }
    }

    async function getAllNotes(): Promise<Message<Note[]>> {
        try {
            return await StorageService.getAllDataByType<Note>('note');
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getNoteByID(id: string) : Promise<Message<Note>> {
        try {
            return await StorageService.getDataByTypeAndId<Note>('note', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getNotesByCriteria(searchWord?: string, label?: Label) : Promise<Message<Note[]>> { 
        try {
            const message : Message<Note[]> = await getAllNotes();
            if (!message.getIsSuccess()) return message;

            const notes : Note[] = message.getData();
            notes.filter(note => 
                (!searchWord 
                    || slugInclude(note.title, searchWord) 
                    || slugInclude(note.content, searchWord)) &&
                (!label 
                    || note.labels.includes(label)) 
            );
            return Message.success(notes);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateNoteById(id: string, newData: Partial<Note>): Promise<Message<Note>> {
        try {
            newData.updatedAt = new Date();
            return await StorageService.updateDataByTypeAndId<Note>('note', id, newData);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function addLabelToNote(label: Label, noteId: string): Promise<Message<Note>> {
        try {
            const message : Message<Note> = await getNoteByID(noteId);
            if (!message.getIsSuccess()) return message;

            const note : Note = message.getData();
            note.labels.push(label);
            return await updateNoteById(noteId, note);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteNoteById(id: string): Promise<Message<Note>> {
        try {
            numberOfNotes--;
            return await StorageService.deleteSoftDataByTypeAndId<Note>('note', id);
        } catch (error) {
            numberOfNotes++;
            return Message.failure(error);
        }
    }

    return {
        addNote,

        getAllNotes,
        getNoteByID,
        getNotesByCriteria,

        updateNoteById,
        addLabelToNote,

        deleteNoteById,
    };
})();

export default NoteService;