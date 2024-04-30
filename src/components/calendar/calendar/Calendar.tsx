import * as React from 'react';
import moment from 'moment';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

//components
import CalendarHeader from './CalendarHeader';
import DateItem, { type MarkedObject, type SelectedType }  from './DateItem';

//constants
import { LENGTH_WEEK_SHOWS } from '../constants';


export type RangeSelectedDateType = {
    start: moment.Moment | undefined,
    end: moment.Moment | undefined,
}

export type CalendarProps = {
    selectedDate?: moment.Moment,
    setSelectedDate?: (date: moment.Moment) => void,
    onPressDate?: (date: moment.Moment) => void,

    isSelectRange?: boolean,
    rangeSelectedDate?: RangeSelectedDateType,
    setRangeSelectedDate?: (date: RangeSelectedDateType) => void,
    onPressRangeDate?: (date: RangeSelectedDateType) => void,

    thisMonth?: number,
    thisYear?: number,
 
    showOneWeek?: boolean,
    markedDate?: Record<string, MarkedObject[]>,
    showMonthHeader?: boolean,

    initialDate?: string,
}

const Calendar: React.FC<CalendarProps> = ({
    selectedDate,
    setSelectedDate = () => {},
    onPressDate = () => {},

    isSelectRange = false,
    rangeSelectedDate = { start: undefined, end: undefined },
    setRangeSelectedDate = () => {},
    onPressRangeDate = () => {},

    thisMonth,
    thisYear,

    showOneWeek = false,
    markedDate,
    showMonthHeader = true,

    initialDate,
}) => {
    const [thisMoment, setThisMoment] = React.useState<moment.Moment>( moment(initialDate) );
    const firstDay = React.useMemo( () =>
                        showOneWeek && selectedDate
                        ? selectedDate.clone().startOf('isoWeek')
                        : thisMoment.clone().startOf('isoWeek')
    , [showOneWeek, selectedDate, thisMoment, rangeSelectedDate])

    const onPress : (date: moment.Moment) => void = React.useCallback( (date) => {
        setSelectedDate(date);
        onPressDate(date);
    }, []);

    const onPressRange : (date: moment.Moment) => void = React.useCallback( (date) => {
        let newRangeSelectedDate: RangeSelectedDateType = rangeSelectedDate;
        newRangeSelectedDate.end 
            ? newRangeSelectedDate = {start: date, end: undefined}
            : newRangeSelectedDate = {start: newRangeSelectedDate.start , end: date };
        
        //check if start is after end, then inverse start and end
        newRangeSelectedDate.start && newRangeSelectedDate.end
            && newRangeSelectedDate.start.isAfter(newRangeSelectedDate.end)
            && (newRangeSelectedDate = {start: newRangeSelectedDate.end, end: newRangeSelectedDate.start});

        setRangeSelectedDate(newRangeSelectedDate);
        onPressRangeDate(newRangeSelectedDate);
    }, [rangeSelectedDate]);

    const getSelectedType = React.useCallback<(thisDay: moment.Moment) => SelectedType>((thisDay) => {
        if (isSelectRange) {
            if (rangeSelectedDate.start && thisDay.isSame(rangeSelectedDate.start, 'day')) {
                if (!rangeSelectedDate.end  || rangeSelectedDate.start.isSame(rangeSelectedDate.end, 'day'))
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
    }, [isSelectRange, rangeSelectedDate, selectedDate])

    function renderDay (week: number, dateOfWeek: number) : React.ReactNode {
        const thisDay = firstDay.clone().add(week, 'weeks').add(dateOfWeek, 'days');
        return (      
            <DateItem
                thisDay={thisDay.date()}
                thisMonth={thisDay.month()}
                thisYear={thisDay.year()}

                selectedType={getSelectedType(thisDay)}

                key={dateOfWeek}
                onPress={() => isSelectRange ? onPressRange(thisDay) : onPress(thisDay)}

                showMarked={!!markedDate}
                markedThisDate={markedDate && markedDate[thisDay.format('YYYY-MM-DD')]}
                isCurrentMonth={thisDay.month() === thisMonth}
            />
        )
    }

    function renderWeek ( week: number ) : React.ReactNode {
        const days : React.ReactNode[] = [];
        for ( let i = 0; i < 7; i++ ) { //7 days a week
            days.push(renderDay( week, i ));
        }
        return <View key={week} style={[styles.weekContainer]}>{days}</View>
    }

    function renderMonth (weeksShow: number) : React.ReactNode {
        const weeks : React.ReactNode[] = [];
        for ( let i = 0; i < weeksShow; i++ ) {
            weeks.push(renderWeek( i ));
        }
        return (
            <Animated.View key={weeksShow}>
                {weeks}
            </Animated.View>
        )
    }

    React.useEffect(() => { 
        (thisMonth !== undefined) && thisYear && setThisMoment( moment({year: thisYear, month: thisMonth, day: 1}) );
    }, [thisMonth, thisYear]);

    return (
        <View style={[styles.calendar]}>
            <CalendarHeader 
                thisMonth={thisMoment.month()} 
                thisYear={thisMoment.year()}
                showMonth={showMonthHeader}
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