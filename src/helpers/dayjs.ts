import dayjs from "dayjs";

//plugins
import IsoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import objectSupport from 'dayjs/plugin/objectSupport'
import customParseFormat from 'dayjs/plugin/customParseFormat'

export const dayjsSetup = () => {
    dayjs.extend(IsoWeek);
    dayjs.extend(isBetween);
    dayjs.extend(isSameOrAfter);
    dayjs.extend(isSameOrBefore);
    dayjs.extend(objectSupport);
    dayjs.extend(customParseFormat);
}
