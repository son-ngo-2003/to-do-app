import dayjs from "dayjs";
import {useCallback, useEffect, useRef, useMemo, useState} from 'react';
import * as React from "react";
import {NUMBER_PAGES_ONE_SIZE_INITIAL_RENDER, NUMBER_PAGES_TO_LOAD} from "../constants";

interface UseMonthCalendarPagesProps {
    initialMonth?: Date | string | dayjs.Dayjs,
}

const UseMonthCalendarPages = ({
      initialMonth,
}: UseMonthCalendarPagesProps) => {

    const getPeriod = React.useCallback ((date?: dayjs.Dayjs | string | Date) => {
        return dayjs(date).startOf('month');
    }, []);

    const [_minDate, _maxDate] = useMemo(() => {
        const start = getPeriod(initialMonth).subtract(NUMBER_PAGES_ONE_SIZE_INITIAL_RENDER  , "month");
        const end = getPeriod(initialMonth).add(NUMBER_PAGES_ONE_SIZE_INITIAL_RENDER, "month");
        return start.isAfter(end) ? [end, start] : [start, end]; // Swap if minDate > maxDate
    }, [getPeriod, initialMonth]);

    const _pages = useMemo(() => {
        const totalMonths = _maxDate.diff(_minDate, "month") + 1;
        return Array.from({ length: totalMonths }, (_, i) => _minDate.add(i, "month"));
    }, [_minDate, _maxDate]);

    const [minCurrent, setMinCurrent] = useState(_minDate);
    const [maxCurrent, setMaxCurrent] = useState(_maxDate);
    const [pages, setPages] = useState(_pages);

    const extendPages = useCallback((direction: 'left' | 'right') => {
        if (direction === 'left') {
            const newPages = Array.from({ length: NUMBER_PAGES_TO_LOAD }, (_, i) => minCurrent.subtract(i + 1, "month"));
            newPages.reverse();
            setPages( newPages.concat(pages) );
            setMinCurrent( newPages[0] );
            return
        }
        const newPages = Array.from({ length: NUMBER_PAGES_TO_LOAD }, (_, i) => maxCurrent.add(i + 1, "month"));
        setPages( pages.concat(newPages) );
        setMaxCurrent( newPages[newPages.length - 1] );
    }, [minCurrent, maxCurrent]);

    const getIndexOfPage = useCallback((date?: dayjs.Dayjs | string | Date) => {
        // return Math.floor(dayjs(date).diff(_minDate, 'months'));
        return Math.max(0, Math.min(pages.length - 1, dayjs(date).diff(minCurrent, "months")));
    }, [minCurrent, maxCurrent]);

    const isOutOfRange = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        return getPeriod(date).isBefore(maxCurrent) ? 'left' : getPeriod(date).isAfter(maxCurrent) ? 'right' : 'none';
    }, [minCurrent, maxCurrent, getPeriod]);

    const isOnEdgePages = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        const index = getIndexOfPage(date);
        if (index === 0) return "left";
        if (index === pages.length - 1) return "right";
        return "none";
    }, [minCurrent, maxCurrent, getIndexOfPage]);

    return {
        pages,
        getPeriod,
        extendPages,

        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    };
};

export default UseMonthCalendarPages;