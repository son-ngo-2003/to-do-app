import * as React from 'react';
import moment from 'moment';
import { StyleSheet, ListRenderItem, FlatList, Pressable, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import CalendarListHeader from './CalendarListHeader';
import { Layouts, Animations as Anim } from '../../../styles';
import { CALENDAR_BODY_HEIGHT } from '../constants';
import Timeline, { TimelineProps } from '../timeline/Timeline';

type TimelineListProps = {
    minPeriod?: number, // - delta with current period (1 period has numberOfDate days)
    maxPeriod?: number, // + delta with current period (1 period has numberOfDate days)
    width?: number,
    onPressCalendarList?: (e: GestureResponderEvent) => void,
} & TimelineProps;

type TimelineListRef = {
    scroll: (arg: moment.Moment | number) => void,
} & Partial<FlatList>;

type DataItemType = {
    thisPeriod: moment.Moment,
}

const TimelineList: React.FC<TimelineListProps> = React.forwardRef<TimelineListRef, TimelineListProps>(({
    initialDate,
    onPressCalendarList = () => {},
    
    taskList,
    onPressDate,
    onPressCell,
    onPressTask,

    height,
    numberOfDate = 7,
    width = Layouts.screen.width,
    minPeriod = 20,
    maxPeriod = 20,

}, ref) => {
    const flatListRef = React.useRef<FlatList<DataItemType>>(null);
    const referencePeriod = React.useMemo<moment.Moment>( () => moment(initialDate), [initialDate] );
    const [ selectedDate, setSelectedDate ] = React.useState<moment.Moment>( referencePeriod );
    const [ currentPeriod, setCurrentPeriod ] = React.useState<moment.Moment>( referencePeriod );
    const [ canScroll, setCanScroll ] = React.useState<'left' | 'right' | '2-directions'>( '2-directions');
    const periodMin = React.useMemo<moment.Moment>( () => referencePeriod.clone().subtract(minPeriod * numberOfDate, 'days'), [initialDate, minPeriod] );
    const periodMax = React.useMemo<moment.Moment>( () => referencePeriod.clone().add(maxPeriod * numberOfDate, 'days'), [initialDate, maxPeriod] );
    const expandCalendarProgress = useSharedValue<number>(height);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: (arg: moment.Moment | number) => {
            scroll(arg);
        }
    }), [selectedDate]);

    const calendarContainerAnimation = useAnimatedStyle(() => {
        return {
            height: expandCalendarProgress.value,
        }
    }, []);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisPeriod } = item;

        return (
            <Animated.View style={[{width: width}, calendarContainerAnimation]}
            >
                <Timeline
                    startDay={thisPeriod.date()}
                    startMonth={thisPeriod.month()}
                    startYear={thisPeriod.year()}

                    selectedDate={selectedDate.isBetween(thisPeriod, thisPeriod.clone().add(numberOfDate, 'days'), 'day', '[]') ? selectedDate : undefined}
                    setSelectedDate={setSelectedDate}

                    taskList={taskList}

                    onPressCell={onPressCell}
                    onPressDate={onPressDate}
                    onPressTask={onPressTask}

                    height={height}
                    numberOfDate={numberOfDate}
                ></Timeline>
            </Animated.View>
        )
    },[selectedDate, currentPeriod, height, taskList]);

    function getDataList () : DataItemType[] {
        const listItem : DataItemType[] = []
        for (let i = -minPeriod; i <= maxPeriod; i++) {
            const thisPeriod = referencePeriod.clone().add(i * numberOfDate, 'days');
            listItem.push({thisPeriod});
        }
        return listItem;
    }

    function getIndexOfPeriod (date: moment.Moment = referencePeriod): number {
        return Math.floor((date.diff(periodMin, 'days', true)+1) / numberOfDate);
        //TODO: change in CalendarList this function, because it is not correct, use the same logic as this file
    }

    function scroll( _arg: moment.Moment | number, force : boolean = false ) : void {
        if (!flatListRef.current) return;
        const newPeriod = (typeof _arg === 'number') 
                            ? currentPeriod.clone().add(_arg * numberOfDate, 'days')
                            : _arg;

        newPeriod.isSameOrBefore(periodMin, 'days') && setCanScroll('right');
        newPeriod.isSameOrAfter(periodMax, 'days') && setCanScroll('left');
        if (newPeriod.isBefore(periodMin, 'days') || newPeriod.isAfter(periodMax, 'days')) return;
        setCanScroll('2-directions');

        flatListRef.current?.scrollToIndex({
            index: getIndexOfPeriod(newPeriod),
            animated: true,
        });
        setCurrentPeriod(newPeriod);
    }

    React.useEffect(() => {
        scroll(selectedDate);
        setCurrentPeriod(selectedDate);
    }, [selectedDate]);

    React.useEffect(() => {
        expandCalendarProgress.value = Anim.spring<number>(height).base.slow;
    }, [height]);

    return (
        <Pressable style={[styles.calendar, {width}]}
                    onPress={onPressCalendarList}
                    onStartShouldSetResponderCapture={(e) => height < CALENDAR_BODY_HEIGHT}
        >
            <CalendarListHeader
                selectDateString={ selectedDate.format('DD/MM') }
                currentMonth={ currentPeriod.month() }
                currentYear={ currentPeriod.year() }
                onPressLeft={() => scroll(-1)}
                onPressRight={() => scroll(1)}
                canScroll={canScroll}
            />
            <FlatList
                ref={flatListRef}
                data={getDataList()}
                renderItem={renderItem}
                //scrollEnabled={!showOneWeek}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                getItemLayout={(data, index) => ({length: width, offset: width * index, index})}
                initialScrollIndex={getIndexOfPeriod()}
            />
        </Pressable>
    )
});
export default TimelineList;

const styles = StyleSheet.create({
    calendar: {},
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});