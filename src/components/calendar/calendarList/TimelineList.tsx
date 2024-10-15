import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import dayjs from 'dayjs';
import {
    View, FlatList, ScrollView,
    type NativeSyntheticEvent, type NativeScrollEvent, type ListRenderItem,
} from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

//components
import {Layouts, Animations as Anim} from '../../../styles';
import Timeline, { type TimelineProps } from '../timeline/Timeline';
import TimelineTimebar from "../timeline/TimelineTimebar";
import { type ScrollType, type CalenderListRef } from '../type';
import { useCalendarPages} from "../hooks";

//constants
import {
    CALENDAR_BODY_HEIGHT,
    TIMELINE_CELL_HEIGHT, TIMELINE_HEIGHT,
    TIMELINE_TIME_BAR_WIDTH
} from '../constants';

//contexts
import {SyncedScrollViewContext, syncedScrollViewState} from '../../../contexts/SyncedScrollViewContext';
import {useTraceUpdate} from "../../../hooks";

export interface TimelineListProps {
    initialDate?: string | Date | dayjs.Dayjs,
    numberOfDays?: TimelineProps['numberOfDays'],
    showWeekends?: TimelineProps['showWeekends'], //Only apply for week timeline (numberOfDays = 7)

    taskList?: TimelineProps['taskList'],
    minPeriod?: dayjs.Dayjs | string | Date,
    maxPeriod?: dayjs.Dayjs | string | Date,

    onPressDate?: TimelineProps['onPressDate'],
    onPressCell?: TimelineProps['onPressCell'],
    onPressTask?: TimelineProps['onPressTask'],
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date ) => void,

    height?: TimelineProps['height'],
    width?: number,
    dateNameType?: TimelineProps['dateNameType'],
}

type DataItemType = dayjs.Dayjs;

const TimelineList = React.forwardRef<CalenderListRef, TimelineListProps>((
    props,
    ref
) => {
    const {
        initialDate,
        numberOfDays = 7,
        showWeekends = true,

        taskList,

        minPeriod,
        maxPeriod,

        onPressDate,
        onPressCell,
        onPressTask,

        onScroll,

        height = CALENDAR_BODY_HEIGHT,
        width = Layouts.screen.width,
        dateNameType,
    } = props;

    useTraceUpdate(props);

    // * ------------------------------------------------ Variables ------------------------------------------------------

    const flatListRef = useRef<FlatList<DataItemType>>(null);
    const timelineRef : React.MutableRefObject<any> = useRef<ScrollView>(null);

    const initialDayjs = useMemo( () => dayjs(initialDate).isBetween(minPeriod, maxPeriod) ? dayjs(initialDate) : dayjs(minPeriod), [initialDate, minPeriod, maxPeriod] );

    const referenceOfPeriod = useMemo<dayjs.Dayjs>( () => numberOfDays === 7
                                                                    ? initialDayjs.startOf("isoWeek")
                                                                    : initialDayjs.startOf('date')
                                                        ,[initialDayjs, numberOfDays] ); //references for every start of period
    //TODO: bring initialDayjs and referenceOfPeriod also in useCalendarPages
    const {
        getPeriod,
        pagesRef,
        // pagesLength,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    } = useCalendarPages({minDate: minPeriod, maxDate: maxPeriod, typePage: 'period', numberOfDays, referenceOfPeriod});

    const [ currentPeriod, setCurrentPeriod ] = useState<string>( referenceOfPeriod.format() );
    const [ selectedDate, setSelectedDate ] = useState<string>( initialDayjs.format() );

    const widthTimeline = useMemo<number>(() => width - TIMELINE_TIME_BAR_WIDTH, [width]);
    const initialOffset = useMemo<number>(() => {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        return (currentHour + currentMinute / 60) * TIMELINE_CELL_HEIGHT;
    }, []);

    // * --------------------------------------------- Functionality part --------------------------------------------------

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll,
        currentPeriod,
        onChangeSelectedDate,
    }), [ selectedDate, currentPeriod, currentPeriod ]);

    const onChangeSelectedDate = useCallback( (_date : Date, dateString : string) : void => {
        setSelectedDate(dateString);
    }, [setSelectedDate]);

    const _onPressDate = useCallback( (date: Date, dateString: string) : void => {
        onPressDate && onPressDate(date, dateString);
        onChangeSelectedDate(date, dateString);
    }, [onPressDate, onChangeSelectedDate]);
    
    
    const getScrollStatus = useCallback(( period: dayjs.Dayjs = dayjs(selectedDate) ) => {
        const isOnEdge = isOnEdgePages(period);
        return isOnEdge !== 'none' ? {left: isOnEdge !== 'left', right: isOnEdge !== 'right'} :
            isOutOfRange(period) === 'none' ? {left: true, right: true} : {left: false, right: false};
    }, [selectedDate, isOnEdgePages, isOutOfRange]);

    
    const scroll = useCallback( ( _arg: dayjs.Dayjs | number | Date | string ) : void => {
        if (!flatListRef.current) {
            onScroll && onScroll( false, {left: true, right: true});
            return;
        }

        const newPeriod = getPeriod ( (typeof _arg === 'number')
                            ? dayjs(currentPeriod).add(_arg * numberOfDays, 'days')
                            : dayjs(_arg) );

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);
        if ( isOutOfRange(newPeriod) !== 'none' ) {
            onScroll && onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToOffset({animated: true, offset: widthTimeline * getIndexOfPage(newPeriod)});
        setCurrentPeriod( newPeriod.format());
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }, [flatListRef.current, onScroll, currentPeriod, numberOfDays, getScrollStatus, isOutOfRange, widthTimeline, getIndexOfPage, setCurrentPeriod, getPeriod]);


    function onScrollManuel (e: NativeSyntheticEvent<NativeScrollEvent>) {
        const ne = e.nativeEvent;
        if (ne.contentOffset.x % widthTimeline !== 0) return;
        const newPeriod = pagesRef.current[ ne.contentOffset.x / widthTimeline ];
        setCurrentPeriod(newPeriod.format());

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }

    useEffect(() => {
        let diff = dayjs(selectedDate).diff(currentPeriod, 'date') / numberOfDays;
        if ( ! ( 0 < diff && diff < 1 )  ) {
            scroll( selectedDate );
        }
    }, [selectedDate]);


    // * --------------------------------------------- UI Part --------------------------------------------------
    const heightNumber = React.useMemo( () => {
        return (typeof height === "number") ? height : TIMELINE_HEIGHT[height];
    } , [height] );

    const expandCalendarProgress = useSharedValue<number>(heightNumber);

    const  renderItem  = useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const thisPeriod  = item;
        const diffWithStartDate = dayjs(selectedDate).diff(thisPeriod, 'day');

        return (
            <Timeline
                ref={ timelineRef }
                startDate={ thisPeriod.format() }
                selectedDate={ (diffWithStartDate >= 0 && diffWithStartDate < numberOfDays) ? selectedDate : undefined}

                taskList={taskList}

                onPressCell={ onPressCell }
                onPressDate={ _onPressDate }
                onPressTask={ onPressTask }

                height={height}
                width={widthTimeline}
                initialOffset={ initialOffset }

                numberOfDays={numberOfDays}
                showWeekends={showWeekends}
                dateNameType={dateNameType}
            ></Timeline>
        )
    },[selectedDate, height, taskList, numberOfDays, onPressCell, onPressTask, _onPressDate, showWeekends, widthTimeline, initialOffset, dateNameType]);

    useEffect(() => {
        expandCalendarProgress.value = Anim.spring<number>(heightNumber).base.slow;
    }, [height]);

    return (
        <SyncedScrollViewContext.Provider value={syncedScrollViewState}>
            <Animated.View style={[{width, flexDirection: 'row',
                                    height: expandCalendarProgress
            } ]}>
                <TimelineTimebar
                    height={heightNumber}
                    headerHeight={!taskList || taskList.length === 0 ? 54 : 64}
                />

                <View style={{width: widthTimeline}}>
                    <FlatList
                        ref={flatListRef}
                        // removeClippedSubviews

                        keyExtractor={(_, index) => index.toString()}
                        data={pagesRef.current}
                        renderItem={renderItem}
                        // initialNumToRender={4}

                        horizontal
                        showsHorizontalScrollIndicator={true}
                        onScroll={onScrollManuel}

                        pagingEnabled={true}
                        initialScrollIndex={ getIndexOfPage(selectedDate) }
                        getItemLayout={(_, index) => ({length: width - TIMELINE_TIME_BAR_WIDTH, offset: (width - TIMELINE_TIME_BAR_WIDTH) * index, index})}

                    />
                </View>
            </Animated.View>
        </SyncedScrollViewContext.Provider>
    )
});
export default React.memo(TimelineList);