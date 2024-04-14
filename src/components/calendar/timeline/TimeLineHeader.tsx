import moment from 'moment';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet } from 'react-native';

//constants
import { DATE_NAME_FULL, DATE_NAME_3, DATE_NAME_2, DATE_NAME_1, DATE_ITEM_WIDTH, MONTH_NAME_3, TIMELINE_TIME_BAR_WIDTH } from '../constants';
import { Colors, Layouts, Outlines, Typography } from '../../../styles';

type TimeLineHeaderProps = {
    startDay: number,
    startMonth: number,
    startYear: number,
    numberOfDays: number,

    selectedDay?: number,
    onPressDate?: (date: moment.Moment) => void,

    dateNameType?: 'full' | '3 letters' | '2 letters' | '1 letter',
    showMonth?: boolean
}

const TimeLineHeader: React.FC<TimeLineHeaderProps> = ({
    startDay,
    startMonth,
    startYear,
    numberOfDays,

    selectedDay,
    onPressDate = () => {},

    dateNameType = '3 letters',
    showMonth = true,
}) => {
    const startMoment = React.useMemo( () => moment( startYear && startMonth && startDay && [startYear, startMonth, startDay]), [startYear, startMonth, startDay] );
    const { colors } = useTheme();

    function renderText () : React.ReactNode[] {
        const dates: React.ReactNode[] = [];
        
        let listDateName : string[];
        switch (dateNameType) {
            case 'full':
                listDateName = DATE_NAME_FULL;
                break;
            case '3 letters':
                listDateName = DATE_NAME_3;
                break;
            case '2 letters':
                listDateName = DATE_NAME_2;
                break;
            case '1 letter':
                listDateName = DATE_NAME_1;
                break;
            default:
                listDateName = DATE_NAME_3;
                break;
        }

        for (let i = 0; i < numberOfDays; i++) {
            const thisDay = startMoment.clone().add(i, 'days');
            const isToday = thisDay.isSame(moment(), 'day');
            const isSelected = selectedDay === thisDay.date();
            dates.push( 
                <Pressable 
                    key={i}
                    style={[
                        styles.dayTextContainer,
                        {width: `${1/numberOfDays*100}%`},
                        isSelected && {backgroundColor: colors.primary}
                    ]}
                    onPress={() => onPressDate(thisDay)}
                >
                    <Text style={[
                        styles.dayText,
                        {...Typography.header.x40, fontSize: 21, color: colors.text},
                        isToday && {color: Colors.primary.blue},
                        isSelected && {color: Colors.neutral.white},
                    ]}>{thisDay.date()}</Text>

                    <Text style={[styles.dayText, 
                        {...Typography.body.x10, color: colors.text, lineHeight: 15},
                        isToday && {color: Colors.primary.blue},
                        isSelected && {color: Colors.neutral.white},
                    ]}>{listDateName[thisDay.isoWeekday() - 1]}</Text>
                </Pressable>
            )
        }
        return dates;
    }

    return (
        <View style={[styles.headerContainer]}>
            {/* {   showMonth && 
                <View style={[styles.titleContainer]}>
                    <Text
                        style={[{color: colors.text}, Typography.header.x50]}
                    >{  MONTH_NAME_3[thisMonth] }</Text>

                    <Text
                        style={[{color: colors.text, opacity: 0.5}, Typography.subheader.x40]}
                    >{  thisYear }</Text>
                </View>
            } */}
            <View style={[styles.dateNameContainer, ]}>
                {renderText()}
            </View>
            <View style={[styles.decorationLine, {backgroundColor: colors.border}]}/>
        </View>
    )
}

export default TimeLineHeader;

const styles = StyleSheet.create({
    headerContainer : {
        width: '100%',
        alignItems: 'center',
    },
    dateNameContainer: {
        paddingLeft: TIMELINE_TIME_BAR_WIDTH,
        width: '100%',
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    dayTextContainer: {
        borderRadius: Outlines.borderRadius.base,
        paddingVertical: 5,
    },
    dayText: {
        alignItems: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    decorationLine: {
        width: '100%',
        height: 1,
    }
});