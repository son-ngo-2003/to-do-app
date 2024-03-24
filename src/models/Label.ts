interface Label {
    _id: string,
    name: string,
    color: string,

    numberOfTasks: number,
    numberOfCompletedTasks: number,
    numberOfNotes: number,

    isDeleted: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}