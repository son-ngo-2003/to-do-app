import * as React from 'react';
import dayjs from 'dayjs';
import { ListRenderItem, FlatList, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import { Layouts, Animations as Anim } from '../../../styles';
import Timeline, { type TimelineProps } from '../timeline/Timeline';
import { type ScrollType, type CalenderListRef } from '../type';
import { CALENDAR_BODY_HEIGHT } from '../constants';

type TimelineListProps = {
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date ) => void,
    minPeriod?: dayjs.Dayjs | string | Date, 
    maxPeriod?: dayjs.Dayjs | string | Date,
    width?: number,
    initialDate?: string | Date | dayjs.Dayjs,
} & TimelineProps;

type DataItemType = {
    thisPeriod: dayjs.Dayjs,
}

const TimelineList = React.forwardRef<CalenderListRef, TimelineListProps>(({
    initialDate,
    numberOfDate = 7,
    showWeekends = true, //Only apply for week timeline (numberOfDate = 7)

    taskList,

    minPeriod, 
    maxPeriod,
    
    onPressDate,
    onPressCell,
    onPressTask,
    onScroll,

    height = CALENDAR_BODY_HEIGHT,
    width = Layouts.screen.width,

}, ref) => {

    const flatListRef = React.useRef<FlatList<DataItemType>>(null);
    const referenceOfPeriod = React.useMemo<dayjs.Dayjs>( () => numberOfDate === 7
                                                                    ? dayjs(initialDate).startOf("isoWeek")
                                                                     : dayjs(initialDate)
                                                        , [initialDate] ); //references for every start of period
    
    const getPeriod = React.useCallback<( date?: dayjs.Dayjs | string | Date ) => dayjs.Dayjs> ((date) => {
        //TODO: test this function
        let deltaPeriod = Math.floor( dayjs(date).diff(referenceOfPeriod, 'days', true) / numberOfDate );
        return referenceOfPeriod.add( deltaPeriod * numberOfDate, 'days');
    }, [initialDate]);

    const minPeriodReal = React.useMemo<dayjs.Dayjs>( () => getPeriod(minPeriod), [minPeriod] )
    const maxPeriodReal = React.useMemo<dayjs.Dayjs>( () => getPeriod(maxPeriod), [maxPeriod] )

    const [ currentPeriod, setCurrentPeriod ] = React.useState<string>( referenceOfPeriod.format() );
    //TODO: check initialDate is between minPeriod and maxPeriod? also with calendar
    const [ selectedDate, setSelectedDate ] = React.useState<string>( currentPeriod );

    const expandCalendarProgress = useSharedValue<number>(height);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll
    }), [ selectedDate, currentPeriod ]);

    const _onPressDate = React.useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate && onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, [onPressDate]);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisPeriod } = item;
        const diffWithStartDate = dayjs(selectedDate).diff(thisPeriod, 'day');

        return (
            <Animated.View 
                style={[{width: width,
                    height: expandCalendarProgress,
                }]}
            >
                <Timeline
                    startDate={ thisPeriod.format() }
                    selectedDate={ (diffWithStartDate >= 0 && diffWithStartDate < numberOfDate) ? selectedDate : undefined}

                    taskList={taskList}

                    onPressCell={onPressCell}
                    onPressDate={_onPressDate}
                    onPressTask={onPressTask}

                    height={height}
                    numberOfDate={numberOfDate}
                    showWeekends={showWeekends}
                ></Timeline>
            </Animated.View>
        )
    },[selectedDate, currentPeriod, height, taskList, width, numberOfDate, onPressCell, onPressDate, onPressTask]);

    const getDataList = React.useCallback<() => DataItemType[]>( ()=> {
        const listItem : DataItemType[] = [];

        let thisPeriod = dayjs(minPeriod);
        while (thisPeriod.isBefore(maxPeriod)) {
            listItem.push({thisPeriod});
            thisPeriod = thisPeriod.add( numberOfDate, 'days');
        }

        return listItem;
    }, [minPeriod, maxPeriod, numberOfDate]);

    function getIndexOfPeriod (date: dayjs.Dayjs = dayjs(selectedDate)): number {
        return Math.floor((date.diff(minPeriodReal, 'days', true)+1) / numberOfDate);
    }

    function getScrollStatus( period: dayjs.Dayjs = dayjs(selectedDate) ) {
        const scrollStatus : ScrollType = {left: false, right: false};
        scrollStatus.left = period.isAfter( minPeriod, 'months');
        scrollStatus.right = period.isBefore( maxPeriod, 'months');
        return scrollStatus;
    }

    function scroll( _arg: dayjs.Dayjs | number | Date | string, force : boolean = false ) : void {
        if (!flatListRef.current) {
            onScroll && onScroll( false, {left: true, right: true});
            return;
        }

        const newPeriod = (typeof _arg === 'number') 
                            ? dayjs(currentPeriod).add(_arg * numberOfDate, 'days')
                            : dayjs(_arg);

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);
        if (newPeriod.isBefore(minPeriod, 'days') || newPeriod.isAfter(maxPeriod, 'days')) {
            onScroll && onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToIndex({
            index: getIndexOfPeriod(newPeriod),
            animated: true,
        });

        setCurrentPeriod( newPeriod.format());
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }

    function onScrollManuel (e: NativeSyntheticEvent<NativeScrollEvent>) {
        const ne = e.nativeEvent;
        if (ne.contentOffset.x % width !== 0) return;
        const newPeriod = dayjs(minPeriod).add( ne.contentOffset.x / width * numberOfDate, 'days');
        setCurrentPeriod(newPeriod.format());

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);   
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }

    React.useEffect(() => {
        let diff = dayjs(selectedDate).diff(currentPeriod, 'date') / numberOfDate;
        if ( ! ( 0 < diff && diff < 1 )  ) {
            scroll( getPeriod(selectedDate) );
        }
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
                onScroll={onScrollManuel}
                pagingEnabled={true}
                getItemLayout={(data, index) => ({length: width, offset: width * index, index})}
                initialScrollIndex={getIndexOfPeriod()}
            />
        </View>
    )
});
export default TimelineList;