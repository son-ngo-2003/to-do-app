import { FlatList } from "react-native";

export type TaskTimeline = {
    id: any,

    start: Date | string | moment.Moment,
    end: Date | string | moment.Moment,
    isAllDay: boolean,

    title: string,
    description: string,
    color: string,
}

export type MarkedObject = {
    id: string,
    color: string,
    date: Date | string | moment.Moment,
}

export type ScrollType =  {left: boolean, right: boolean};

export type SelectedType = 'one-date' | 'range-start' | 'range-end' | 'range-between' | 'none'; //type use for css

export type CalenderListRef = {
    scroll: (arg: moment.Moment | number | Date | string) => void,
} & Partial<FlatList>;

