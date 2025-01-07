// import {Note} from "../note";
// import {Label} from "../label";

interface Task {
    _id: string,
    title: string,
    note?: Note,
    labels: Label[],

    start: Date,
    end: Date, //TODO: think about if a task should have end attribute or not
    isAllDay: boolean,
    repeat?: RepeatAttributeType,
    isAnnouncement?: boolean,

    parentTask?: Task, //this is for tasks instances from mother task with repeat attribute, if parentTask is undefined, this task is mother task

    isDeleted: boolean,
    isCompleted: boolean,
    
    createdAt: Date,
    updatedAt?: Date,
    completedAt?: Date,
}