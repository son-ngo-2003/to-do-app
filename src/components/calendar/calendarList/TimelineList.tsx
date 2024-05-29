import * as React from 'react';
import dayjs from 'dayjs';
import { ListRenderItem, FlatList, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import { Layouts, Animations as Anim } from '../../../styles';
import Timeline, { type TimelineProps } from '../timeline/Timeline';
import { type ScrollType, type CalenderListRef } from '../type';
import { CALENDAR_BODY_HEIGHT } from '../constants';

type TimelineListProps = {
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date  ) => void,
    minPeriod?: dayjs.Dayjs | string | Date, 
    maxPeriod?: dayjs.Dayjs | string | Date,
    width?: number,
} & TimelineProps;

type DataItemType = {
    thisPeriod: Date,
}

const TimelineList = React.forwardRef<CalenderListRef, TimelineListProps>(({
    initialDate,
    
    taskList,
    onPressDate,
    onPressCell,
    onPressTask,
    onScroll = () => {},

    height = CALENDAR_BODY_HEIGHT,
    numberOfDate = 7,
    width = Layouts.screen.width,
    minPeriod,
    maxPeriod,

}, ref) => {
    const flatListRef = React.useRef<FlatList<DataItemType>>(null);

    const referencePeriod = React.useMemo<Date>( () => dayjs(initialDate).toDate(), [initialDate] );
    const [ currentPeriod, setCurrentPeriod ] = React.useState<Date>( referencePeriod );

    const [ selectedDate, setSelectedDate ] = React.useState<Date>( referencePeriod );
    const expandCalendarProgress = useSharedValue<number>(height);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll
    }), [ selectedDate]);

    const _onPressDate = React.useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, []);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisPeriod } = item;

        const diffWithStartDate = dayjs(selectedDate).diff(thisPeriod, 'date');

        return (
            <Animated.View 
                style={[{width: width,
                    height: expandCalendarProgress,
                }]}
            >
                <Timeline
                    startDate={ thisPeriod }

                    selectedDate={ (diffWithStartDate > 0 && diffWithStartDate < numberOfDate) ? selectedDate : undefined}
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

        let thisPeriod = dayjs(minPeriod);
        while (thisPeriod.isBefore(maxPeriod)) {
            listItem.push({thisPeriod: thisPeriod.toDate()});
            thisPeriod = thisPeriod.add( numberOfDate, 'days');
        }

        return listItem;
    }

    function getIndexOfPeriod (date: dayjs.Dayjs = dayjs(referencePeriod)): number {
        return Math.floor((date.diff(minPeriod, 'days', true)+1) / numberOfDate);
    }

    function scroll( _arg: dayjs.Dayjs | number | Date | string, force : boolean = false ) : void {
        if (!flatListRef.current) {
            onScroll( false, {left: true, right: true});
            return;
        }

        const newPeriod = (typeof _arg === 'number') 
                            ? dayjs(currentPeriod).add(_arg * numberOfDate, 'days')
                            : dayjs(_arg);

        let scrollDirection : ScrollType = {left: true, right: true};
        newPeriod.isSameOrBefore(minPeriod, 'days') && (scrollDirection.left = false);
        newPeriod.isSameOrAfter(maxPeriod, 'days') && (scrollDirection.right = false);
        if (newPeriod.isBefore(minPeriod, 'days') || newPeriod.isAfter(maxPeriod, 'days')) {
            onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToIndex({
            index: getIndexOfPeriod(newPeriod),
            animated: true,
        });

        setCurrentPeriod( newPeriod.toDate());
        onScroll( true, scrollDirection, newPeriod.toDate() );
    }

    React.useEffect(() => {
        scroll(selectedDate);
        setCurrentPeriod(selectedDate);
    }, [selectedDate]);

    React.useEffect(() => {
        expandCalendarProgress.value = Anim.spring<number>(height).base.slow;
    }, [height]);

    return (
        <View style={{width}}>
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
        </View>
    )
});
export default TimelineList;