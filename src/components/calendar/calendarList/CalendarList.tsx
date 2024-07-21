import React, { useCallback, useRef, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ListRenderItem, FlatList, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import Calendar, { CalendarProps, type RangeSelectedDateType } from '../calendar/Calendar';
import { Layouts, Animations as Anim } from '../../../styles';
import { type ScrollType, type CalenderListRef } from '../type';
import { useCalendarPages} from "../hooks";

//constants
import { CALENDAR_BODY_HEIGHT, CALENDAR_BODY_ONE_WEEK_HEIGHT } from '../constants';
// import { useTraceUpdate } from '../../../hooks';

export type CalendarListProps = {
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newMonth?: Date  ) => void,
    minMonth?: dayjs.Dayjs | string | Date,
    maxMonth?: dayjs.Dayjs | string | Date,
    width?: number,
    initialDate?: string | Date | dayjs.Dayjs,
} & CalendarProps;

type DataItemType = {
    thisMonth: dayjs.Dayjs,
}

const CalendarList = React.forwardRef<CalenderListRef, CalendarListProps>((props, ref) => {
    const {
        initialDate,
        markedDate,
        
        isSelectRange,
        onPressDate,
        onPressRangeDate,
        onScroll,
        
        showOneWeek = false,
        
        minMonth,
        maxMonth,
        width = Layouts.screen.width,
    
    } = props;

    //useTraceUpdate(props);
    const flatListRef = useRef<FlatList<DataItemType>>(null);

    const [ currentMonth, setCurrentMonth ] = useState<string>( dayjs(initialDate).format() );
    const [ selectedDate, setSelectedDate ] = useState<string>( currentMonth );
    const [ rangeSelectedDate, setRangeSelectedDate ] = useState<RangeSelectedDateType>({start: undefined, end: undefined});

    const {
        pagesRef,
        // pagesLength,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    } = useCalendarPages({minDate: minMonth, maxDate: maxMonth, typePage: 'month'} );

    const expandCalendarProgress = useSharedValue<number>(showOneWeek ? 0 : 1);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll,
    }), [selectedDate, rangeSelectedDate, currentMonth]);

    const isMonthContainedInRange = useCallback< (thisMonth: dayjs.Dayjs) => boolean>((thisMonth) => {
        if (!rangeSelectedDate.end && 
            (thisMonth.isSame(currentMonth, 'month') || thisMonth.isSame(rangeSelectedDate.start, 'month') )) 
                return true; //because we don't know the end of range, so we accept the end is infinity until it is selected
        return thisMonth.isBetween(rangeSelectedDate.start, rangeSelectedDate.end, 'month', '[]');
    },[rangeSelectedDate.end, currentMonth, rangeSelectedDate.start]);

    const calendarContainerAnimation = useAnimatedStyle(() => {
        return {
            height: interpolate(expandCalendarProgress.value, [0, 1], 
                [CALENDAR_BODY_HEIGHT + 5 , CALENDAR_BODY_ONE_WEEK_HEIGHT + 5]), //+5 for spring effect
        }
    }, []);

    const _onPressDate = useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate && onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, [onPressDate, setSelectedDate]);

    const _onPressRangeDate = useCallback< (dateRange: RangeSelectedDateType) => void > ( (dateRange) => {
        setRangeSelectedDate(dateRange);
        onPressRangeDate && onPressRangeDate(dateRange);
    }, [setRangeSelectedDate, onPressRangeDate]);

    const  renderItem  = useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const {  thisMonth } = item;
        const selectedDateInMonth = thisMonth.isSame( selectedDate, 'month' );

        const calendarProps : CalendarProps = {
            isSelectRange :         isSelectRange,

            selectedDate:           selectedDateInMonth ? selectedDate : undefined,
            onPressDate:            _onPressDate,

            rangeSelectedDate:      isSelectRange && isMonthContainedInRange(thisMonth) ? rangeSelectedDate : undefined,
            onPressRangeDate:       _onPressRangeDate,

            thisMonth:              thisMonth.month(),
            thisYear:               thisMonth.year(),

            markedDate:             markedDate,
            showMonthHeader:        false,
            showOneWeek:            selectedDateInMonth && showOneWeek,
        }

        return (
            <Animated.View style={[{width: width, overflow: 'hidden'}, calendarContainerAnimation]}>
                <Calendar {...calendarProps}/>
            </Animated.View>
        )
    },[selectedDate, rangeSelectedDate, showOneWeek, isSelectRange, markedDate, _onPressDate, isMonthContainedInRange, _onPressRangeDate, width, calendarContainerAnimation]);

    const getDataList = useCallback( () : DataItemType[] => {
        return pagesRef.current.map((thisMonth) => ({thisMonth}));
    }, [pagesRef.current]);

    const getScrollStatus = useCallback( ( month: dayjs.Dayjs = dayjs(selectedDate) ) => {
        const isOnEdge = isOnEdgePages(month);
        return isOnEdge !== 'none' ? {left: isOnEdge !== 'left', right: isOnEdge !== 'right'} :
               isOutOfRange(month) === 'none' ? {left: true, right: true} : {left: false, right: false};
    }, [selectedDate, isOnEdgePages, isOutOfRange]);

    const scroll = useCallback( ( _arg: dayjs.Dayjs | number | Date | string, force : boolean = false ) : void => {
        if (!flatListRef.current) {
            onScroll && onScroll( false, {left: false, right: false});
            return;
        }

        if (!force && showOneWeek) { //avoid scroll when show 1 week
            onScroll && onScroll( false, {left: false, right: false}); 
            return;
        }         
        
        const newMonth = (typeof _arg === 'number') 
                            ? dayjs(currentMonth).add(_arg, 'months')
                            : dayjs(_arg);

        let scrollDirection : ScrollType = getScrollStatus(newMonth);      
        if ( isOutOfRange(newMonth) !== 'none' ) {
            onScroll && onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToOffset({animated: true, offset: width * getIndexOfPage(newMonth)});
        setCurrentMonth(newMonth.format());
        onScroll && onScroll( true, scrollDirection, newMonth.toDate() );
    }, [onScroll, showOneWeek, currentMonth, isOutOfRange, width, getIndexOfPage, getScrollStatus]);

    const onScrollManuel = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const ne = e.nativeEvent;
        if (ne.contentOffset.x % width !== 0) return;
        const newMonth = dayjs(minMonth).add( ne.contentOffset.x / width, 'months');
        setCurrentMonth(newMonth.format());

        let scrollDirection : ScrollType = getScrollStatus(newMonth);   
        onScroll &&  onScroll( true, scrollDirection, newMonth.toDate() );
    }, [width, minMonth, onScroll, getScrollStatus]);

    useEffect(() => {
        if (! dayjs(selectedDate) .isSame(currentMonth, 'months')) {
            scroll(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        isSelectRange
            ? scroll(rangeSelectedDate.start || 0, true)
            : scroll(selectedDate, true);
        if (showOneWeek) {
            expandCalendarProgress.value = Anim.spring<number>(1).base.slow;
        } else {
            expandCalendarProgress.value = Anim.spring<number>(0).base.slow;
        }
    }, [showOneWeek]);

    return (
        <View style={{width}}>
            <FlatList
                ref={flatListRef}
                data={getDataList()}
                renderItem={renderItem}
                scrollEnabled={!showOneWeek}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll = {onScrollManuel}
                pagingEnabled={true}
                getItemLayout={(_, index) => ({length: width, offset: width * index, index})}
                initialScrollIndex={getIndexOfPage()}
            />
         </View>
    )
});
export default React.memo(CalendarList);