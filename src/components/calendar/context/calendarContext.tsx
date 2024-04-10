import React, { createContext, PropsWithChildren, useState } from "react";
import moment from 'moment';

import { type CalendarContextType } from ".";

export const CalendarContext = createContext<CalendarContextType>({ 
    mode: 'month',
});

export const CalendarProvider : React.FC<PropsWithChildren> = ({children}) => {
    return (
        <CalendarContext.Provider value={{mode: 'month'}}>
            {children}
        </CalendarContext.Provider>
    )
}