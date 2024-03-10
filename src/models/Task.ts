interface Task {
    _id: string,
    title: string,
    note: Note,
    labels: Label[],

    start: Date,
    end: Date,
    isAllDay: boolean,
    repeat: string,
    isAnnouncement: boolean,

    isDeleted: boolean,
    createdAt: Date,
    updatedAt: Date,
}