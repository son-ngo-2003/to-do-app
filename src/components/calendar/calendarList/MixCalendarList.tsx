import * as React from 'react';
import moment from 'moment';
import { StyleSheet, ListRenderItem, FlatList, GestureResponderEvent, Pressable } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

//components
import CalendarListHeader from './CalendarListHeader';
import CalendarList from './CalendarList';
import TimelineList from './TimelineList';
import { type CalendarProps, type RangeSelectedDateType } from '../calendar/Calendar';
import { type TimelineProps } from '../timeline/Timeline';
import { Layouts, Animations as Anim } from '../../../styles';
import { ScrollType, type CalenderListRef } from '../type';

//constants
import { CALENDAR_BODY_HEIGHT, CALENDAR_BODY_ONE_WEEK_HEIGHT } from '../constants';

//utils
import { taskTimelineToMarked } from '../utils';

export type MixCalendarListProps = {
    minDate?: moment.Moment | string | Date,
    maxDate?: moment.Moment | string | Date,
    width?: number,
    onPressCalendarList?: (e: GestureResponderEvent) => void // often use to set height of list
    onScroll: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: moment.Moment  ) => void,

    heightMode?: number | 'short' | 'medium' | 'full', //number and full only for timeline
    calendarMode?: 'calendar' | 'timeline' | 'mix',

} & CalendarProps & TimelineProps;

const MixCalendarList = React.forwardRef<CalenderListRef, MixCalendarListProps>(({
    initialDate,
    onPressCalendarList = () => {},
    taskList = [],

    isSelectRange,
    onPressDate = () => {},
    onPressRangeDate = () => {}, //only for calendar
    onPressCell = () => {},      //only for timeline
    onPressTask = () => {},      //only for 
    onScroll = () => {},
    
    heightMode = 'medium',
    calendarMode = 'calendar',
    numberOfDate, //only for timeline mode

    minDate,
    maxDate,
    width = Layouts.screen.width,

}, ref) => {
    const listRef = React.useRef<any>(null);

    const [ selectedDate, setSelectedDate ] = React.useState<moment.Moment>( moment(initialDate) );
    const [ selectedDateString, setSelectedDateString ] = React.useState<string>( selectedDate.format('DD/MM') );
    const [ currentPeriod, setCurrentPeriod ] = React.useState<moment.Moment>( moment(initialDate) );
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});
    const [ currentMode, setCurrentMode ] = React.useState<'calendar' | 'timeline' >( calendarMode == 'timeline' ? 'timeline' : 'calendar');

    React.useImperativeHandle(ref, () => ({
        ...listRef.current,
    }), [currentMode]);

    const _onPressDate = (selectedDate: moment.Moment) => {
        setSelectedDate( selectedDate );
        onPressDate(selectedDate);
        setSelectedDateString(selectedDate.format('DD/MM'));
    }

    const _onPressRangedDate = (date: RangeSelectedDateType) => {
        onPressRangeDate(date);
        let stringDate = '';
        date.start && ( stringDate += date.start.format('DD/MM')) && setSelectedDate(date.start);
        date.end && ( stringDate += '-' + date.end.format('DD/MM'));
        setSelectedDateString(stringDate);
    }

    const _onScroll =  ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: moment.Moment  ) => {
        onScroll( isSuccess, newCanScroll, newPeriod);
        setCanScroll(newCanScroll);
    }

    const renderList = () => {
        const timelineHeight = {
            'short' : CALENDAR_BODY_ONE_WEEK_HEIGHT,
            'medium' : CALENDAR_BODY_HEIGHT,
            'full' : Layouts.screen.height,
        }
        return (
            currentMode === 'calendar'
            ? <CalendarList
                    ref={listRef}
                    initialDate={selectedDate.format('DD/MM/YYYY')}
                    markedDate={ taskTimelineToMarked(taskList) }

                    isSelectRange={ isSelectRange }
                    onPressDate={ _onPressDate }
                    onPressRangeDate={ _onPressRangedDate }
                    onScroll={ _onScroll }

                    showOneWeek = { typeof heightMode === 'number'
                                    ? heightMode < CALENDAR_BODY_HEIGHT
                                    : heightMode === "short"
                    }

                    minMonth={ minDate }
                    maxMonth={ maxDate }
                />
            : <TimelineList
                    ref={listRef}
                    initialDate={ selectedDate.format('DD/MM/YYYY') }
                    taskList={ taskList }

                    onPressDate={ _onPressDate }
                    onPressCell={ onPressCell }
                    onPressTask={ onPressTask }
                    onScroll={ _onScroll }

                    height={ typeof heightMode === 'number'
                            ? heightMode
                            : timelineHeight[heightMode]
                    }     
                    
                    numberOfDate={ numberOfDate }
                    minPeriod={ minDate }
                    maxPeriod={ maxDate }
                />
        );
    }

    return (
        <Pressable style={[styles.calendar, {width}]}
                onPress={onPressCalendarList}
                onStartShouldSetResponderCapture={(e) => 
                    typeof heightMode === 'number'
                    ? heightMode < CALENDAR_BODY_HEIGHT
                    : heightMode === 'short'
                }
        >
            <CalendarListHeader
                selectDateString={ selectedDateString }
                currentMonth={ currentPeriod.month() }
                currentYear={ currentPeriod.year() }

                onPressLeft={() => listRef.current?.scroll(-1)}
                onPressRight={() => listRef.current?.scroll(-1)}
                onPressExpand={() => { setCurrentMode('timeline') }}
                canScroll={canScroll}
            />
            { renderList() }
        </Pressable>
    )
});
export default MixCalendarList;

const styles = StyleSheet.create({
    calendar: {},
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});