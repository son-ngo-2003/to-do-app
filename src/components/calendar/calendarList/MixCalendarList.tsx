import * as React from 'react';
import dayjs from 'dayjs';
import { StyleSheet, GestureResponderEvent, Pressable } from 'react-native';

//components
import CalendarListHeader from './CalendarListHeader';
import CalendarList from './CalendarList';
import TimelineList from './TimelineList';
import { type CalendarProps, type RangeSelectedDateType } from '../calendar/Calendar';
import { type TimelineProps } from '../timeline/Timeline';
import { Layouts } from '../../../styles';
import { ScrollType, type CalenderListRef } from '../type';

//constants
import { CALENDAR_BODY_HEIGHT, CALENDAR_BODY_ONE_WEEK_HEIGHT } from '../constants';

//utils
import { taskTimelineToMarked } from '../utils';

export type MixCalendarListProps = {
    minDate?: dayjs.Dayjs | string | Date,
    maxDate?: dayjs.Dayjs | string | Date,
    width?: number,
    onPressCalendarList?: (e: GestureResponderEvent) => void // often use to set height of list
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date ) => void,

    heightMode?: number | 'short' | 'medium' | 'full', //number and full only for timeline
    calendarMode?: 'calendar' | 'timeline' | 'mix',
} & CalendarProps & TimelineProps;

const MixCalendarList = React.forwardRef<CalenderListRef, MixCalendarListProps>(({
    initialDate,
    onPressCalendarList = () => {},
    taskList = [],

    isSelectRange = false,
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

    const [ selectedDate, setSelectedDate ] = React.useState<Date>( dayjs(initialDate).toDate() );
    const [ selectedDateString, setSelectedDateString ] = React.useState<string>( dayjs(selectedDate).format('DD/MM') );
    const [ currentPeriod, setCurrentPeriod ] = React.useState<Date>( selectedDate );
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});
    const [ currentMode, setCurrentMode ] = React.useState<'calendar' | 'timeline' >( calendarMode == 'timeline' ? 'timeline' : 'calendar');

    React.useImperativeHandle(ref, () => ({
        ...listRef.current,
    }), [currentPeriod, setSelectedDate]);

    const _onPressDate = (date: Date, stringDate: string) => {
        setSelectedDate( date );
        onPressDate(date, stringDate);
        setSelectedDateString( dayjs(date).format('DD/MM') );
    }

    const _onPressRangedDate = (date: RangeSelectedDateType) => {
        onPressRangeDate(date);
        let stringDate = '';
        date.start && ( stringDate += dayjs(date.start).format('DD/MM')); //&& setSelectedDate(date.start);
        date.end && ( stringDate += '-' + dayjs(date.end).format('DD/MM'));
        setSelectedDateString(stringDate);
    }

    const _onScroll =  ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date  ) => {
        onScroll( isSuccess, newCanScroll, newPeriod);
        newPeriod && setCurrentPeriod( newPeriod );
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
                    initialDate={ selectedDate }
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
                    width={width}
                />
            : <TimelineList
                    ref={listRef}
                    initialDate={ selectedDate }
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
                    width={width}
                    
                    startDate={''}
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
                currentMonth={ currentPeriod.getMonth() }
                currentYear={ currentPeriod.getFullYear() }

                onPressLeft={() => listRef.current.scroll(-1)}
                onPressRight={() => listRef.current.scroll(1)}
                onPressExpand={() => { currentMode === 'calendar' ? setCurrentMode('timeline') : setCurrentMode('calendar') }}
                canScroll={canScroll}
            />

            { renderList()}
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