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
    isAnnouncement?: boolean,

    parentTaskId?: Task['_id'], //this is for tasks instances from mother task with repeat attribute, if parentTask is undefined, this task is mother task

    isDeleted: boolean,
    isCompleted: boolean,
    
    createdAt: Date,
    updatedAt?: Date,
    completedAt?: Date,
}