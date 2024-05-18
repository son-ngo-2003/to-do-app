import * as React from 'react';
import moment from 'moment';
import { StyleSheet, ListRenderItem, FlatList } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import Calendar, { CalendarProps, type RangeSelectedDateType } from '../calendar/Calendar';
import { Layouts, Animations as Anim } from '../../../styles';
import { type ScrollType, type CalenderListRef } from '../type';

//constants
import { CALENDAR_BODY_HEIGHT, CALENDAR_BODY_ONE_WEEK_HEIGHT } from '../constants';

export type CalendarListProps = {
    onScroll: ( isSuccess: boolean, newCanScroll : ScrollType, newMonth?: moment.Moment  ) => void,
    minMonth?: moment.Moment | string | Date,
    maxMonth?: moment.Moment | string | Date,
    width?: number,
} & CalendarProps;

type DataItemType = {
    thisMonth: moment.Moment,
}

const CalendarList = React.forwardRef<CalenderListRef, CalendarListProps>(({
    initialDate,
    markedDate = [],
    
    isSelectRange,
    onPressDate,
    onPressRangeDate,
    onScroll,
    
    showOneWeek = false,
    
    minMonth,
    maxMonth,
    width = Layouts.screen.width,

}, ref) => {
    const flatListRef = React.useRef<FlatList<DataItemType>>(null);

    const referenceMonth = moment(initialDate);
    const [ currentMonth, setCurrentMonth ] = React.useState<moment.Moment>( referenceMonth );
    const monthMin = React.useMemo<moment.Moment>( () => moment(minMonth), [ minMonth ] );
    const monthMax = React.useMemo<moment.Moment>( () => moment(maxMonth), [ maxMonth ] );
    
    const [ selectedDate, setSelectedDate ] = React.useState<moment.Moment>( referenceMonth );
    const [ rangeSelectedDate, setRangeSelectedDate ] = React.useState<RangeSelectedDateType>({start: referenceMonth, end: referenceMonth});
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>( {left: true, right: true} );
    const expandCalendarProgress = useSharedValue<number>(showOneWeek ? 0 : 1);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: scroll,
    }), [selectedDate]);

    const isMonthContainedInRange = (thisMonth: moment.Moment): boolean => {
        if (!rangeSelectedDate.end && 
            (thisMonth.isSame(currentMonth, 'month') || thisMonth.isSame(rangeSelectedDate.start, 'month') )) 
                return true; //cause we don't know the end of range so we accept the end is infinity until it is selected
        return thisMonth.isBetween(rangeSelectedDate.start, rangeSelectedDate.end, 'month', '[]');
    }

    const calendarContainerAnimation = useAnimatedStyle(() => {
        return {
            height: interpolate(expandCalendarProgress.value, [0, 1], 
                [CALENDAR_BODY_HEIGHT + 5 , CALENDAR_BODY_ONE_WEEK_HEIGHT + 5]), //+5 for spring effect
        }
    }, []);

    const  renderItem  = React.useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const { thisMonth } = item;

        const markedDateThisMonth = markedDate.filter( marked => moment(marked.date).isSame(thisMonth, 'months') )

        const calendarProps : CalendarProps = {
            isSelectRange :         isSelectRange,

            selectedDate:           selectedDate.isSame(thisMonth, 'month') ? selectedDate : undefined,
            setSelectedDate:        setSelectedDate,
            onPressDate:            onPressDate,

            rangeSelectedDate:      isMonthContainedInRange(thisMonth) ? rangeSelectedDate : undefined,
            setRangeSelectedDate:   setRangeSelectedDate,
            onPressRangeDate:       onPressRangeDate,

            thisMonth:              thisMonth.month(),
            thisYear:               thisMonth.year(),

            markedDate:             markedDateThisMonth,
            showMonthHeader:        false,
        }
        
        return (
            <Animated.View style={[{width: width}, calendarContainerAnimation]}
            >
                {/* to avoid render calendar again each time -> which take a lot of time */}
                <Animated.View style={{display: showOneWeek ? 'none' : 'flex'}}
                    //TODO: add opacity animation for 2 views
                >
                    <Calendar
                        {...calendarProps}
                        showOneWeek={false}
                    />
                </Animated.View>

                <Animated.View style={{display: showOneWeek ? 'flex' : 'none'}}
                >
                    <Calendar
                        {...calendarProps}
                        showOneWeek={true}
                    />
                </Animated.View>
            </Animated.View>
        )
    },[selectedDate, rangeSelectedDate, currentMonth, showOneWeek, isSelectRange, markedDate]);

    function getDataList () : DataItemType[] {
        const listItem : DataItemType[] = []
        
        let thisMonth = monthMin.clone();
        while (thisMonth.isBefore(monthMax)) {
            listItem.push({thisMonth: thisMonth.clone()});
            thisMonth.add( 1 , 'months');
        }

        return listItem;
    }

    function getIndexOfMonth (month: moment.Moment = referenceMonth): number {
        return Math.floor(month.diff(monthMin, 'months', true));
    }

    function scroll( _arg: moment.Moment | number | Date | string, force : boolean = false ) : void {
        if (!flatListRef.current) {
            onScroll( false, {left: false, right: false});
            return;
        }

        if (!force && showOneWeek) { //avoid scroll when show 1 week
            onScroll( false, {left: false, right: false}); 
            return;
        }         
        
        const newMonth = (typeof _arg === 'number') 
                            ? currentMonth.clone().add(_arg, 'months')
                            : moment(_arg);

        let scrollDirection : ScrollType = {left: true, right: true};
        newMonth.isSameOrBefore(monthMin, 'months') && (scrollDirection.left = false);
        newMonth.isSameOrAfter(monthMax, 'months') && (scrollDirection.right = false);
        setCanScroll(scrollDirection);
        if (newMonth.isBefore(monthMin, 'months') || newMonth.isAfter(monthMax, 'months')) {
            onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToIndex({
            index: getIndexOfMonth(newMonth),
            animated: true,
        });
        setCurrentMonth(newMonth);

        onScroll( true, scrollDirection, newMonth );
    }

    React.useEffect(() => {
        scroll(selectedDate);
        setCurrentMonth(selectedDate);
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
        <FlatList
            ref={flatListRef}
            data={getDataList()}
            renderItem={renderItem}
            scrollEnabled={!showOneWeek}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            getItemLayout={(data, index) => ({length: width, offset: width * index, index})}
            initialScrollIndex={getIndexOfMonth()}
        />
    )
});
export default CalendarList;

const styles = StyleSheet.create({
    calendar: {},
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});