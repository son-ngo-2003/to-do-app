import moment from 'moment';

export interface CalendarContextType {
    mode: 'month' | 'week' | 'day';
}

export { CalendarContext, CalendarProvider } from './calendarContext';