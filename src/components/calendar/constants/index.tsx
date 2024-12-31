// lightCalendar
import {Layouts} from "../../../styles";

export const LENGTH_WEEK_SHOWS = 6;
export const DATE_ITEM_WIDTH = `${100 / 7}%`; // 100% for 7 days a week 
export const DOT_SIZE = 7;

export const CALENDAR_BODY_HEIGHT = 300;
export const CALENDAR_BODY_ONE_WEEK_HEIGHT = 95;

// timeline
export const TIMELINE_CELL_HEIGHT = 40;
export const HOURS_PER_DAY = 24;
export const START_HOUR = 0;
export const END_HOUR = 23;
export const TIMELINE_TIME_BAR_WIDTH = 40;
export const MAX_NUMBER_OF_TASKS_SHOW_EACH_MOMENT = 5;
export const TIMELINE_HEIGHT = {
    'short' : CALENDAR_BODY_ONE_WEEK_HEIGHT,
    'medium' : CALENDAR_BODY_HEIGHT,
    'full' : Layouts.screen.height,
}

// another
export const DATE_NAME_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DATE_NAME_3 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DATE_NAME_2 = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Sa', 'Su'];
export const DATE_NAME_1 = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'S'];

export const MONTH_NAME_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH_NAME_3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];