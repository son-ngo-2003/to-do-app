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
    initialDate?: Date | string,

    selectedDate?: Date,
    setSelectedDate?: (date: Date) => void,

    onPressDate?: (date: Date, dateString: string) => void,
    onPressCell?: (date: Date, dateString: string, startHour: number) => void,
    onPressTask?: (id: any) => void,

    height?: number,
    numberOfDate?: number,
} & TimelineColumnProps;

const Timeline : React.FC<TimelineProps> = ({
    startDate = Date(),

    selectedDate,
    setSelectedDate= () => {},

    taskList = [],

    onPressCell = () => {},
    onPressDate = () => {},
    onPressTask = () => {},

    height = CALENDAR_BODY_HEIGHT,
    numberOfDate = 7,
}) => {
    const startDayjs = React.useMemo( () => dayjs( startDate ), [startDate] );
    const { colors } = useTheme();
    const [ layoutsContainer, setLayoutContainer ] = React.useState({height: height, width: Layouts.screen.width});

    const renderColumns : () => React.ReactNode[] = () => {
        const columns : React.ReactNode[] = [];
        const columnWidth = (layoutsContainer.width - 1 - TIMELINE_TIME_BAR_WIDTH) / numberOfDate;
        for (let i = 0; i < numberOfDate; i++) {
            const thisDay = startDayjs.add(i, 'days');
            columns.push(
                <TimelineColumn
                    key={i}
                    
                    taskList={taskList.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'))}
                    isToday={thisDay.isSame(dayjs(), 'day')}
                    
                    onPressCellCol={(startHour) => onPressCell(thisDay.toDate(), thisDay.format(), startHour)}
                    onPressTask={onPressTask}
                    
                    rightBorder={i === numberOfDate - 1}
                    width={columnWidth}
                />
            );
        }
        return columns;
    }

    const renderTimeBar : () => React.ReactNode[] = () => {
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
    }

    return (
        <View style={[styles.container, ]}>
            <TimelineHeader
                startDate={startDate}
                numberOfDays={numberOfDate}

                taskList = {taskList}

                onPressDate={(date, dateString) => {onPressDate(date, dateString); setSelectedDate(date)}}
                selectedDate={selectedDate}
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