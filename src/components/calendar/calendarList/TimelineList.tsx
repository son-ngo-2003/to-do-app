import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
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
import { useCalendarPages} from "../hooks";

//constants
import { CALENDAR_BODY_HEIGHT, TIMELINE_TIME_BAR_WIDTH } from '../constants';

//contexts
import {SyncedScrollViewContext, syncedScrollViewState} from '../../../contexts/SyncedScrollViewContext';

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
    numberOfDays = 7,
    showWeekends = true, //Only apply for week timeline (numberOfDays = 7)

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

    const flatListRef = useRef<FlatList<DataItemType>>(null);

    const referenceOfPeriod = useMemo<dayjs.Dayjs>( () => numberOfDays === 7
                                                                    ? dayjs(initialDate).startOf("isoWeek")
                                                                    : dayjs(initialDate)
                                                        ,[initialDate, numberOfDays] ); //references for every start of period
    
    const {
        getPeriod,
        pagesRef,
        // pagesLength,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    } = useCalendarPages({minDate: minPeriod, maxDate: maxPeriod, typePage: 'period', numberOfDays, referenceOfPeriod});

    const [ currentPeriod, setCurrentPeriod ] = useState<string>( referenceOfPeriod.format() );
    //TODO: check initialDate is between minPeriod and maxPeriod? also with calendar
    const [ selectedDate, setSelectedDate ] = useState<string>( dayjs(initialDate).format() );

    const widthTimeline = useMemo<number>(() => width - TIMELINE_TIME_BAR_WIDTH, [width]);

    // * --------------------------------------------- Functionality part --------------------------------------------------

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll
    }), [ selectedDate, currentPeriod, currentPeriod ]);

    const _onPressDate = useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate && onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, [onPressDate, setSelectedDate]);
    
    
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

        const newPeriod = (typeof _arg === 'number')
                            ? dayjs(currentPeriod).add(_arg * numberOfDays, 'days')
                            : dayjs(_arg);

        let scrollDirection : ScrollType = getScrollStatus(newPeriod);
        if ( isOutOfRange(newPeriod) !== 'none' ) {
            onScroll && onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToOffset({animated: true, offset: widthTimeline * getIndexOfPage(newPeriod)});
        setCurrentPeriod( newPeriod.format());
        onScroll && onScroll( true, scrollDirection, newPeriod.toDate() );
    }, [flatListRef.current, onScroll, currentPeriod, numberOfDays, getScrollStatus, isOutOfRange, widthTimeline, getIndexOfPage, setCurrentPeriod]);


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
            scroll( getPeriod(selectedDate) );
        }
    }, [selectedDate]);


    // * --------------------------------------------- UI Part --------------------------------------------------
    const expandCalendarProgress = useSharedValue<number>(height);

    const  renderItem  = useCallback<ListRenderItem<DataItemType>>(({ item }) => {
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
                    selectedDate={ (diffWithStartDate >= 0 && diffWithStartDate < numberOfDays) ? selectedDate : undefined}

                    taskList={taskList}

                    onPressCell={ onPressCell }
                    onPressDate={ _onPressDate }
                    onPressTask={ onPressTask }

                    height={height}
                    width={widthTimeline}

                    numberOfDays={numberOfDays}
                    showWeekends={showWeekends}
                ></Timeline>
            </Animated.View>
        )
    },[selectedDate, height, taskList, numberOfDays, onPressCell, onPressTask, expandCalendarProgress, _onPressDate, showWeekends, widthTimeline]);

    const getDataList = useCallback<() => DataItemType[]>( ()=> {
        return pagesRef.current.map( thisPeriod => ({ thisPeriod }) );
    }, [pagesRef.current]);

    useEffect(() => {
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
                        getItemLayout={(_, index) => ({length: widthTimeline, offset: widthTimeline, index})}
                        initialScrollIndex={ getIndexOfPage( currentPeriod ) }
                    />
                </View>
            </View>
        </SyncedScrollViewContext.Provider>
    )
});
export default TimelineList;