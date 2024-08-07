import * as React from 'react';
import dayjs from 'dayjs';
import {ScrollView, View} from "react-native"

//components
import TimelineColumn, { TimelineColumnProps } from './TimelineColumn';
import {Layouts} from '../../../styles';
import TimelineHeader, {type TimelineHeaderProps} from './TimelineHeader';
import { SyncedScrollView } from "../../atomic/";

//constants
import {CALENDAR_BODY_HEIGHT, TIMELINE_HEIGHT} from '../constants';

// import {useTraceUpdate} from "../../../hooks";


export interface TimelineProps {
    startDate: Date | string,
    selectedDate?: Date | string,
    taskList?: TimelineColumnProps['taskList']

    onPressDate?: (date: Date, dateString: string) => void,
    onPressCell?: TimelineColumnProps['onPressCell'],
    onPressTask?: TimelineColumnProps['onPressTask'],

    height?: number | 'short' | 'medium' | 'full',
    width?: number,
    initialOffset?: number,

    numberOfDays?: number,
    showWeekends?: boolean, //Only apply for week timeline (numberOfDays = 7)

    dateNameType?: TimelineHeaderProps['dateNameType']
}

const Timeline = React.forwardRef <ScrollView, TimelineProps> ((
    props, ref
) => {
    const {
        startDate,
        selectedDate,

        taskList,

        onPressCell,
        onPressDate,
        onPressTask,

        height = CALENDAR_BODY_HEIGHT,
        width = Layouts.screen.width,
        initialOffset = 0,

        numberOfDays = 7,
        showWeekends = true,
        dateNameType,
    } = props;

    // useTraceUpdate(props);

    const startDayjs = React.useMemo( () => numberOfDays === 7
                                                ? dayjs( startDate ).startOf('isoWeek')
                                                : dayjs( startDate )
                                    , [startDate, numberOfDays] );
    const numberOfDaysShow = React.useMemo( () => numberOfDays !== 7
                                                ? numberOfDays
                                                : showWeekends ? 7 : 5   //for case of week timeline but not show weekends
                                    , [numberOfDays, showWeekends] );

    const heightNumber = React.useMemo( () => {
        return typeof height === 'number' ? height : TIMELINE_HEIGHT[height];
    } , [height] );

    const renderColumns = React.useCallback< () => React.ReactNode[] >( () => {

        const columns : React.ReactNode[] = [];
        const columnWidth = width / numberOfDaysShow;       
        for (let i = 0; i < numberOfDaysShow; i++) {
            const thisDay = startDayjs.add(i, 'days');
            const taskListThisDay = taskList
                                                    ? taskList.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'))
                                                    : [];
            
            columns.push(
                <TimelineColumn
                    key={i}
                    thisDate = { thisDay.format() }
                    taskList={ taskListThisDay.length > 0 ? taskListThisDay : undefined }
                    
                    onPressCell={ onPressCell }
                    onPressTask={ onPressTask }
                    
                    rightBorder={i === numberOfDays - 1}
                    width={columnWidth}
                />
            );
        }

        return columns
    }, [taskList, numberOfDays, onPressCell, onPressTask, width, startDayjs]);

    //TODO: later, update using RecyclerListView instead: https://github.com/Flipkart/recyclerlistview/tree/master

    const containerStyle = React.useMemo(() => ({width}), [width]);
    const scrollViewStyle = React.useMemo(() => ({maxHeight: heightNumber}), [heightNumber]);

    return (
        <View style={containerStyle}>
            <TimelineHeader
                startDate={startDate}
                numberOfDays={numberOfDaysShow}

                taskList = { (taskList && taskList.length > 0) ? taskList : undefined}
                showTaskList = { !!taskList }

                onPressDate={onPressDate}
                selectedDate={selectedDate}

                showMonth={false}
                dateNameType={dateNameType}
            />

            <SyncedScrollView
                _id={ dayjs(startDate).unix() }
                initialOffset={initialOffset}
                ref={ref}
                style={scrollViewStyle}
            >
                <View style={{flexDirection: 'row' }}>
                    { renderColumns() }
                </View>
            </SyncedScrollView>
        </View>
    )
});

export default React.memo(Timeline);