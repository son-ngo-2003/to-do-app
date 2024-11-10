import React, { useCallback, useRef, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ListRenderItem, FlatList, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

//components
import Calendar, { CalendarProps } from './Calendar';
import { Layouts } from '../../styles';
import { type ScrollType, type CalenderListRef } from './type';
import CalendarListHeader, {CalendarListHeaderProps} from "./CalendarListHeader";

//hooks
import { UseMonthCalendarPages } from "./hooks";
// import { useTraceUpdate } from '../../../hooks';

export interface CalendarListProps {
    initialDate?: string | Date | dayjs.Dayjs,

    onPressDate?: CalendarProps['onPressDate'],
    onScroll?: ( isSuccess: boolean, newCanScroll : ScrollType, newMonth?: Date  ) => void,

    minMonth?: dayjs.Dayjs | string | Date,
    maxMonth?: dayjs.Dayjs | string | Date,

    width?: number,
    dateNameType?: CalendarProps['dateNameType'],
    styleNumber?: CalendarListHeaderProps['styleNumber'],
}

const CalendarList = React.forwardRef<CalenderListRef, CalendarListProps>((
    props, ref
) => {

    const {
        initialDate,

        onPressDate,
        onScroll,

        minMonth,
        maxMonth,
        width = Layouts.screen.width,

        dateNameType,
        styleNumber,
    } = props;

    // * --------------------------------------- variables part --------------------------------------------------------------

    //useTraceUpdate(props);
    const flatListRef = useRef<FlatList<DataItemType>>(null);

    const [ currentMonth, setCurrentMonth ] = useState<string>( dayjs(initialDate).format() );
    const [ selectedDate, setSelectedDate ] = useState<string>( currentMonth );
    const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});

    const {
        pagesRef,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    } = UseMonthCalendarPages({minDate: minMonth, maxDate: maxMonth} );

    // * --------------------------------------- functionality part ----------------------------------------------------

    React.useImperativeHandle(ref, () => ({
        ...flatListRef.current,
        scroll,
    }), [selectedDate, currentMonth]);

    const _onPressDate = useCallback<(date: Date, dateString: string) => void>( (date, dateString) => {
        onPressDate && onPressDate(date, dateString);
        setSelectedDate(dateString);
    }, [onPressDate, setSelectedDate]);

    const getScrollStatus = useCallback( ( month: dayjs.Dayjs = dayjs(selectedDate) ) => {
        const isOnEdge = isOnEdgePages(month);
        return isOnEdge !== 'none'
                    ? {left: isOnEdge !== 'left', right: isOnEdge !== 'right'}
                    : isOutOfRange(month) === 'none'
                        ? {left: true, right: true}
                        : {left: false, right: false};
    }, [selectedDate, isOnEdgePages, isOutOfRange]);

    const scroll = useCallback( ( _arg: dayjs.Dayjs | number | Date | string ) : void => {
        if (!flatListRef.current) {
            onScroll && onScroll( false, {left: false, right: false});
            setCanScroll({left: false, right: false});
            return;
        }

        const newMonth = (typeof _arg === 'number')
            ? dayjs(currentMonth).add(_arg, 'months')
            : dayjs(_arg);

        let scrollDirection : ScrollType = getScrollStatus(newMonth);
        if ( isOutOfRange(newMonth) !== 'none' ) {
            onScroll && onScroll( false, scrollDirection );
            return;
        }

        flatListRef.current?.scrollToOffset({animated: true, offset: width * getIndexOfPage(newMonth)});
        setCurrentMonth(newMonth.format());
        onScroll && onScroll( true, scrollDirection, newMonth.toDate() );
        setCanScroll(scrollDirection);
    }, [onScroll, currentMonth, isOutOfRange, width, getIndexOfPage, getScrollStatus, setCanScroll]);

    const onScrollManuel = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const ne = e.nativeEvent;
        if (ne.contentOffset.x % width !== 0) return;
        const newMonth = dayjs(minMonth).add( ne.contentOffset.x / width, 'months');
        setCurrentMonth(newMonth.format());

        let scrollDirection : ScrollType = getScrollStatus(newMonth);
        onScroll &&  onScroll( true, scrollDirection, newMonth.toDate() );
    }, [width, minMonth, onScroll, getScrollStatus]);

    useEffect(() => {
        if (!dayjs(selectedDate).isSame(currentMonth, 'months')) {
            scroll(selectedDate);
        }
    }, [selectedDate]);


    // * -------------------------------------------------- UI part ----------------------------------------------------

    const  renderItem  = useCallback<ListRenderItem<DataItemType>>(({ item }) => {
        const {  thisMonth } = item;
        const selectedDateInMonth = thisMonth.isSame( selectedDate, 'month' );

        const calendarProps : CalendarProps = {
            selectedDate:           selectedDateInMonth ? selectedDate : undefined,
            onPressDate:            _onPressDate,

            thisMonth:              thisMonth.month(),
            thisYear:               thisMonth.year(),
            dateNameType:           dateNameType,
        }

        return (
            <View style={[{width: width}]}>
                <Calendar {...calendarProps}/>
            </View>
        )
    },[selectedDate, _onPressDate, width, dateNameType]);

    const getDataList = useCallback( () : DataItemType[] => {
        return pagesRef.current.map((thisMonth) => ({thisMonth}));
    }, [pagesRef.current]);

    return (
        <View>
            <CalendarListHeader
                selectDateString={ dayjs(selectedDate).format('DD/MM') }
                currentMonth={ dayjs(selectedDate).month() }
                currentYear={ dayjs(selectedDate).year() }

                onPressLeft={() => scroll(-1)}
                onPressRight={() => scroll(1)}

                canScroll={canScroll}
                styleNumber={styleNumber}
            />

            <View style={{width}}>
                <FlatList
                    ref={flatListRef}
                    data={getDataList()}
                    renderItem={renderItem}

                    keyExtractor={(d, index) => d.thisMonth.format('YYYY-MM')}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll = {onScrollManuel}

                    pagingEnabled={true}
                    getItemLayout={(_, index) => ({length: width, offset: width * index, index})}
                    initialScrollIndex={getIndexOfPage()}
                />
            </View>
        </View>
)
});

type DataItemType = {
    thisMonth: dayjs.Dayjs,
}

export default React.memo(CalendarList);