import * as React from 'react';
import { View, Pressable, StyleSheet } from "react-native"
import { useTheme } from '@react-navigation/native';

//utils
import { generateBBoxOfTasks } from '../utils';

//constants
import { HOURS_PER_DAY, TIMELINE_CELL_HEIGHT } from '../constants';
const TIME_POINT_INDICATOR_SIZE = 10;

//components & types
import { Colors, Layouts, Outlines } from '../../../styles';
import { type TaskTimeline } from '../type';
import dayjs from 'dayjs';

export type TimelineColumnProps = {
    thisDate?: Date | string,

    onPressCell?: (date: Date, dateString: string, startHour: number) => void,
    onPressTask?: (id: any) => void,
    
    taskList?: TaskTimeline[],
    
    rightBorder?: boolean,
    width?: number,
}

const TimelineColumn : React.FC<TimelineColumnProps> = ({
    thisDate,

    onPressCell = () => {},
    onPressTask = () => {},
    taskList,
    
    rightBorder = false,
    width = Layouts.screen.width,
}) => {
    const { colors } = useTheme();
    const thisDayjs = React.useMemo(() => dayjs(thisDate), [thisDate]);
    const isToday = React.useMemo(() => dayjs().isSame(thisDayjs, 'day'), [thisDate]);
    
    const taskListNotAllDay = React.useMemo(() => taskList && taskList.filter( task => !task.isAllDay), [taskList]);
    const bboxTasks = React.useMemo(() => generateBBoxOfTasks(taskListNotAllDay), [taskListNotAllDay]);
    const [ indicatorPos, setIndicatorPos ] = React.useState<number>(0);

    const renderCells = React.useCallback<() => React.ReactNode[]> (() => {
        const cells : React.ReactNode[] = [];
        for (let i = 0; i < HOURS_PER_DAY; i++) {
            cells.push(
                <Pressable key={i} 
                    style={[
                        styles.cell,
                        { width, borderColor: colors.border, },
                        i === 0 && {borderTopWidth: Outlines.borderWidth.hairline},
                    ]}
                    onPress = {() => onPressCell( thisDayjs.toDate(), thisDayjs.format(), i)}
                />
            )
        }
        return cells;
    }, [onPressCell, width, colors.border, thisDate]);

    const renderTasksNotAllDay = React.useCallback<() => React.ReactNode[] | undefined>(() => {
        return taskListNotAllDay && taskListNotAllDay.map( (task, index) => 
            <Pressable  key={index} 
                onPress = {() => {onPressTask(task.id)}}
                style={{
                    ...bboxTasks[index],
                    position: 'absolute',
                    backgroundColor: task.color,
                    borderRadius: Outlines.borderRadius.small,
                }}
            >
                    {/* <Text>{task.title}</Text> */}
            </Pressable>
        );
    }, [taskListNotAllDay, onPressTask, bboxTasks]);

    const renderCurrentTimeIndicator = React.useCallback<() => React.ReactNode>(() => {
        return (
            <View style={[styles.currentTimeIndicator, 
                            {top: indicatorPos}]}>
                <View style={[styles.currentTimeIndicatorLine]}/>
                <View style={[styles.currentTimeIndicatorPoint]}/>
            </View>
        )
    }, [indicatorPos]);

    React.useEffect(() => {
        if (!isToday) return;
        const updateTimeIndicator = () => {
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            setIndicatorPos((currentHour + currentMinute / 60) * TIMELINE_CELL_HEIGHT);
        }

        updateTimeIndicator();
        setInterval(() => {
            updateTimeIndicator();
        }, 1000*60);
    },[]);

    return (
        <View style={[
            rightBorder && {borderRightWidth: Outlines.borderWidth.hairline, borderColor: colors.border},
        ]}>
            {renderCells()}
            {renderTasksNotAllDay()}
            {isToday && renderCurrentTimeIndicator()}
        </View>
    )
}

export default React.memo(TimelineColumn);

const styles = StyleSheet.create({
    cell : {
        height: TIMELINE_CELL_HEIGHT,
        backgroundColor: 'transparent',
        borderBottomWidth: Outlines.borderWidth.hairline,
        borderLeftWidth: Outlines.borderWidth.hairline,
    },
    currentTimeIndicator: {
        position: 'absolute',
        width: '100%',
    },
    currentTimeIndicatorLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: Colors.primary.red,
    },
    currentTimeIndicatorPoint: {
        width: TIME_POINT_INDICATOR_SIZE,
        height: TIME_POINT_INDICATOR_SIZE,
        borderRadius: TIME_POINT_INDICATOR_SIZE / 2,
        backgroundColor: Colors.primary.red,
        position: 'absolute',
        top: -TIME_POINT_INDICATOR_SIZE / 2 + 1,
        left: -TIME_POINT_INDICATOR_SIZE + 1,
    }
});