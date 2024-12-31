interface LabelEntity {
    _id: string,
    name: string,
    color: string,

    isDeleted: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}