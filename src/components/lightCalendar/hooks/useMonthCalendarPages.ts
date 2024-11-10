import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useMemo } from 'react';
import * as React from "react";

interface UseMonthCalendarPagesProps {
    minDate?: Date | string | dayjs.Dayjs,
    maxDate?: Date | string | dayjs.Dayjs,
}

const UseMonthCalendarPages = ({
      minDate,
      maxDate,
}: UseMonthCalendarPagesProps) => {

    const getPeriod = React.useCallback ((date?: dayjs.Dayjs | string | Date) => {
        return dayjs(date).startOf('month');
    }, []);

    const _minDate = useMemo(() => getPeriod(minDate), [minDate]);
    const _maxDate = useMemo(() => getPeriod(maxDate), [maxDate]);

    const _generateListDate = useCallback(() => {
        let pages : dayjs.Dayjs[] = [];
        let thisDate = _minDate;

        while (thisDate.isSameOrBefore(_maxDate)) {
            pages.push( thisDate );
            thisDate = thisDate.add(1, 'month');
        }

        return pages;
    }, [_minDate, _maxDate]);

    const pagesRef = useRef(_generateListDate());

    useEffect(() => {
        pagesRef.current = _generateListDate();
    }, [_minDate, _maxDate]);

    const getIndexOfPage = useCallback((date?: dayjs.Dayjs | string | Date) => {
        return Math.floor(dayjs(date).diff(_minDate, 'months'));
    }, []);

    const isOutOfRange = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        return getPeriod(date).isBefore(_minDate) ? 'left' : getPeriod(date).isAfter(_maxDate) ? 'right' : 'none';
    }, []);

    const isOnEdgePages = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        return getIndexOfPage(date) === 0 ? 'left' : getIndexOfPage(date) === pagesRef.current.length - 1 ? 'right' : 'none';
    }, []);

    return {
        getPeriod,
        pagesRef,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    };
};

export default UseMonthCalendarPages;