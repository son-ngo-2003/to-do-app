import dayjs from 'dayjs';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet, Text } from 'react-native';

//constants
import { DATE_NAME_FULL, DATE_NAME_3, DATE_NAME_2, DATE_NAME_1, MONTH_NAME_3 } from '../constants';

//components
import { type TaskTimeline } from '../type';
import DateItem from './DateItem';
import { Typography } from '../../../styles';

type TimelineHeaderProps = {
    startDate: Date | string,
    numberOfDays: number,

    taskList?: TaskTimeline[],
    showTaskList?: boolean,

    selectedDate?: Date | string,
    onPressDate?: (date: Date, dateString: string) => void,

    dateNameType?: 'full' | '3 letters' | '2 letters' | '1 letter',
    //TODO: add dateNameType to TimelineList, CalendarList and MixCalendarList
    showMonth?: boolean
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
    startDate,
    numberOfDays,

    taskList,
    showTaskList = false,

    selectedDate,
    onPressDate,

    dateNameType = '3 letters',
    showMonth = true,
}) => {
    const startDayjs = React.useMemo( () => dayjs( startDate ), [startDate] );
    const selectedDay = React.useMemo( () => selectedDate && dayjs( selectedDate ), [selectedDate]);
    const taskListAllDay = React.useMemo(() => taskList && taskList.filter( task => task.isAllDay), [taskList]);
    const { colors } = useTheme();

    const renderText = React.useCallback<() => React.ReactNode[]>( () => {
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
            const taskThisDay = taskListAllDay ? taskListAllDay.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]')) : [];

            dates.push( 
                <DateItem 
                    key={i}

                    thisDate={thisDay.format()}
                    isSelected = {!!selectedDate && thisDay.isSame(selectedDay, 'day')}
                    onPress={onPressDate}
                    
                    taskListThisDay = { taskThisDay.length > 0 ? taskThisDay : undefined}
                    showTaskList = {showTaskList}
                    listDateNames = {listDateNames}
                
                    width = {`${1/numberOfDays*100}%`}
                />
            )
        }
        return dates;
    }, [onPressDate, taskListAllDay, numberOfDays, selectedDate, dateNameType, startDayjs, selectedDay, showTaskList]);

    // React.useEffect(() => {
    //     console.log('TimelineHeader' + startDate);
    // });

    return (
        <View style={[styles.headerContainer]}>
            {/*TODO: this part is not suitable any more*/}
            {   showMonth && 
                <View style={[styles.titleContainer]}>
                    <Text
                        style={[{color: colors.text}, Typography.header.x50]}
                    >{  MONTH_NAME_3[startDayjs.month()] }</Text>

                    <Text
                        style={[{color: colors.text, opacity: 0.5}, Typography.subheader.x40]}
                    >{  startDayjs.year() }</Text>
                </View>
            }
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