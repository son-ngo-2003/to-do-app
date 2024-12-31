import dayjs from "dayjs";
import { FlatList } from "react-native";

export type TaskTimeline = {
    id: any,

    start: Date | string,
    end: Date | string,
    isAllDay: boolean,

    title: string,
    description: string,
    color: string,
}

export type MarkedObject = {
    id: string,
    color: string,
    date: Date | string,
}

export type ScrollType =  {left: boolean, right: boolean};

export type SelectedType = 'one-date' | 'range-start' | 'range-end' | 'range-between' | 'none'; //type use for css

export type CalenderListRef = {
    scroll: (arg: dayjs.Dayjs | number | Date | string) => void,
    currentPeriod: string,
    onChangeSelectedDate: (date: Date, dateString: string) => void,
} & Partial<FlatList>;