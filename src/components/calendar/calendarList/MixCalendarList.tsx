import * as React from 'react';
import dayjs from 'dayjs';
import {StyleSheet, GestureResponderEvent, Pressable, View} from 'react-native';

//components
import CalendarListHeader from './CalendarListHeader';
import CalendarList, {type CalendarListProps} from './CalendarList';
import TimelineList, {type TimelineListProps} from './TimelineList';
import { type RangeSelectedDateType } from '../calendar/Calendar';
import { Layouts } from '../../../styles';
import { ScrollType, type CalenderListRef } from '../type';

//constants
import { CALENDAR_BODY_HEIGHT } from '../constants';

//utils
import { taskTimelineToMarked } from '../utils';
import {useMemo} from "react";

export type CalendarMode = 'calendar' | 'month' | 'week' | 'weekdays' | 'day' | number;
// lightCalendar = month; number will be timeline mode with number of days correspond (number <= 10)

export interface MixCalendarListProps {
    calendarModes: CalendarMode[] | CalendarMode, //a lightCalendar mode or a list of lightCalendar modes

    initialDate?: CalendarListProps['initialDate'],
    taskList?: TimelineListProps['taskList'],

    isSelectRange?: CalendarListProps['isSelectRange'],
    onPressDate?: CalendarListProps['onPressDate'],
    onPressRangeDate?: CalendarListProps['onPressRangeDate'], //only for calendarMode = lightCalendar
    onPressCell?: TimelineListProps['onPressCell'],           //only for calendarMode = timeline
    onPressTask?: TimelineListProps['onPressTask'],

    onScroll?: TimelineListProps['onScroll'],
    heightMode?: number | 'short' | 'medium' | 'full', //number and full only for timeline
    initialModeIndex?: number,

    minDate?: dayjs.Dayjs | string | Date, //syntax: 'YYYY-MM-DD'
    maxDate?: dayjs.Dayjs | string | Date, //syntax: 'YYYY-MM-DD'
    width?: number,
    onPressShortenCalendarList?: (e: GestureResponderEvent) => void // often use to set height of list

    dateNameType?: CalendarListProps['dateNameType'],
}

const MixCalendarList = React.forwardRef<CalenderListRef,MixCalendarListProps>(({
    initialDate,
    taskList,

    isSelectRange = false,
    onPressDate,
    onPressRangeDate,
    onPressCell,
    onPressTask,
    onScroll,

    heightMode = 'medium',
    calendarModes,
    initialModeIndex = 0,

    minDate,
    maxDate,
    width = Layouts.screen.width,
    onPressShortenCalendarList,

    dateNameType,

}, ref) => {

    //TODO: use useTraceUpdate to check re-render of all children
    const itemsRef = React.useRef<any>(null);

    //TODO: selectedDate still not working when change mode
    const listCalendarModes = useMemo( () => Array.isArray(calendarModes) ? calendarModes : [calendarModes], [calendarModes] );
    const [ headerDateShow, setHeaderDateShow ] = React.useState<string>( dayjs(initialDate).format('DD/MM') );
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});
    const [ currentMode, setCurrentMode ] = React.useState<CalendarMode>( listCalendarModes[ Math.min( initialModeIndex, listCalendarModes.length-1 ) ] );
    
    const markedList = React.useMemo( () => taskTimelineToMarked(taskList) , [taskList] )

    const _onPressDate = React.useCallback((date: Date, stringDate: string) : void => {
        itemsRef.current && itemsRef.current.forEach( (item: any) => item.onChangeSelectedDate( date, stringDate ) );

        onPressDate && onPressDate(date, stringDate);
        setHeaderDateShow( dayjs(date).format('DD/MM') );
    }, [onPressDate, setHeaderDateShow]);

    const _onPressRangedDate = React.useCallback((date: RangeSelectedDateType) : void => {
        onPressRangeDate && onPressRangeDate(date);

        let stringDate = '';
        date.start && ( stringDate += dayjs(date.start).format('DD/MM')); //&& setSelectedDate(date.start);
        date.end && ( stringDate += '-' + dayjs(date.end).format('DD/MM'));
        setHeaderDateShow(stringDate);
    }, [onPressRangeDate, setHeaderDateShow]);

    const _onScroll =  React.useCallback(( isSuccess: boolean, newCanScroll : ScrollType, newPeriod?: Date ) : void => {
        onScroll && onScroll( isSuccess, newCanScroll, newPeriod );
        setCanScroll(newCanScroll);
    }, [onScroll, setCanScroll]);

    const setItemsRef = React.useCallback((node: any, itemType: CalendarMode) : void => {
        !itemsRef.current && (itemsRef.current = new Map());

        node
        ? itemsRef.current.set(itemType, node)
        : itemsRef.current.delete(itemType);
    } , [itemsRef.current]);

    const getCurrentPeriod = React.useCallback( () : dayjs.Dayjs => {
        if (!itemsRef.current ||!itemsRef.current.get(currentMode)) return dayjs(initialDate);
        return dayjs(itemsRef.current.get(currentMode).currentPeriod)
    }, [currentMode, itemsRef.current, initialDate] );

    const getNumberOfDays = React.useCallback( (mode: CalendarMode) : number => {
        if (mode === 'calendar') return 30;
        if (mode === 'month') return 30;
        if (mode === 'week') return 7;
        if (mode === 'weekdays') return 7; //will have attribute to decide show weekend or not in timeline list
        if (mode === 'day') return 1;
        return mode;
    } , [] );

    React.useImperativeHandle(ref, () => itemsRef.current[currentMode]
    , [currentMode, itemsRef.current]);

    return (
        <Pressable style={[styles.calendar, {width}]}
                onPress={onPressShortenCalendarList}
                onStartShouldSetResponderCapture={(_) =>
                    typeof heightMode === 'number'
                    ? heightMode < CALENDAR_BODY_HEIGHT
                    : heightMode === 'short'
                }
        >
            <CalendarListHeader
                selectDateString={ headerDateShow }
                currentMonth={ getCurrentPeriod().month() }
                currentYear={ getCurrentPeriod().year() }

                onPressLeft={() => itemsRef.current.get(currentMode).scroll(-1)}
                onPressRight={() => itemsRef.current.get(currentMode).scroll(1)}

                calendarModes={ listCalendarModes }
                initialModeIndex={ initialModeIndex }
                setCalendarMode={setCurrentMode}

                canScroll={canScroll}
            />

            {
                listCalendarModes.map( (mode, index) => {
                    if (typeof mode === 'number' && mode > 10) return null;
                    if (mode === 'calendar' || mode === 'month')
                        return (
                            <View style={{display : (currentMode === mode ? 'flex' : 'none') }} key={index}>
                                <CalendarList
                                    ref={ node => setItemsRef(node, mode) }
                                    initialDate={ initialDate }
                                    markedDate={ markedList }

                                    isSelectRange={ isSelectRange }
                                    onPressDate={ _onPressDate }
                                    onPressRangeDate={ _onPressRangedDate }
                                    onScroll={ _onScroll }

                                    showOneWeek = { typeof heightMode === 'number'
                                        ? heightMode < CALENDAR_BODY_HEIGHT
                                        : heightMode === 'short' }

                                    minMonth={ minDate }
                                    maxMonth={ maxDate }
                                    width={ width }
                                    dateNameType={ dateNameType }
                                />
                            </View>
                        )
                    else
                        return (
                            <View style={{display : (currentMode === mode ? 'flex' : 'none') }} key={index}>
                                <TimelineList
                                    ref={ node => setItemsRef(node, mode) }
                                    initialDate={ initialDate }
                                    taskList={ taskList }

                                    onPressDate={ _onPressDate }
                                    onPressCell={ onPressCell }
                                    onPressTask={ onPressTask }
                                    onScroll={ _onScroll }

                                    numberOfDays={ getNumberOfDays(mode) }
                                    showWeekends={ mode === 'week' }
                                    minPeriod={ minDate }
                                    maxPeriod={ maxDate }

                                    width={ width }
                                    height={ heightMode}
                                    dateNameType={ dateNameType }
                                />
                            </View>
                        )

                })
            }
        </Pressable>
    )
});
export default React.memo( MixCalendarList );

const styles = StyleSheet.create({
    calendar: {
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});