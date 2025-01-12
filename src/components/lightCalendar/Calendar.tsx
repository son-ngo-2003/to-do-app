import * as React from 'react';
import dayjs from 'dayjs';
import {View, StyleSheet, Text, FlatList} from 'react-native';
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

    // list of days in the month
    const days = React.useMemo(() => {
        const totalDays = LENGTH_WEEK_SHOWS * 7;
        return [...Array(totalDays).keys()].map((index) => {
            const thisDay = firstDay.add(index, 'days');
            return {
                key: `${index}`,
                date: thisDay.format(),
                isCurrentMonth: thisDay.month() === thisMonth,
                isSelected: dayjs(selectedDate).isSame(thisDay, 'day'),
            };
        });
    }, [firstDay, thisMonth, selectedDate]);

    const renderHeader = React.useMemo(() => {
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

        return (
            <View style={[styles.dateNameContainer]}>
                {listDateName.map((name, index) => (
                    <Text key={index} style={[styles.dayText,
                        {...Typography.body.x30, color: colors.text}]}
                    >{name}</Text>
                ))}
            </View>
        );
    }, [dateNameType, colors.text]);

    return (
        <View style={[styles.calendar]}>
            <View style={[styles.headerContainer]}>
                {renderHeader}
                <View style={[styles.decorationLine, {backgroundColor: colors.border}]}/>
            </View>

            {/* FlatList */}
            <FlatList
                data={days}
                renderItem={({ item }) => (
                    <DateItem
                        thisDate={item.date}
                        isCurrentMonth={item.isCurrentMonth}
                        isSelected={item.isSelected}
                        onPress={onPressDate}
                    />
                )}
                keyExtractor={(item) => item.key}
                numColumns={7} // 7 days in a week
                columnWrapperStyle={styles.weekContainer}
            />
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