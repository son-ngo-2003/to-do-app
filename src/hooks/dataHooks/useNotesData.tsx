import { useEffect, useState } from 'react';
import { NoteService } from "../../services";

const useNotesData = (
    toFetchAllData: boolean = true
    // if only use addNote, updateNote, deleteNote,... , no need to fetch all data
) => {
    const [data, setData] = useState<Note[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>();

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const msg = await NoteService.getAllNotes();
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(msg.getData());
        } catch (e) {
            let errorMessage = "Error fetching notes";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getNoteById = async (id: string) => {
        try {
            setLoading(true);
            const msg = await NoteService.getNoteById(id);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error fetching note by id";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (note: Partial<Note>) => {
        try {
            setLoading(true);
            const msg = await NoteService.addNote(note);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData([...data, msg.getData()]);
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error adding note";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const updateNote = async (note: Partial<Note>) => {
        try {
            setLoading(true);
            const msg = await NoteService.updateNote(note);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(data.map((item) => (item._id === msg.getData()._id ? msg.getData() : item)));
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error updating note";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (note: Note) => {
        try {
            setLoading(true);
            const msg = await NoteService.deleteNote(note);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setData(data.filter((item) => item._id !== note._id));
            return msg.getData();
        } catch (e) {
            let errorMessage = "Error deleting note";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (toFetchAllData) fetchNotes();
    }, []);

    return { data, loading, error, addNote, updateNote, deleteNote, getNoteById };
};

export default useNotesData;
