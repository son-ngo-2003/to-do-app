import * as React from 'react';
import dayjs from 'dayjs';
import { StyleSheet, ListRenderItem, FlatList, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import Calendar, { CalendarProps, type RangeSelectedDateType } from '../calendar/Calendar';
import { Layouts, Animations as Anim } from '../../../styles';
import { type ScrollType, type CalenderListRef } from '../type';

//constants
import { CALENDAR_BODY_HEIGHT, CALENDAR_BODY_ONE_WEEK_HEIGHT } from '../constants';

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

const CalendarList = React.forwardRef<CalenderListRef, CalendarListProps>(({
    initialDate,
    markedDate,
    
    isSelectRange,
    onPressDate = () => {},
    onPressRangeDate = () => {},
    onScroll = () => {},
    
    showOneWeek = false,
    
    minMonth,
    maxMonth,
    width = Layouts.screen.width,

}, ref) => {
    const flatListRef = React.useRef<FlatList<DataItemType>>(null);

    const [ currentMonth, setCurrentMonth ] = React.useState<string>( dayjs(initialDate).format() );
    const [ selectedDate, setSelectedDate ] = React.useState<string>( currentMonth );
    const [ rangeSelectedDate, setRangeSelectedDate ] = React.useState<RangeSelectedDateType>({start: undefined, end: undefined});
    
    const expandCalendarProgress = useSharedValue<number>(showOneWeek ? 0 : 1);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll,
    }), [selectedDate, rangeSelectedDate]);

    const isMonthContainedInRange = React.useCallback< (thisMonth: dayjs.Dayjs) => boolean>((thisMonth) => {
        if (!rangeSelectedDate.end && 
            (thisMonth.isSame(currentMonth, 'month') || thisMonth.isSame(rangeSelectedDate.start, 'month') )) 
                return true; //cause we don't know the end of range so we accept the end is infinity until it is selected
        return thisMonth.isBetween(rangeSelectedDate.start, rangeSelectedDate.end, 'month', '[]');
    },[rangeSelectedDate]);

    const calendarContainerAnimation = useAnimatedStyle(() => {
        return {
            height: interpolate(expandCalendarProgress.value, [0, 1], 
                [CALENDAR_BODY_HEIGHT + 5 , CALENDAR_BODY_ONE_WEEK_HEIGHT + 5]), //+5 for spring effect
        }
    }, []);

    const _onPressDate = React.useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, []);

    const _onPressRangeDate = React.useCallback< (dateRange: RangeSelectedDateType) => void > ( (dateRange) => {
        setRangeSelectedDate(dateRange);
        onPressRangeDate(dateRange);
    }, []);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisMonth } = item;
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
    },[selectedDate, rangeSelectedDate, showOneWeek, isSelectRange, markedDate]);

    function getDataList () : DataItemType[] {
        const listItem : DataItemType[] = []

        let thisMonth = dayjs(minMonth);
        while (thisMonth.isBefore(maxMonth)) {
            listItem.push({ thisMonth });
            thisMonth = thisMonth.add( 1 , 'months');
        }

        return listItem;
    }

    function getIndexOfMonth (month: dayjs.Dayjs = dayjs(selectedDate)): number {
        return Math.floor(month.diff(minMonth, 'months'));
    }

    function getScrollStatus( month: dayjs.Dayjs = dayjs(selectedDate) ) {
        const scrollStatus : ScrollType = {left: false, right: false};
        scrollStatus.left = month.isSameOrBefore(minMonth, 'months');
        scrollStatus.right = month.isSameOrAfter(maxMonth, 'months');
        return scrollStatus;
    }

    function scroll( _arg: dayjs.Dayjs | number | Date | string, force : boolean = false ) : void {
        if (!flatListRef.current) {
            onScroll( false, {left: false, right: false});
            return;
        }

        if (!force && showOneWeek) { //avoid scroll when show 1 week
            onScroll( false, {left: false, right: false}); 
            return;
        }         
        
        const newMonth = (typeof _arg === 'number') 
                            ? dayjs(currentMonth).add(_arg, 'months')
                            : dayjs(_arg);

        let scrollDirection : ScrollType = getScrollStatus(newMonth);      
        if (newMonth.isBefore(minMonth, 'months') || newMonth.isAfter(maxMonth, 'months')) {
            onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToIndex({
            index: getIndexOfMonth(newMonth),
            animated: true,
        });

        setCurrentMonth(newMonth.format());
        onScroll( true, scrollDirection, newMonth.toDate() );
    }

    function onScrollManuel (e: NativeSyntheticEvent<NativeScrollEvent>) {
        const ne = e.nativeEvent;
        if (ne.contentOffset.x % width !== 0) return;
        const newMonth = dayjs(minMonth).add( ne.contentOffset.x / width, 'months');
        setCurrentMonth(newMonth.format());

        let scrollDirection : ScrollType = getScrollStatus(newMonth);   
        onScroll( true, scrollDirection, newMonth.toDate() );
    }

    React.useEffect(() => {
        if (! dayjs(selectedDate) .isSame(currentMonth, 'months')) {
            scroll(selectedDate);
            setCurrentMonth( selectedDate );
        }
    }, [selectedDate]);

    React.useEffect(() => {
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
                getItemLayout={(data, index) => ({length: width, offset: width * index, index})}
                initialScrollIndex={getIndexOfMonth()}
            />
         </View>
    )
});
export default React.memo(CalendarList);