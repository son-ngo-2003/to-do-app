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
    calendarMode?: 'calendar' | 'timeline' | 'mix',
    
    initialDate?: Date | string | dayjs.Dayjs,
    minDate?: dayjs.Dayjs | string | Date,
    maxDate?: dayjs.Dayjs | string | Date,

    onPressShortenCalendarList?: (e: GestureResponderEvent) => void // often use to set height of list
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date ) => void,
    
    heightMode?: number | 'short' | 'medium' | 'full', //number and full only for timeline
    width?: number,
} & CalendarProps & TimelineProps;

const MixCalendarList = React.forwardRef<CalenderListRef, MixCalendarListProps>(({
    initialDate,
    onPressShortenCalendarList = () => {},
    taskList,

    isSelectRange = false,
    onPressDate,
    onPressRangeDate, //only for calendar
    onPressCell,      //only for timeline
    onPressTask,      //only for 
    onScroll,
    
    heightMode = 'medium',
    calendarMode = 'calendar',
    numberOfDate, //only for timeline mode
    showWeekends = true, //only for week timeline mode (numberOfDate = 7)

    minDate,
    maxDate,
    width = Layouts.screen.width,

}, ref) => {
    const listRef = React.useRef<any>(null);

    const [ selectedDate, setSelectedDate ] = React.useState<string>( dayjs(initialDate).format() );
    const [ headerDateShow, setHeaderDateShow ] = React.useState<string>( dayjs(selectedDate).format('DD/MM') );
    const [ currentPeriod, setCurrentPeriod ] = React.useState<string>( selectedDate );
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});
    const [ currentMode, setCurrentMode ] = React.useState<'calendar' | 'timeline' >( calendarMode == 'timeline' ? 'timeline' : 'calendar');
    
    const markedList = React.useMemo( () => taskTimelineToMarked(taskList) , [taskList] )

    React.useImperativeHandle(ref, () => ({
        ...listRef.current,
    }), [currentPeriod, setSelectedDate]);

    const _onPressDate = React.useCallback<(date: Date, stringDate: string) => void>((date: Date, stringDate: string) => {
        setSelectedDate( stringDate );
        onPressDate && onPressDate(date, stringDate);
        setHeaderDateShow( dayjs(date).format('DD/MM') );
    }, [onPressDate]);

    const _onPressRangedDate = React.useCallback<(date: RangeSelectedDateType) => void>((date: RangeSelectedDateType) => {
        onPressRangeDate && onPressRangeDate(date);
        let stringDate = '';
        date.start && ( stringDate += dayjs(date.start).format('DD/MM')); //&& setSelectedDate(date.start);
        date.end && ( stringDate += '-' + dayjs(date.end).format('DD/MM'));
        setHeaderDateShow(stringDate);
    }, [onPressRangeDate]);

    const _onScroll =  React.useCallback<( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date ) => void>((isSuccess, newCanScroll, newPeriod) => {
        onScroll && onScroll( isSuccess, newCanScroll, newPeriod);
        newPeriod && setCurrentPeriod( dayjs(newPeriod).format() );
        setCanScroll(newCanScroll);
    }, [onScroll]);

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
                    initialDate={ initialDate }
                    markedDate={ markedList }

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
                    initialDate={ initialDate }
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
                    showWeekends={ showWeekends }
                    minPeriod={ minDate }
                    maxPeriod={ maxDate }
                    width={width}
                    
                    startDate={''}
                />
        );
    }

    return (
        <Pressable style={[styles.calendar, {width}]}
                onPress={onPressShortenCalendarList}
                onStartShouldSetResponderCapture={(e) => 
                    typeof heightMode === 'number'
                    ? heightMode < CALENDAR_BODY_HEIGHT
                    : heightMode === 'short'
                }
        >
            <CalendarListHeader
                selectDateString={ headerDateShow }
                currentMonth={ dayjs(currentPeriod).month() }
                currentYear={ dayjs(currentPeriod).year() }

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