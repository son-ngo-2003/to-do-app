import dayjs from 'dayjs';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';

//constants
import { DATE_NAME_FULL, DATE_NAME_3, DATE_NAME_2, DATE_NAME_1, TIMELINE_TIME_BAR_WIDTH } from '../constants';

//components
import { type TaskTimeline } from '../type';
import DateItem from './DateItem';

type TimelineHeaderProps = {
    startDate: Date | string,
    numberOfDays: number,

    taskList: TaskTimeline[],
    selectedDate?: Date | string,
    onPressDate?: (date: Date, dateString: string) => void,

    dateNameType?: 'full' | '3 letters' | '2 letters' | '1 letter',
    //TODO: add dateNameType to TimelineList, CalendarList and MixCalendarList
    showMonth?: boolean
    //TODO: add showMonth function (like calendar)
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
    startDate,
    numberOfDays,

    taskList = [],
    selectedDate,
    onPressDate = () => {},

    dateNameType = '3 letters',
    showMonth = true,
}) => {
    const startDayjs = React.useMemo( () => dayjs( startDate ), [startDate] );
    const selectedDay = React.useMemo( () => dayjs( selectedDate ), [selectedDate]);
    const taskListAllDay = React.useMemo(() => taskList.filter( task => task.isAllDay), [taskList]);
    const { colors } = useTheme();

    function renderText () : React.ReactNode[] {
        const dates: React.ReactNode[] = [];
        
        let listDateNames : string[];
        switch (dateNameType) {
            case 'full':
                listDateNames = DATE_NAME_FULL;
                break;
            case '3 letters':
                listDateNames = DATE_NAME_3;
                break;
            case '2 letters':
                listDateNames = DATE_NAME_2;
                break;
            case '1 letter':
                listDateNames = DATE_NAME_1;
                break;
            default:
                listDateNames = DATE_NAME_3;
                break;
        }

        for (let i = 0; i < numberOfDays; i++) {
            const thisDay = startDayjs.add(i, 'days');
            dates.push( 
                <DateItem 
                    key={i}

                    thisDate={thisDay.toDate()}
                    onPress={() => onPressDate(thisDay.toDate(), thisDay.format() )}
                    
                    taskListThisDay = {taskListAllDay.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'))}
                    listDateNames = {listDateNames}
                
                    isSelected = {thisDay.isSame(selectedDay, 'day')}
                    isToday = {thisDay.isSame(dayjs(), 'day')}
                
                    width = {`${1/numberOfDays*100}%`}
                />
            )
        }
        return dates;
    }

    return (
        <View style={[styles.headerContainer]}>
            <View style={[styles.dateNameContainer, ]}>
                {renderText()}
            </View>
            <View style={[styles.decorationLine, {backgroundColor: colors.border}]}/>
        </View>
    )
}

export default TimelineHeader;

const styles = StyleSheet.create({
    headerContainer : {
        width: '100%',
        alignItems: 'center',
    },
    dateNameContainer: {
        paddingLeft: TIMELINE_TIME_BAR_WIDTH,
        width: '100%',
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    decorationLine: {
        width: '100%',
        height: 1,
    },
});