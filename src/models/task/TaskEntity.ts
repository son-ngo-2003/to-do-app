// import {Note} from "../note";
// import {Label} from "../label";

type RepeatAttributeType = {
    value: number,
    unit: 'day' | 'week' | 'month' | 'year'
};

interface TaskEntity {
    _id: string,
    title: string,
    noteId?: Note['_id'],
    labelIds: Label['_id'][],

    start: Date,
    end: Date, //TODO: think about if a task should have end attribute or not
    isAllDay: boolean,
    repeat?: RepeatAttributeType,
    isAnnouncement: boolean,

    isDeleted: boolean,
    isCompleted: boolean,
    
    createdAt: Date,
    updatedAt?: Date,
    completedAt?: Date,
}