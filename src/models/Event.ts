interface Event {
    id: string,
    title: string,
    description: Note,
    labels: Label[],

    start: Date,
    end: Date,
    isAllDay: boolean,
    repeat: string,
    isAnnouncement: boolean,

    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}