interface Note {
    id: String,
    title: String,
    content: String,
    labels: Label[],
    createdAt: String,
    updatedAt: String,
    isDeleted: boolean,
}