//services
import StorageService from "./StorageService";
import { Message } from "../models";

//utils
import { generateId } from "../../utils/generator";
import { slugInclude } from "../../utils/slugUtil";
import {BaseFilter, isKeyOf, NoteFilter} from "../type";
import {generalCompare} from "../../utils/sortUtil";
import {UNLABELED_KEY} from "../../constant";

interface NoteDAOType {
    addNote:           (note: Partial<NoteEntity>) => Promise<Message<NoteEntity>>,

    getAllNotes:       (params?: BaseFilter) => Promise<Message<NoteEntity[]>>,
    getNoteByID:       (_id: string) => Promise<Message<NoteEntity>>,
    getNotesByCriteria:    (params?: NoteFilter & BaseFilter) => Promise<Message<NoteEntity[]>>,

    updateNoteById:    (_id: string, newData: Partial<NoteEntity>) => Promise<Message<NoteEntity>>,
    addLabelToNote:    (labelId: Label['_id'], noteId: string) => Promise<Message<NoteEntity>>, //TODO: move this to service not DAO
    //TODO: check if label deja exist for addLabelToNote
    //TODO: removeLabelFromNote: (labelId: Label['_id'], noteId: string) => Promise<Message<Note>>,
    //or can use updateNoteById instead

    deleteNoteById:    (_id: string) => Promise<Message<NoteEntity>>,
}

const NoteDAO : NoteDAOType = (() => {
    const limitNote: number = 500; //TODO: add this to constant

    async function addNote(note: Partial<NoteEntity>): Promise<Message<NoteEntity>> {
        try {
            //check required fields
            if (!note.title || !note.content) {
                throw new Error('Note title and content are required');
            }

            //Check if number of notes reached the limit
            const msg = await getAllNotes();
            if (!msg.getIsSuccess()) {
                throw new Error(msg.getError());
            }
            let numberOfNotes: number = msg.getData().length;
            if (numberOfNotes >= limitNote) {
                throw new Error(`Note storage has reached the limit of ${limitNote} notes`);
            }

            note.isDeleted = note.isDeleted ?? false;
            note.labelIds = note.labelIds ?? [];
            note.createdAt = new Date();
            note._id = generateId();

            return StorageService.addData<NoteEntity>(note as NoteEntity, 'note', numberOfNotes);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getAllNotes(params?: BaseFilter): Promise<Message<NoteEntity[]>> {
        try {
            return  await StorageService.getAllDataByType<NoteEntity>('note', params);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getNoteByID(id: string) : Promise<Message<NoteEntity>> {
        try {
            return await StorageService.getDataByTypeAndId<NoteEntity>('note', id);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function getNotesByCriteria(params: NoteFilter & BaseFilter = {}) : Promise<Message<NoteEntity[]>> {
        try {
            const message : Message<NoteEntity[]> = await getAllNotes();
            if (!message.getIsSuccess()) return message;

            const notes : NoteEntity[] = message.getData();

            const { searchTerm, labelIds, limit, offset = 0, sortBy, sortOrder } = params;
            if ( sortBy && notes[0] && !isKeyOf<NoteEntity>(sortBy, notes[0]) ) {
                throw new Error(`Invalid sortBy key: ${sortBy}`);
            }

            const _sortBy = sortBy as keyof NoteEntity;
            const results = notes.filter(note =>
                (!searchTerm
                    || slugInclude(note.title, searchTerm)
                    || slugInclude(note.content, searchTerm)) &&
                (!labelIds
                    || note.labelIds.some(labelId => labelIds.includes(labelId))
                    || (labelIds.includes(UNLABELED_KEY) && note.labelIds.length === 0))
            )
                .sort((a, b) => {
                    if (!sortBy) return 0;
                    return generalCompare(a[_sortBy], b[_sortBy], sortOrder);
                })
                .slice(offset, limit ? offset + limit : undefined);

            return Message.success(results);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function updateNoteById(id: string, newData: Partial<NoteEntity>): Promise<Message<NoteEntity>> {
        try {
            newData.updatedAt = new Date();
            return await StorageService.updateDataByTypeAndId<NoteEntity>('note', id, newData);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function addLabelToNote(labelId: Label['_id'], noteId: string): Promise<Message<NoteEntity>> {
        try {
            const message : Message<NoteEntity> = await getNoteByID(noteId);
            if (!message.getIsSuccess()) return message;

            const note : NoteEntity = message.getData();
            note.labelIds.push(labelId);
            return await updateNoteById(noteId, note);
        } catch (error) {
            return Message.failure(error);
        }
    }

    async function deleteNoteById(id: string): Promise<Message<NoteEntity>> {
        try {
            return await StorageService.deleteSoftDataByTypeAndId<NoteEntity>('note', id);
        } catch (error) {
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

export default NoteDAO;