import React, { useCallback, useRef, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {ListRenderItem, FlatList, View, NativeSyntheticEvent, NativeScrollEvent, Text} from 'react-native';

//components
import Calendar, { CalendarProps } from './Calendar';
import { Layouts } from '../../styles';
import { type ScrollType, type CalenderListRef } from './type';
import CalendarListHeader, {CalendarListHeaderProps} from "./CalendarListHeader";

//hooks
import { UseMonthCalendarPages } from "./hooks";
import {debounce, throttle} from "lodash";
import {InfinityList, ScrollEvent} from "../atomic";
import {CALENDAR_BODY_HEIGHT} from "./constants";
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
    const infinityRef = useRef<any>(null);
    const safeInitialDate = React.useMemo(() => {
        return dayjs(initialDate).isValid() ? dayjs(initialDate) : dayjs();
    }, [initialDate]);

    const [ currentMonth, setCurrentMonth ] = useState<string>( safeInitialDate.format() );
    const [ selectedDate, setSelectedDate ] = useState<string>( currentMonth );
    // const [ canScroll, setCanScroll ] = React.useState<ScrollType>({left: false, right: false});

    const {
        pages,
        extendPages,

        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    } = UseMonthCalendarPages( {initialMonth: safeInitialDate} );

    const pagesString = React.useMemo( () => pages.map( (page) => page.format('YYYY-MM') ), [pages]);

    // * --------------------------------------- functionality part ----------------------------------------------------

    React.useImperativeHandle(ref, () => ({
        ...infinityRef.current,
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
            // setCanScroll(scrollDirection);
        }, 200)
    , [getScrollStatus, onScroll]);

    const debouncedScroll = React.useMemo(() =>
        debounce(( _arg: dayjs.Dayjs | number | Date | string, force: boolean = false ) : void => {

            if (!infinityRef.current) {
                onScroll?.( false, {left: false, right: false});
                // setCanScroll({left: false, right: false});
                return;
            }

            const newMonth = (typeof _arg === 'number')
                ? dayjs(currentMonth).add(_arg, 'months')
                : dayjs(_arg);

            if ( isOutOfRange(newMonth) !== 'none' && !force ) {
                onScroll?.( false, getScrollStatus(newMonth) );
                return;
            }

            infinityRef.current?.scrollToIndex(getIndexOfPage(newMonth), true);
            debouncedHandleScroll(newMonth);
            numberCumulative.current = 0;
        }, 300)
    , [onScroll, currentMonth, getScrollStatus, isOutOfRange, getIndexOfPage, debouncedHandleScroll]);

    const scroll = useCallback( ( _arg: dayjs.Dayjs | number | Date | string ) => {
        if (typeof _arg !== 'number') {
            debouncedScroll(_arg, false);
            return;
        }
        numberCumulative.current += _arg;
        debouncedScroll(numberCumulative.current, true);
    } , [debouncedScroll]);

    const throttledOnScrollManuel = React.useMemo( () =>
        throttle((_rawEvent: ScrollEvent, offsetX: number, _offsetY: number) => {
            const deltaPage = Math.floor( offsetX / width );
            const newMonth = pages[deltaPage];
            debouncedHandleScroll(newMonth);
        }, 200)
    , [width, debouncedHandleScroll, pages]);

    const onScrollManuel = useCallback((rawEvent: ScrollEvent, offsetX: number, offsetY: number, isScrollByUser: boolean) => {
        if (!isScrollByUser) return;
        throttledOnScrollManuel(rawEvent, offsetX, offsetY);
    }, [throttledOnScrollManuel]);

    useEffect(() => {
        if (!dayjs(selectedDate).isSame(currentMonth, 'months')) {
            scroll(selectedDate);
        }
    }, [selectedDate]);


    // * -------------------------------------------------- UI part ----------------------------------------------------

    const  renderItem  = useCallback((_type: string | number, month: string) => {
        const thisMonth = dayjs(month, 'YYYY-MM');
        const isSelectedDateInMonth = thisMonth.isSame( selectedDate, 'month' );

        const calendarProps : CalendarProps = {
            selectedDate:           isSelectedDateInMonth ? selectedDate : undefined,
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
    },[width, dateNameType, selectedDate, _onPressDate]);

    const reloadData = useCallback( (index: number) => {
        if (index < 2) {
            extendPages('left');
            return;
        }
        if (index >= pages.length - 2) {
            extendPages('right');
        }
    }, [extendPages, pages.length]);

    return (
        <View>
            <CalendarListHeader
                selectDateString={ dayjs(selectedDate).format('DD/MM') }
                currentMonth={ dayjs(currentMonth).month() }
                currentYear={ dayjs(currentMonth).year() }

                onPressLeft={() => scroll(-1)}
                onPressRight={() => scroll(1)}

                // canScroll={canScroll}
                styleNumber={styleNumber}
            />

            <View style={{width, height: CALENDAR_BODY_HEIGHT}}>
                {
                    width > 0 &&
                    <InfinityList
                        style={{flex: 1}}
                        ref={infinityRef}

                        data={pagesString}
                        pageSize={{width, height: CALENDAR_BODY_HEIGHT}}

                        reloadData={reloadData}
                        rowRenderer={renderItem}

                        pagingEnabled={true}
                        isHorizontal={true}
                        showIndicator={false}

                        onScroll = {onScrollManuel}
                        extendedState={{selectedDate}}

                        onFrontReachedThreshold={width * 2}
                        onEndReachedThreshold={width * 2}
                        renderAheadOffset={width * 5}
                    />
                }

            </View>
        </View>
)
});

type DataItemType = {
    thisMonth: dayjs.Dayjs,
}

export default React.memo(CalendarList);