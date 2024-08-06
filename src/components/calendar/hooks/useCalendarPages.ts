import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import * as React from "react";

interface UseCalendarPagesProps {
    minDate?: Date | string | dayjs.Dayjs,
    maxDate?: Date | string | dayjs.Dayjs,

    typePage: 'month' | 'period' | 'week',
    numberOfDays?: number, //only apply for period
    referenceOfPeriod?: Date | string | dayjs.Dayjs, //reference for every start of period, not including for month
}

const UseCalendarPages = ({
      minDate,
      maxDate,
      typePage,
      numberOfDays = 7,
      referenceOfPeriod
}: UseCalendarPagesProps) => {
    const _referenceOfPeriod = useMemo(() => dayjs(referenceOfPeriod), [referenceOfPeriod]);

    const getPeriod = React.useCallback ((date?: dayjs.Dayjs | string | Date) => {
        if (typePage === 'month') {
            return dayjs(date).startOf('month');
        } else if (typePage === 'week'  || ( typePage === 'period' && numberOfDays === 7 && !referenceOfPeriod )) {
            return dayjs(date).startOf('isoWeek');
        }

        let deltaPeriod = Math.floor( dayjs(date).diff(_referenceOfPeriod, 'days', true) / numberOfDays );
        return _referenceOfPeriod.add( deltaPeriod * numberOfDays, 'days');
    }, [referenceOfPeriod, numberOfDays]);

    const _minDate = useMemo(() => getPeriod(minDate), [minDate]);
    const _maxDate = useMemo(() => { console.log(getPeriod(maxDate).format('DD-MM-YYYY')) ; return getPeriod(maxDate)}, [maxDate]);

    const _generateListDate = useCallback(() => {
        let pages : dayjs.Dayjs[] = [];
        let thisDate = _minDate;

        while (thisDate.isSameOrBefore(_maxDate)) {
            pages.push( thisDate );
            thisDate =  typePage === 'month'
                ? thisDate.add(1, 'month')
                :   typePage === 'week'
                    ? thisDate.add(1, 'week')
                    : thisDate.add(numberOfDays, 'days');
        }

        return pages;
    }, [typePage, numberOfDays, _minDate, _maxDate]);


    const pagesRef = useRef(_generateListDate());
    const [ pagesLength, setPagesLength ] = useState( pagesRef.current.length );

    useEffect(() => {
        pagesRef.current = _generateListDate();
        setPagesLength(pagesRef.current.length);
    }, [_minDate, _maxDate, typePage, numberOfDays]);

    const getIndexOfPage = useCallback((date?: dayjs.Dayjs | string | Date) => {
        if (typePage === 'month') {
            return Math.floor(dayjs(date).diff(_minDate, 'months'));
        }
        if (typePage === 'week' || ( typePage === 'period' && numberOfDays === 7 && !referenceOfPeriod )) {
            return Math.floor(dayjs(date).diff(_minDate, 'weeks'));
        }

        return Math.floor(dayjs(date).diff(_minDate, 'days', true) / numberOfDays);
    }, []);

    const isOutOfRange = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        return getPeriod(date).isBefore(_minDate) ? 'left' : getPeriod(date).isAfter(_maxDate) ? 'right' : 'none';
    }, []);

    const isOnEdgePages = useCallback((date?: dayjs.Dayjs | string | Date) : 'left' | 'right' | 'none' => {
        return getIndexOfPage(date) === 0 ? 'left' : getIndexOfPage(date) === pagesLength - 1 ? 'right' : 'none';
    }, []);

    return {
        getPeriod,
        pagesRef,
        pagesLength,
        isOutOfRange,
        isOnEdgePages,
        getIndexOfPage,
    };
};

export default UseCalendarPages;