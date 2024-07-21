import * as React from 'react';
import dayjs from 'dayjs';
import { View } from "react-native"

//components
import TimelineColumn, { TimelineColumnProps } from './TimelineColumn';
import {Layouts} from '../../../styles';
import TimelineHeader from './TimelineHeader';
import { SyncedScrollView } from "../../atomic/";

//constants
import { CALENDAR_BODY_HEIGHT } from '../constants';


export type TimelineProps = {
    startDate?: Date | string,
    selectedDate?: Date | string,

    onPressDate?: (date: Date, dateString: string) => void,
    onPressCell?: (date: Date, dateString: string, startHour: number) => void,
    onPressTask?: (id: any) => void,

    height?: number,
    width?: number,

    numberOfDays?: number,
    showWeekends?: boolean, //Only apply for week timeline (numberOfDays = 7)
} & TimelineColumnProps;

const Timeline : React.FC<TimelineProps> = ({
    startDate = Date(),
    selectedDate,

    taskList = [],

    onPressCell,
    onPressDate,
    onPressTask,

    height = CALENDAR_BODY_HEIGHT,
    width = Layouts.screen.width,

    numberOfDays = 7,
    showWeekends = true,
}) => {
    const startDayjs = React.useMemo( () => numberOfDays === 7
                                                ? dayjs( startDate ).startOf('week')
                                                : dayjs( startDate )
                                    , [startDate, numberOfDays] );
    const numberOfDaysShow = React.useMemo( () => numberOfDays !== 7
                                                ? numberOfDays
                                                : showWeekends ? 7 : 5   //for case of week timeline but not show weekends
                                    , [numberOfDays, showWeekends] );

    const renderColumns = React.useCallback< () => React.ReactNode >( () => {
        const columns : React.ReactNode[] = [];
        const columnWidth = width / numberOfDaysShow;       
        for (let i = 0; i < numberOfDaysShow; i++) {
            const thisDay = startDayjs.add(i, 'days');
            const taskListThisDay = taskList.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'));
            
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
        return (
            <View style={{flexDirection: 'row' }}>
                {columns.map( column => column )}
            </View>)
    }, [taskList, numberOfDays, onPressCell, onPressTask, width, startDayjs]);

    //TODO: add initial scroll position (at current hour)
    //TODO: later, update using RecyclerListView instead: https://github.com/Flipkart/recyclerlistview/tree/master

    return (
        <View style={[{width : width}]}>
            <TimelineHeader
                startDate={startDate}
                numberOfDays={numberOfDaysShow}

                taskList = {taskList.length > 0 ? taskList : undefined}
                showTaskList = { !!taskList }

                onPressDate={onPressDate}
                selectedDate={selectedDate}

                showMonth={false}
            />
            <SyncedScrollView
                _id={ dayjs(startDate).unix() }
                style={[{maxHeight: height}]}
            >
                    {renderColumns()}
            </SyncedScrollView>
        </View>
    )
}

export default React.memo(Timeline);