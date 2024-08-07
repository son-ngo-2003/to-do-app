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

export interface MixCalendarListProps {
    initialDate?: CalendarListProps['initialDate'],
    taskList?: TimelineListProps['taskList'],

    isSelectRange?: CalendarListProps['isSelectRange'],
    onPressDate?: CalendarListProps['onPressDate'],
    onPressRangeDate?: CalendarListProps['onPressRangeDate'], //only for calendarMode = calendar
    onPressCell?: TimelineListProps['onPressCell'],           //only for calendarMode = timeline
    onPressTask?: TimelineListProps['onPressTask'],
    onScroll?: TimelineListProps['onScroll'],

    heightMode?: number | 'short' | 'medium' | 'full', //number and full only for timeline
    calendarMode?: 'calendar' | 'timeline' | 'mix',
    numberOfDays?: TimelineListProps['numberOfDays'], //only for timeline mode
    showWeekends?: TimelineListProps['showWeekends'], //only for week timeline mode (numberOfDays = 7)

    minDate?: dayjs.Dayjs | string | Date,
    maxDate?: dayjs.Dayjs | string | Date,
    width?: number,
    onPressShortenCalendarList?: (e: GestureResponderEvent) => void // often use to set height of list

    dateNameType?: CalendarListProps['dateNameType'],
}

const MixCalendarList = React.forwardRef<CalenderListRef, MixCalendarListProps>(({
    initialDate,
    taskList,

    isSelectRange = false,
    onPressDate,
    onPressRangeDate,
    onPressCell,
    onPressTask,
    onScroll,

    heightMode = 'medium',
    calendarMode = 'calendar',
    numberOfDays,
    showWeekends = true,

    minDate,
    maxDate,
    width = Layouts.screen.width,
    onPressShortenCalendarList,

    dateNameType,

}, ref) => {

    //TODO: use useTraceUpdate to check re-render of all children
    const itemsRef = React.useRef<any>(null);

    //TODO: selectedDate still not working when change mode
    const [ headerDateShow, setHeaderDateShow ] = React.useState<string>( dayjs(initialDate).format('DD/MM') );
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});
    const [ currentMode, setCurrentMode ] = React.useState<'calendar' | 'timeline' >( calendarMode == 'timeline' ? 'timeline' : 'calendar');
    
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

    const setItemsRef = React.useCallback((node: any, itemType: string) : void => {
        !itemsRef.current && (itemsRef.current = new Map());

        node
        ? itemsRef.current.set(itemType, node)
        : itemsRef.current.delete(itemType);
    } , [itemsRef.current]);

    const getCurrentPeriod = React.useCallback( () : dayjs.Dayjs => {
        if (!itemsRef.current ||!itemsRef.current.get(currentMode)) return dayjs(initialDate);
        return dayjs(itemsRef.current.get(currentMode).currentPeriod)
    }, [currentMode, itemsRef.current, initialDate] );

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
                onPressExpand={() => { currentMode === 'calendar' ? setCurrentMode('timeline') : setCurrentMode('calendar') }}
                canScroll={canScroll}
            />

            <View style={{display : (currentMode === 'calendar' ? 'flex' : 'none') }}>
                <CalendarList
                    ref={ node => setItemsRef(node, 'calendar') }
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

            <View style={{display : (currentMode === 'timeline' ? 'flex' : 'none') }}>
                <TimelineList
                    ref={ node => setItemsRef(node, 'timeline') }
                    initialDate={ initialDate }
                    taskList={ taskList }

                    onPressDate={ _onPressDate }
                    onPressCell={ onPressCell }
                    onPressTask={ onPressTask }
                    onScroll={ _onScroll }

                    numberOfDays={ numberOfDays }
                    showWeekends={ showWeekends }
                    minPeriod={ minDate }
                    maxPeriod={ maxDate }

                    width={ width }
                    height={ heightMode}
                    dateNameType={ dateNameType }
                />
            </View>
        </Pressable>
    )
});
export default React.memo( MixCalendarList );

const styles = StyleSheet.create({
    calendar: {},
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});