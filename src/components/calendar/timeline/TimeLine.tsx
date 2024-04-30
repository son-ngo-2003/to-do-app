import * as React from 'react';
import moment from 'moment';
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

//components
import TimelineColumn, { TimelineColumnProps } from './TimelineColumn';
import { Layouts, Typography } from '../../../styles';
import TimelineHeader from './TimelineHeader';

//constants
import { END_HOUR, START_HOUR, TIMELINE_CELL_HEIGHT, TIMELINE_TIME_BAR_WIDTH } from '../constants';


export type TimelineProps = {
    startDay?: number,
    startMonth?: number,
    startYear?: number,
    initialDate?: moment.Moment,

    selectedDate?: moment.Moment,
    setSelectedDate?: (date: moment.Moment) => void,

    onPressDate?: (date: moment.Moment) => void,
    onPressCell?: (date: moment.Moment, startHour: number) => void,
    onPressTask?: (id: any) => void,

    height: number,
    numberOfDate?: number,
} & TimelineColumnProps;

const Timeline : React.FC<TimelineProps> = ({
    startDay,
    startMonth,
    startYear, 

    selectedDate,
    setSelectedDate= () => {},

    taskList = [],

    onPressCell = () => {},
    onPressDate = () => {},
    onPressTask = () => {},

    height,
    numberOfDate = 7,
}) => {
    const startMoment = React.useMemo( () => moment( startYear && startMonth && startDay && [startYear, startMonth, startDay]), [startYear, startMonth, startDay] );
    const { colors } = useTheme();
    const [ layoutsContainer, setLayoutContainer ] = React.useState({height: height, width: Layouts.screen.width});

    const renderColumns : () => React.ReactNode[] = () => {
        const columns : React.ReactNode[] = [];
        const columnWidth = (layoutsContainer.width - 1 - TIMELINE_TIME_BAR_WIDTH) / numberOfDate;
        for (let i = 0; i < numberOfDate; i++) {
            const thisDay = startMoment.clone().add(i, 'days');
            columns.push(
                <TimelineColumn
                    key={i}
                    taskList={taskList.filter( task => thisDay.isBetween(task.start, task.end, 'day', '[]'))}
                    isToday={thisDay.isSame(moment(), 'day')}
                    width={columnWidth}
                    onPressCellCol={(startHour) => onPressCell(thisDay, startHour)}
                    onPressTask={onPressTask}
                    rightBorder={i === numberOfDate - 1}
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
                startDay={startMoment.date()}
                startMonth={startMoment.month()}
                startYear={startMoment.year()}
                numberOfDays={numberOfDate}

                taskList = {taskList}

                onPressDate={(date) => {onPressDate(date); setSelectedDate(date)}}
                selectedDay={selectedDate?.date()}
            />
            <ScrollView  
                style={[{maxHeight: height}]}
                onLayout={ (event) => setLayoutContainer(event.nativeEvent.layout) }
                ref = { node => { node?.scrollTo({x: 0, y: TIMELINE_CELL_HEIGHT * (moment().hour() - 2), animated: true}) }}
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