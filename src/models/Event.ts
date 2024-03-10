interface Event {
    id: String,
    title: String,
    description: Note,
    labels: Label[],

    start: Date,
    end: Date,
    isAllDay: boolean,
    repeat: string,
    isAnnouncement: boolean,

    isDeleted: boolean,
    createdAt: String,
    updatedAt: String,
}