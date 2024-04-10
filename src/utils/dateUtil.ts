function isDateBetween(comparedDate: Date, start: Date, end?: Date) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = end ? new Date(end) : new Date(start);
    endDate.setHours(23, 59, 59, 999);

    return startDate <= comparedDate && comparedDate <= endDate;
}

function getEndOfDate(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}

function getNextEntireHour(date: Date = new Date()): Date {
    const newDate = new Date(date);
    newDate.setMinutes(0, 0, 0);
    newDate.setHours(newDate.getHours() + 1);
    return newDate;
}

export {
    isDateBetween,
    getEndOfDate,
    getNextEntireHour,
}