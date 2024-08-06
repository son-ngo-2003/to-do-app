import * as React from 'react';
import dayjs from 'dayjs';
import { View, StyleSheet } from 'react-native';

//components
import CalendarHeader, {type CalendarHeaderProps} from './CalendarHeader';
import DateItem from './DateItem';
import { type MarkedObject, type SelectedType } from '../type';

//constants
import { LENGTH_WEEK_SHOWS } from '../constants';
// import { useTraceUpdate } from '../../../hooks';

export type RangeSelectedDateType = {
    start: Date | string | undefined,
    end: Date | string | undefined,
}

export interface CalendarProps {
    selectedDate?: Date | string | dayjs.Dayjs,
    onPressDate?: (date: Date, dateString: string) => void,

    isSelectRange?: boolean,
    rangeSelectedDate?: RangeSelectedDateType,
    onPressRangeDate?: (date: RangeSelectedDateType) => void,

    thisMonth?: number, //0-11
    thisYear?: number,
 
    showOneWeek?: boolean,
    markedDate?: MarkedObject[],
    showMonthHeader?: boolean,

    dateNameType?: CalendarHeaderProps['dateNameType'],
}

const Calendar: React.FC<CalendarProps> = (props) => {
    const {
        selectedDate,
        onPressDate = () => {},
    
        isSelectRange = false,
        rangeSelectedDate = { start: undefined, end: undefined },
        onPressRangeDate = () => {},
    
        thisMonth,
        thisYear,
    
        showOneWeek = false,
        markedDate = [],
        showMonthHeader = true,

        dateNameType,
    } = props;

    //useTraceUpdate(props);

    const thisPeriod = React.useMemo( () => ( dayjs({ month: thisMonth, year: thisYear } )), [ thisMonth, thisYear ]);

    const firstDay = React.useMemo( () =>
                        showOneWeek && selectedDate
                        ? dayjs(selectedDate).startOf('isoWeek')
                        : thisPeriod.startOf('isoWeek')
    , [showOneWeek, selectedDate, thisPeriod])

    const onPress : (date: Date, dateString: string) => void = React.useCallback( (date, dateString) => {
        onPressDate(date, dateString);
    }, [onPressDate]);

    const onPressRange = React.useCallback( (date: Date, dateString: string) => {
        let newRangeSelectedDate: RangeSelectedDateType = rangeSelectedDate;
        newRangeSelectedDate.end 
            ? newRangeSelectedDate = {start: dateString, end: undefined}
            : newRangeSelectedDate = {start: newRangeSelectedDate.start , end: dateString };
        
        //check if start is after end, then inverse start and end
        newRangeSelectedDate.start && newRangeSelectedDate.end
            && newRangeSelectedDate.start < newRangeSelectedDate.end
            && (newRangeSelectedDate = {start: newRangeSelectedDate.end, end: newRangeSelectedDate.start});

        onPressRangeDate(newRangeSelectedDate);
    }, [rangeSelectedDate, onPressRangeDate]);

    const getSelectedType = React.useCallback((thisDay: dayjs.Dayjs) : SelectedType => {
        if (isSelectRange) {
            if (rangeSelectedDate.start && thisDay.isSame(rangeSelectedDate.start, 'day')) {
                if (!rangeSelectedDate.end  || dayjs(rangeSelectedDate.start).isSame(rangeSelectedDate.end, 'day'))
                    return 'one-date';
                return 'range-start';
            }
            if (rangeSelectedDate.end   && thisDay.isSame(rangeSelectedDate.end, 'day')) return 'range-end';
            if (rangeSelectedDate.start && rangeSelectedDate.end 
                && thisDay.isBetween(rangeSelectedDate.start, rangeSelectedDate.end, 'day', '()'))  
                    return 'range-between';
            return 'none';
        } else {
            return selectedDate && thisDay.isSame(selectedDate, 'day')
                ? 'one-date'
                : 'none';
        }
    }, [isSelectRange, selectedDate, rangeSelectedDate.start, rangeSelectedDate.end])

    const renderDay = React.useCallback((week: number, dateOfWeek: number) : React.ReactNode =>{
        const thisDay = firstDay.add(week * 7 + dateOfWeek, 'days');
        const markedThisDate = markedDate.filter( marked => dayjs( marked.date ).isSame(thisDay, 'day'));
        return (      
            <DateItem
                key={dateOfWeek}
                thisDate = { thisDay.format() }
                isCurrentMonth={thisDay.month() === thisMonth}
                
                selectedType={getSelectedType(thisDay) }
                onPress={ isSelectRange ? onPressRange : onPress}

                showMarked={!!markedDate}
                markedThisDate={ markedThisDate.length > 0 ? markedThisDate : undefined }
            />
        )
    },[firstDay, thisMonth, markedDate, getSelectedType, isSelectRange, onPress]);

    const renderWeek = React.useCallback (( week: number ) : React.ReactNode => {
        const days : React.ReactNode[] = [];
        for ( let i = 0; i < 7; i++ ) { //7 days a week
            days.push(renderDay( week, i ));
        }
        return <View key={week} style={[styles.weekContainer]}>{days.map(day => day)}</View>
    },[renderDay]);

    const renderMonth = React.useCallback ((weeksShow: number) : React.ReactNode => {
        const weeks : React.ReactNode[] = [];
        for ( let i = 0; i < weeksShow; i++ ) {
            weeks.push( renderWeek( i ) );
        }
        return <View>{weeks.map( week => week )}</View>
    }, [renderWeek]);

    return (
        <View style={[styles.calendar]}>
            <CalendarHeader 
                thisMonth={ thisPeriod.month() } 
                thisYear= { thisPeriod.year()  }
                showMonth={ showMonthHeader    }
                dateNameType={ dateNameType }
            />
            {   showOneWeek 
                ? renderMonth(1)
                : renderMonth(LENGTH_WEEK_SHOWS)
            }
        </View>
    )
}

export default React.memo(Calendar);

const styles = StyleSheet.create({
    calendar : {
        width: '100%',
        gap: 6,
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});