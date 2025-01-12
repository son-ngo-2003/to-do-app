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
import {debounce, throttle} from "lodash";
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
        pages,
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

    const numberCumulative = useRef<number>(0);
    const debouncedHandleScroll = React.useMemo(() =>
        debounce((newMonth: dayjs.Dayjs) => {
            let scrollDirection : ScrollType = getScrollStatus(newMonth);


            setCurrentMonth(newMonth.format());
            onScroll?.( true, scrollDirection, newMonth.toDate() );
            setCanScroll(scrollDirection);
        }, 200)
    , [getScrollStatus, onScroll, setCanScroll]);

    const debouncedScroll = React.useMemo(() =>
        debounce(( _arg: dayjs.Dayjs | number | Date | string, force: boolean = false ) : void => {
            // force = true: scroll to the date, if it is out of range, it will scroll to the edge
            // force = false: scroll to the date, if it is out of range, it will not scroll

            if (!flatListRef.current) {
                onScroll?.( false, {left: false, right: false});
                setCanScroll({left: false, right: false});
                return;
            }

            const newMonth = (typeof _arg === 'number')
                ? dayjs(currentMonth).add(_arg, 'months')
                : dayjs(_arg);

            if ( isOutOfRange(newMonth) !== 'none' && !force ) {
                onScroll?.( false, getScrollStatus(newMonth) );
                return;
            }

            flatListRef.current?.scrollToOffset({animated: true, offset: width * getIndexOfPage(newMonth)});
            debouncedHandleScroll(newMonth);
            numberCumulative.current = 0;
        }, 300)
    , [onScroll, setCanScroll, currentMonth, getScrollStatus, isOutOfRange, width, getIndexOfPage, debouncedHandleScroll]);

    const scroll = useCallback( ( _arg: dayjs.Dayjs | number | Date | string ) => {
        if (typeof _arg !== 'number') {
            debouncedScroll(_arg, false);
            return;
        }
        numberCumulative.current += _arg;
        debouncedScroll(numberCumulative.current, true);
    } , [debouncedScroll]);

    const throttledOnScrollManuel = React.useMemo( () =>
        throttle((e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const ne = e.nativeEvent;
            const deltaPage = Math.floor( ne.contentOffset.x / width );
            const newMonth = dayjs(minMonth).add( deltaPage, 'months');
            debouncedHandleScroll(newMonth);
        }, 500)
    , [minMonth, width, debouncedHandleScroll]);

    const onScrollManuel = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        e.persist();
        throttledOnScrollManuel(e);
    }, [throttledOnScrollManuel]);


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

    const getDataList = React.useMemo((): DataItemType[] => {
        return pages.map((thisMonth) => ({ thisMonth }));
    }, [pages]);

    return (
        <View>
            <CalendarListHeader
                selectDateString={ dayjs(selectedDate).format('DD/MM') }
                currentMonth={ dayjs(currentMonth).month() }
                currentYear={ dayjs(currentMonth).year() }

                onPressLeft={() => scroll(-1)}
                onPressRight={() => scroll(1)}

                canScroll={canScroll}
                styleNumber={styleNumber}
            />

            <View style={{width}}>
                <FlatList
                    ref={flatListRef}
                    data={getDataList}
                    renderItem={renderItem}

                    keyExtractor={(d, _) => d.thisMonth.format('YYYY-MM')}
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