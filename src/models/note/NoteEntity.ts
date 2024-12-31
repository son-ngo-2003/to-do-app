// import {Label} from "../label";

interface NoteEntity {
    _id: string,
    title: string,
    content: string,
    labelIds: Label['_id'][],
    createdAt: Date,
    updatedAt?: Date,
    isDeleted: boolean,
}
