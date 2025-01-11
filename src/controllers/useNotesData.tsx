import {useCallback, useEffect, useState} from 'react';
import AppService from "../services";
import {BaseFilter} from "../services/type";

const useNotesData = (
    toFetchAllData: boolean = true
    // if only use addNote, updateNote, deleteNote,... , no need to fetch all data
) => {
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    const fetchNotes = useCallback( async () => {
        try {
            setLoading(true);
            const msg = await AppService.getAllNotes();
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllNotes(msg.getData());
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error fetching notes";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllNotes = useCallback( async (params?: BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getAllNotes(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error fetching notes";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getNoteById = useCallback( async (id: string) => {
        try {
            setLoading(true);
            const msg = await AppService.getNoteById(id);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error fetching note by id";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getNotesByLabel = useCallback( async (label: Label, params?: BaseFilter) => {
        try {
            setLoading(true);
            const msg = await AppService.getNotesByLabel(label, params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error fetching notes by label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getNotesWithoutLabel = useCallback( async ( params?: BaseFilter ) => {
        try {
            setLoading(true);
            const msg = await AppService.getNotesWithoutLabel(params);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error fetching notes without label";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const addNote = useCallback( async (note: Partial<Note>) => {
        try {
            setLoading(true);
            const msg = await AppService.addNote(note);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllNotes([...allNotes, msg.getData()]);
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error adding note";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [allNotes]);

    const updateNote = useCallback( async (note: Partial<Note>) => {
        try {
            setLoading(true);
            const msg = await AppService.updateNote(note);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllNotes(allNotes.map((item) => (item._id === msg.getData()._id ? msg.getData() : item)));
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error updating note";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [allNotes]);

    const deleteNote = useCallback( async (note: Note) => {
        try {
            setLoading(true);
            const msg = await AppService.deleteNote(note);
            if (!msg.getIsSuccess()) throw new Error(msg.getError());
            setAllNotes(allNotes.filter((item) => item._id !== note._id));
            return msg.getData();
        } catch (e) {
            console.error("useNotesData.ts", e);
            let errorMessage = "Error deleting note";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [allNotes]);

    useEffect(() => {
        if (toFetchAllData) fetchNotes();
    }, []);

    return {
        allNotes,
        loading,
        error,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        getAllNotes,
        fetchNotes,
        getNotesByLabel,
        getNotesWithoutLabel,
    };
};

export default useNotesData;
