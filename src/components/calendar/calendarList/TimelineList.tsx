import * as React from 'react';
import dayjs from 'dayjs';
import { View, FlatList,
        type NativeSyntheticEvent, type NativeScrollEvent, type ListRenderItem,
} from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

//components
import {Layouts, Animations as Anim} from '../../../styles';
import Timeline, { type TimelineProps } from '../timeline/Timeline';
import TimelineTimebar from "../timeline/TimelineTimebar";
import { type ScrollType, type CalenderListRef } from '../type';

//contexts
import {SyncedScrollViewContext, syncedScrollViewState} from "../../../contexts/SyncedScrollViewContext";

//constants
import { CALENDAR_BODY_HEIGHT, TIMELINE_TIME_BAR_WIDTH } from '../constants';


type TimelineListProps = {
    //TODO: not using & TimelineProps, declare the props clearly. For example: startDate : Timeline['start]
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
    // * ------------------------------------------------ Variables ------------------------------------------------------

    const flatListRef = React.useRef<FlatList<DataItemType>>(null);

    const referenceOfPeriod = React.useMemo<dayjs.Dayjs>( () => numberOfDate === 7
                                                                    ? dayjs(initialDate).startOf("isoWeek")
                                                                     : dayjs(initialDate)
                                                        , [initialDate, numberOfDate] ); //references for every start of period
    
    const getPeriod = React.useCallback<( date?: dayjs.Dayjs | string | Date ) => dayjs.Dayjs> ((date) => {
        //TODO: test this function
        let deltaPeriod = Math.floor( dayjs(date).diff(referenceOfPeriod, 'days', true) / numberOfDate );
        return referenceOfPeriod.add( deltaPeriod * numberOfDate, 'days');
    }, [referenceOfPeriod, numberOfDate]);

    const minPeriodReal = React.useMemo<dayjs.Dayjs>( () => getPeriod(minPeriod), [minPeriod, getPeriod] )
    const maxPeriodReal = React.useMemo<dayjs.Dayjs>( () => getPeriod(maxPeriod), [maxPeriod, getPeriod] )

    const [ currentPeriod, setCurrentPeriod ] = React.useState<string>( referenceOfPeriod.format() );
    //TODO: check initialDate is between minPeriod and maxPeriod? also with calendar
    const [ selectedDate, setSelectedDate ] = React.useState<string>( dayjs(initialDate).format() );
    const [ timelineVerticalOffset, setTimelineVerticalOffset ] = React.useState<number>(0); //TODO: set initial position here

    // * --------------------------------------------- Functionality part --------------------------------------------------

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll
    }), [ selectedDate, currentPeriod, currentPeriod ]);

    const _onPressDate = React.useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate && onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, [onPressDate, setSelectedDate]);

    function getIndexOfPeriod (date: dayjs.Dayjs = dayjs(selectedDate)): number {
        return Math.floor((date.diff(minPeriodReal, 'days', true)+1) / numberOfDate);
    }

    function getScrollStatus( period: dayjs.Dayjs = dayjs(selectedDate) ) {
        const scrollStatus : ScrollType = {left: false, right: false};
        scrollStatus.left = period.isAfter( minPeriodReal.add(numberOfDate, 'days'), 'day' );
        scrollStatus.right = period.isBefore( maxPeriodReal);
        return scrollStatus;
    }

    function scroll( _arg: dayjs.Dayjs | number | Date | string ) : void {
        if (!flatListRef.current) {
            onScroll && onScroll( false, {left: true, right: true});
            return;
        }

        const newPeriod = (typeof _arg === 'number')
                            ? dayjs(currentPeriod).add(_arg * numberOfDate, 'days')
                            : dayjs(_arg);

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);
        if (newPeriod.isBefore(minPeriodReal, 'days') || newPeriod.isAfter(maxPeriod, 'days')) {
            onScroll && onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToOffset({animated: true, offset: widthTimeline * getIndexOfPeriod(newPeriod)});
        setCurrentPeriod( newPeriod.format());
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }

    function onScrollManuel (e: NativeSyntheticEvent<NativeScrollEvent>) {
        const ne = e.nativeEvent;
        if (ne.contentOffset.x % widthTimeline !== 0) return;
        const newPeriod = minPeriodReal.add( ne.contentOffset.x / widthTimeline * numberOfDate, 'days');
        setCurrentPeriod(newPeriod.format());

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }

    // const onScrollVertical = React.useCallback( (offset: number) => {
    //     setTimelineVerticalOffset(offset);
    // },[])

    React.useEffect(() => {
        let diff = dayjs(selectedDate).diff(currentPeriod, 'date') / numberOfDate;
        if ( ! ( 0 < diff && diff < 1 )  ) {
            scroll( getPeriod(selectedDate) );
        }
    }, [selectedDate]);


    // * --------------------------------------------- UI Part --------------------------------------------------

    const widthTimeline = React.useMemo<number>(() => width - TIMELINE_TIME_BAR_WIDTH, [width]);
    const expandCalendarProgress = useSharedValue<number>(height);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisPeriod } = item;
        const diffWithStartDate = dayjs(selectedDate).diff(thisPeriod, 'day');

        return (
            <Animated.View 
                style={[{width: widthTimeline,
                    height: expandCalendarProgress,
                }]}
            >
                <Timeline
                    startDate={ thisPeriod.format() }
                    selectedDate={ (diffWithStartDate >= 0 && diffWithStartDate < numberOfDate) ? selectedDate : undefined}

                    taskList={taskList}

                    onPressCell={ onPressCell }
                    onPressDate={ _onPressDate }
                    onPressTask={ onPressTask }

                    height={height}
                    width={widthTimeline}

                    numberOfDate={numberOfDate}
                    showWeekends={showWeekends}
                ></Timeline>
            </Animated.View>
        )
    },[selectedDate, height, taskList, numberOfDate, onPressCell, onPressTask, expandCalendarProgress, _onPressDate, showWeekends, widthTimeline]);

    const getDataList = React.useCallback<() => DataItemType[]>( ()=> {
        const listItem : DataItemType[] = [];

        let thisPeriod = minPeriodReal;
        while (thisPeriod.isBefore(maxPeriodReal)) {
            listItem.push({thisPeriod});
            thisPeriod = thisPeriod.add( numberOfDate, 'days');
        }

        return listItem;
    }, [numberOfDate, minPeriodReal, maxPeriodReal]);

    React.useEffect(() => {
        expandCalendarProgress.value = Anim.spring<number>(height).base.slow;
    }, [height]);

    return (
        <SyncedScrollViewContext.Provider value={syncedScrollViewState}>
            <View style={{width, flexDirection: 'row'}}>
                <TimelineTimebar
                    height={height}
                    headerHeight={64}
                />

                <View style={{width: widthTimeline}}>
                    <FlatList
                        ref={flatListRef}
                        data={getDataList()}
                        renderItem={renderItem}
                        //scrollEnabled={!showOneWeek}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScrollManuel}

                        pagingEnabled={true}
                        getItemLayout={(data, index) => ({length: widthTimeline, offset: widthTimeline, index})}
                        initialScrollIndex={getIndexOfPeriod( dayjs(currentPeriod) )}
                    />
                </View>
            </View>
        </SyncedScrollViewContext.Provider>
    )
});
export default TimelineList;