interface Note {
    _id: string,
    title: string,
    content: string,
    labels: Label[],
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
}