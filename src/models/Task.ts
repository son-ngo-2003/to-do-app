interface Task {
    _id: string,
    title: string,
    note: Note,
    labels: Label[],

    start: Date,
    end: Date, //TODO: think about if a task should have end attribute or not
    isAllDay: boolean,
    repeat: string,
    isAnnouncement: boolean,

    isDeleted: boolean,
    isCompleted: boolean,
    
    createdAt: Date,
    updatedAt: Date,
    completedAt: Date,
}