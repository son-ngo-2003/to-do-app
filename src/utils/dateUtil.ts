import dayjs, {ManipulateType} from "dayjs";

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

function addDate(date: Date, number: number = 0, unit?: ManipulateType): Date {
    return dayjs(date).add(number, unit).toDate();
}

function getNearestDateOfRepeatTask(taskDate: Date, repeat: RepeatAttributeType): Date {
    const dayjsDate = dayjs(taskDate);
    const delta = dayjs().diff(dayjsDate, repeat.unit);
    const nextDate = dayjsDate.add(repeat.value * (delta > 0 ? delta : delta + 1), repeat.unit);
    return nextDate.toDate();
}

function getRangeOfDate(start: Date, end: Date, step: RepeatAttributeType): Date[] {
    const dayjsStart = dayjs(start);
    const dayjsEnd = dayjs(end);
    const range = [];
    for (let date = dayjsStart; date <= dayjsEnd; date = date.add(step.value, step.unit)) {
        range.push(date.toDate());
    }
    return range;
}

export {
    isDateBetween,
    getEndOfDate,
    getNextEntireHour,
    getNearestDateOfRepeatTask,
    getRangeOfDate,
    addDate,
}