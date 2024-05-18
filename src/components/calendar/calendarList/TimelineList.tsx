import * as React from 'react';
import moment from 'moment';
import { ListRenderItem, FlatList } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import { Layouts, Animations as Anim } from '../../../styles';
import Timeline, { type TimelineProps } from '../timeline/Timeline';
import { type ScrollType, type CalenderListRef } from '../type';

type TimelineListProps = {
    onScroll: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: moment.Moment  ) => void,
    minPeriod?: moment.Moment | string | Date, 
    maxPeriod?: moment.Moment | string | Date,
    width?: number,
} & TimelineProps;

type DataItemType = {
    thisPeriod: moment.Moment,
}

const TimelineList = React.forwardRef<CalenderListRef, TimelineListProps>(({
    initialDate,
    
    taskList,
    onPressDate,
    onPressCell,
    onPressTask,
    onScroll = () => {},

    height,
    numberOfDate = 7,
    width = Layouts.screen.width,
    minPeriod,
    maxPeriod,

}, ref) => {
    const flatListRef = React.useRef<FlatList<DataItemType>>(null);

    const referencePeriod = React.useMemo<moment.Moment>( () => moment(initialDate), [initialDate] );
    const [ currentPeriod, setCurrentPeriod ] = React.useState<moment.Moment>( referencePeriod );
    const periodMin = React.useMemo<moment.Moment>( () => moment(minPeriod), [ minPeriod ] );
    const periodMax = React.useMemo<moment.Moment>( () => moment(maxPeriod), [ maxPeriod ] );

    const [ selectedDate, setSelectedDate ] = React.useState<moment.Moment>( referencePeriod );
    const expandCalendarProgress = useSharedValue<number>(height);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll
    }), [selectedDate]);

    const calendarContainerAnimation = useAnimatedStyle(() => {
        return {
            height: expandCalendarProgress.value,
        }
    }, []);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisPeriod } = item;

        return (
            <Animated.View 
                style={[{width: width}, calendarContainerAnimation]}
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
        const listItem : DataItemType[] = [];

        let thisPeriod = periodMin.clone();
        while (thisPeriod.isBefore(periodMax)) {
            listItem.push({thisPeriod: thisPeriod.clone()});
            thisPeriod.add( numberOfDate, 'days');
        }

        return listItem;
    }

    function getIndexOfPeriod (date: moment.Moment = referencePeriod): number {
        return Math.floor((date.diff(periodMin, 'days', true)+1) / numberOfDate);
    }

    function scroll( _arg: moment.Moment | number | Date | string, force : boolean = false ) : void {
        if (!flatListRef.current) {
            onScroll( false, {left: true, right: true});
            return;
        }

        const newPeriod = (typeof _arg === 'number') 
                            ? currentPeriod.clone().add(_arg * numberOfDate, 'days')
                            : moment(_arg);

        let scrollDirection : ScrollType = {left: true, right: true};
        newPeriod.isSameOrBefore(periodMin, 'days') && (scrollDirection.left = false);
        newPeriod.isSameOrAfter(periodMax, 'days') && (scrollDirection.right = false);
        if (newPeriod.isBefore(periodMin, 'days') || newPeriod.isAfter(periodMax, 'days')) {
            onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToIndex({
            index: getIndexOfPeriod(newPeriod),
            animated: true,
        });

        onScroll( true, scrollDirection, newPeriod );
    }

    React.useEffect(() => {
        scroll(selectedDate);
        setCurrentPeriod(selectedDate);
    }, [selectedDate]);

    React.useEffect(() => {
        expandCalendarProgress.value = Anim.spring<number>(height).base.slow;
    }, [height]);

    return (
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
    )
});
export default TimelineList;