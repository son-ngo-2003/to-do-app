import * as React from 'react';
import dayjs from 'dayjs';
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

//components
import TimelineColumn, { TimelineColumnProps } from './TimelineColumn';
import { Layouts, Typography } from '../../../styles';
import TimelineHeader from './TimelineHeader';

//constants
import { CALENDAR_BODY_HEIGHT, END_HOUR, START_HOUR, TIMELINE_CELL_HEIGHT, TIMELINE_TIME_BAR_WIDTH } from '../constants';


export type TimelineProps = {
    startDate?: Date | string,
    selectedDate?: Date | string,

    onPressDate?: (date: Date, dateString: string) => void,
    onPressCell?: (date: Date, dateString: string, startHour: number) => void,
    onPressTask?: (id: any) => void,

    height?: number,
    numberOfDate?: number,
    showWeekends?: boolean, //Only apply for week timeline (numberOfDate = 7)
} & TimelineColumnProps;

const Timeline : React.FC<TimelineProps> = ({
    startDate = Date(),
    selectedDate,

    taskList = [],

    onPressCell,
    onPressDate,
    onPressTask,

    height = CALENDAR_BODY_HEIGHT,
    numberOfDate = 7,
    showWeekends = true,
}) => {
    const startDayjs = React.useMemo( () => numberOfDate === 7 
                                                ? dayjs( startDate ).startOf('week')
                                                : dayjs( startDate )
                                    , [startDate] );
    const numberOfDateShow = React.useMemo( () => numberOfDate !== 7 
                                                ? numberOfDate 
                                                : showWeekends ? 7 : 5   //for case of week timeline but not show weekends
                                    , [numberOfDate] );
    const { colors } = useTheme();
    const [ layoutsContainer, setLayoutContainer ] = React.useState({height: height, width: Layouts.screen.width});

    const renderColumns = React.useCallback< () => React.ReactNode[] >( () => {
        const columns : React.ReactNode[] = [];
        const columnWidth = (layoutsContainer.width - 1 - TIMELINE_TIME_BAR_WIDTH) / numberOfDateShow;       
        for (let i = 0; i < numberOfDateShow; i++) {
            const thisDay = startDayjs.add(i, 'days');
            const taskListThisDay = taskList.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'));
            
            columns.push(
                <TimelineColumn
                    key={i}
                    thisDate = { thisDay.format() }
                    taskList={ taskListThisDay.length > 0 ? taskListThisDay : undefined }
                    
                    onPressCell={onPressCell}
                    onPressTask={onPressTask}
                    
                    rightBorder={i === numberOfDate - 1}
                    width={columnWidth}
                />
            );
        }
        return columns;
    }, [startDate, taskList, numberOfDate, onPressCell, onPressTask]);

    const renderTimeBar = React.useCallback<() => React.ReactNode[]>(() => {
        const cells : React.ReactNode[] = [];
        for (let i = START_HOUR + 1; i <= END_HOUR; i++) {
            cells.push(
                <Text key={i} 
                        style={[styles.timeBarCell, 
                                {...Typography.body.x10, color: colors.border, fontSize: 11}]}
                    >{`${ i<10 ? '0'+i : i }:00`}</Text>
            )
        }
        return cells;
    }, []);

    // React.useEffect(() => {
    //     console.log('Timeline' + selectedDate);
    // }, [selectedDate]);

    return (
        <View style={[styles.container, ]}>
            <TimelineHeader
                startDate={startDate}
                numberOfDays={numberOfDateShow}

                taskList = {taskList.length > 0 ? taskList : undefined}
                showTaskList = { !!taskList }

                onPressDate={onPressDate}
                selectedDate={selectedDate}

                showMonth={false}
            />
            <ScrollView  
                style={[{maxHeight: height}]}
                onLayout={ (event) => setLayoutContainer(event.nativeEvent.layout) }
                ref = { node => { node?.scrollTo({x: 0, y: TIMELINE_CELL_HEIGHT * (dayjs().hour() - 2), animated: true}) }}
            >
                <View style={{flexDirection: 'row'}}>
                    <View style={[styles.timeBarContainer]}>
                        {renderTimeBar()}
                    </View>
                    {renderColumns()}
                </View>
            </ScrollView>
        </View>
    )
}

export default React.memo(Timeline);

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    timeBarContainer: {
        marginTop: TIMELINE_CELL_HEIGHT / 2 + 9,
        width: TIMELINE_TIME_BAR_WIDTH,
    },
    timeBarCell : {
        height: TIMELINE_CELL_HEIGHT,
        backgroundColor: 'transparent',
        textAlign: 'right',
        marginRight: 7,
    }
});