import moment from 'moment';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet } from 'react-native';

//constants
import { DATE_NAME_FULL, DATE_NAME_3, DATE_NAME_2, DATE_NAME_1, TIMELINE_TIME_BAR_WIDTH } from '../constants';

//components
import { TaskTimeline } from './TimelineColumn';
import DateItem from './DateItem';

type TimelineHeaderProps = {
    startDay: number,
    startMonth: number,
    startYear: number,
    numberOfDays: number,

    taskList: TaskTimeline[],
    selectedDay?: number,
    onPressDate?: (date: moment.Moment) => void,

    dateNameType?: 'full' | '3 letters' | '2 letters' | '1 letter',
    showMonth?: boolean
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
    startDay,
    startMonth,
    startYear,
    numberOfDays,

    taskList = [],
    selectedDay,
    onPressDate = () => {},

    dateNameType = '3 letters',
    showMonth = true,
}) => {
    const startMoment = React.useMemo( () => moment( startYear && startMonth && startDay && [startYear, startMonth, startDay]), [startYear, startMonth, startDay] );
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
            const thisDay = startMoment.clone().add(i, 'days');
            const isSelected = selectedDay === thisDay.date();
            dates.push( 
                <DateItem 
                    key={i}

                    thisDay = {thisDay.date()}
                    thisMonth = {thisDay.month()}
                    thisYear = {thisDay.year()}
                    taskListThisDay = {taskListAllDay.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'))}
                    
                    thisDayOfWeek = {thisDay.isoWeekday()}
                    listDateNames = {listDateNames}
                
                    isSelected = {isSelected}
                    onPress={() => onPressDate(thisDay)}
                
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