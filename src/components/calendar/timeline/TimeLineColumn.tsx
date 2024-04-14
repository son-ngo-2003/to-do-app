import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from "react-native"
import { useTheme } from '@react-navigation/native';
import moment from 'moment';

//utils
import { generateBBoxOfTasks } from '../utils';

//constants
import { HOURS_PER_DAY, TIMELINE_CELL_HEIGHT } from '../constants';

//components
import { Layouts, Outlines } from '../../../styles';

export type TaskTimeLine = {
    id: any,

    start: moment.Moment,
    end: moment.Moment,
    isAllDay: boolean,

    title: string,
    description: string,
    color: string,
}

export type TimeLineColumnProps = {
    width?: number,
    onPressCellCol?: (startHour: number) => void,
    rightBorder?: boolean,

    taskList?: TaskTimeLine[],
    onPressTask?: (id: any) => void,
}

const TimeLineColumn : React.FC<TimeLineColumnProps> = ({
    width = Layouts.screen.width,
    onPressCellCol = () => {},
    onPressTask = () => {},
    rightBorder = false,
    taskList = [],
}) => {
    const { colors } = useTheme();
    const taskListNotAllDay = React.useMemo(() => taskList.filter( task => !task.isAllDay), [taskList]);
    const bboxTasks = React.useMemo(() => generateBBoxOfTasks(taskListNotAllDay), [taskListNotAllDay])

    const renderCells : () => React.ReactNode[] = () => {
        const cells : React.ReactNode[] = [];
        for (let i = 0; i < HOURS_PER_DAY; i++) {
            cells.push(
                <Pressable key={i} 
                    style={[
                        styles.cell,
                        { width, borderColor: colors.border, },
                        i === 0 && {borderTopWidth: Outlines.borderWidth.hairline},
                    ]}
                    onPress = {() => onPressCellCol(i)}
                />
            )
        }
        return cells;
    }

    const renderTasksNotAllDay : () => React.ReactNode[] = () => {
        return taskListNotAllDay.map( (task, index) => 
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
    }

    return (
        <View style={[
            rightBorder && {borderRightWidth: Outlines.borderWidth.hairline, borderColor: colors.border},
        ]}>
            {renderCells()}
            {renderTasksNotAllDay()}
        </View>
    )
}

export default React.memo(TimeLineColumn);

const styles = StyleSheet.create({
    cell : {
        height: TIMELINE_CELL_HEIGHT,
        backgroundColor: 'transparent',
        borderBottomWidth: Outlines.borderWidth.hairline,
        borderLeftWidth: Outlines.borderWidth.hairline,
    }
});