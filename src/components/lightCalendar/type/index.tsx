import dayjs from "dayjs";
import { FlatList } from "react-native";

export type ScrollType =  {left: boolean, right: boolean};

export type CalenderListRef = {
    scroll: (arg: dayjs.Dayjs | number | Date | string) => void,
} & Partial<FlatList>;