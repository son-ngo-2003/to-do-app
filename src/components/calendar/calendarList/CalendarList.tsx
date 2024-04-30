import * as React from 'react';
import moment from 'moment';
import { StyleSheet, ListRenderItem, FlatList } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import Calendar, { CalendarProps, type RangeSelectedDateType } from '../calendar/Calendar';
import { Layouts, Animations as Anim } from '../../../styles';

//constants
import { CALENDAR_BODY_HEIGHT, CALENDAR_BODY_ONE_WEEK_HEIGHT } from '../constants';

export type CalendarListProps = {
    minMonth?: number, // - delta with current month
    maxMonth?: number, // + delta with current month
    width?: number,
} & CalendarProps;

type CalenderListRef = {
    scroll: (arg: moment.Moment | number) => void,
} & Partial<FlatList>;

type DataItemType = {
    thisMonth: moment.Moment,
}

const CalendarList = React.forwardRef<CalenderListRef, CalendarListProps>(({
    initialDate,
    
    isSelectRange,
    onPressDate,
    onPressRangeDate,
    
    showOneWeek = false,
    
    markedDate,
    minMonth = 20,
    maxMonth = 20,
    
    width = Layouts.screen.width,
}, ref) => {
    const flatListRef = React.useRef<FlatList<DataItemType>>(null);
    const referenceMonth = moment(initialDate);
    const [ selectedDate, setSelectedDate ] = React.useState<moment.Moment>( referenceMonth );
    const [ rangeSelectedDate, setRangeSelectedDate ] = React.useState<RangeSelectedDateType>({start: referenceMonth, end: referenceMonth});
    const [ currentMonth, setCurrentMonth ] = React.useState<moment.Moment>( referenceMonth );
    const [ canScroll, setCanScroll ] = React.useState<'left' | 'right' | '2-directions'>( '2-directions');
    const monthMin = React.useMemo<moment.Moment>( () => referenceMonth.clone().subtract(minMonth, 'months'), [initialDate, minMonth] );
    const monthMax = React.useMemo<moment.Moment>( () => referenceMonth.clone().add(maxMonth, 'months'), [initialDate, maxMonth] );
    const expandCalendarProgress = useSharedValue<number>(showOneWeek ? 0 : 1);

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll: (arg: moment.Moment | number) => {
            scroll(arg);
        }
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

            markedDate:             markedDate,
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
        for (let i = -minMonth; i <= maxMonth; i++) {
            const thisMonth = referenceMonth.clone().add(i, 'months');
            listItem.push({thisMonth});
        }
        return listItem;
    }

    function getIndexOfMonth (month: moment.Moment = referenceMonth): number {
        const toMonth = month.month();
        const minMonth = monthMin.month();
        return toMonth - minMonth;
    }

    function scroll( _arg: moment.Moment | number, force : boolean = false ) : void {
        if (!flatListRef.current) return;
        if (!force && showOneWeek) return; //avoid scroll when show 1 week
        const newMonth = (typeof _arg === 'number') 
                            ? currentMonth.clone().add(_arg, 'months')
                            : _arg;

        flatListRef.current?.scrollToIndex({
            index: getIndexOfMonth(newMonth),
            animated: true,
        });
        setCurrentMonth(newMonth);
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