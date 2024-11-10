import * as React from 'react';
import dayjs from 'dayjs';
import {View, StyleSheet, Text} from 'react-native';
import {useTheme} from "@react-navigation/native";

//components
import DateItem from './DateItem';
import {Typography} from "../../styles";

//constants
import {DATE_ITEM_WIDTH, DATE_NAME_1, DATE_NAME_2, DATE_NAME_3, DATE_NAME_FULL, LENGTH_WEEK_SHOWS} from './constants';

// import { useTraceUpdate } from '../../../hooks';

export interface CalendarProps {
    selectedDate?: Date | string | dayjs.Dayjs,
    onPressDate?: (date: Date, dateString: string) => void,

    thisMonth?: number, //0-11
    thisYear?: number,
    dateNameType?: 'full' | '3 letters' | '2 letters' | '1 letter',
}

const Calendar: React.FC<CalendarProps> = (props) => {
    const {
        selectedDate,
        onPressDate,

        thisMonth,
        thisYear,
        dateNameType,
    } = props;

    //useTraceUpdate(props);

    const { colors } = useTheme();

    const thisPeriod = React.useMemo( () => ( dayjs({ month: thisMonth, year: thisYear } )), [ thisMonth, thisYear ]);
    const firstDay = React.useMemo( () => thisPeriod.startOf('isoWeek'), [thisPeriod])

    const renderDay = React.useCallback((week: number, dateOfWeek: number) : React.ReactNode =>{
        const thisDay = firstDay.add(week * 7 + dateOfWeek, 'days');
        return (      
            <DateItem
                key={dateOfWeek}
                thisDate = { thisDay.format() }
                isCurrentMonth={ thisDay.month() === thisMonth }
                isSelected={ dayjs(selectedDate).isSame(thisDay, 'day') }
                onPress={ onPressDate }
            />
        )
    },[firstDay, thisMonth, selectedDate, onPressDate]);


    function renderHeader () : React.ReactNode[] {
        const dates: React.ReactNode[] = [];

        let listDateName : string[];
        switch (dateNameType) {
            case 'full':
                listDateName = DATE_NAME_FULL;
                break;
            case '3 letters':
                listDateName = DATE_NAME_3;
                break;
            case '2 letters':
                listDateName = DATE_NAME_2;
                break;
            case '1 letter':
                listDateName = DATE_NAME_1;
                break;
            default:
                listDateName = DATE_NAME_3;
                break;
        }

        for (let i = 0; i < 7; i++) {
            dates.push(
                <Text key={i} style={[styles.dayText,
                    {...Typography.body.x30, color: colors.text}]}
                >{listDateName[i]}</Text>
            )
        }
        return dates;
    }

    return (
        <View style={[styles.calendar]}>
            <View style={[styles.headerContainer]}>
                <View style={[styles.dateNameContainer]}>
                    {renderHeader()}
                </View>
                <View style={[styles.decorationLine, {backgroundColor: colors.border}]}/>
            </View>

            {[...Array(LENGTH_WEEK_SHOWS).keys()].map((week) =>
                <View key={week} style={[styles.weekContainer]}>
                    {[...Array(7).keys()].map((dateOfWeek) =>
                        renderDay(week, dateOfWeek)
                    )}
                </View>
            )}
        </View>
    )
}

export default React.memo(Calendar, (prev, next) => {
    return prev.selectedDate === next.selectedDate;
});

const styles = StyleSheet.create({
    calendar : {
        width: '100%',
        gap: 6
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
        gap: 4,
    },
    headerContainer : {
        width: '100%',
        alignItems: 'center',
    },
    dateNameContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    },
    dayText: {
        width: DATE_ITEM_WIDTH,
        alignItems: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginVertical: 3,
    },
    decorationLine: {
        width: '100%',
        height: 1,
    }
});