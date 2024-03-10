interface Note {
    id: string,
    title: string,
    content: string,
    labels: Label[],
    createdAt: string,
    updatedAt: string,
    isDeleted: boolean,
}