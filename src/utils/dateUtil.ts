function isDateBetween(comparedDate: Date, start: Date, end?: Date) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = end ? new Date(end) : new Date(start);
    endDate.setHours(23, 59, 59, 999);

    return startDate <= comparedDate && comparedDate <= endDate;
}

export {
    isDateBetween
}