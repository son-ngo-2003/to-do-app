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

    const [_minDate, _maxDate] = useMemo(() => {
        const start = getPeriod(minDate);
        const end = getPeriod(maxDate);
        return start.isAfter(end) ? [end, start] : [start, end]; // Hoán đổi nếu minDate > maxDate
    }, [minDate, maxDate, getPeriod]);

    const pages = useMemo(() => {
        const totalMonths = _maxDate.diff(_minDate, "month") + 1;
        return Array.from({ length: totalMonths }, (_, i) => _minDate.add(i, "month"));
    }, [_minDate, _maxDate]);

    const getIndexOfPage = useCallback((date?: dayjs.Dayjs | string | Date) => {
        // return Math.floor(dayjs(date).diff(_minDate, 'months'));
        return Math.max(0, Math.min(pages.length - 1, dayjs(date).diff(_minDate, "months")));
    }, []);

    const isOutOfRange = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        return getPeriod(date).isBefore(_minDate) ? 'left' : getPeriod(date).isAfter(_maxDate) ? 'right' : 'none';
    }, []);

    const isOnEdgePages = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        const index = getIndexOfPage(date);
        if (index === 0) return "left";
        if (index === pages.length - 1) return "right";
        return "none";
    }, []);

    return {
        getPeriod,
        pages,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    };
};

export default UseMonthCalendarPages;