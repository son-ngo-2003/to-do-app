import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';

//constants
import { DATE_NAME_FULL, DATE_NAME_3, DATE_NAME_2, DATE_NAME_1, DATE_ITEM_WIDTH, MONTH_NAME_3 } from '../constants';
import { Typography } from '../../../styles';

type CalendarHeaderProps = {
    thisMonth: number,
    thisYear: number,
    dateNameType?: 'full' | '3 letters' | '2 letters' | '1 letter',
    showMonth?: boolean
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    thisMonth,
    thisYear,
    dateNameType = '3 letters',
    showMonth = true,
}) => {
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

        for (let i = 0; i < 7; i++) {
            dates.push( 
                <Text key={i} style={[styles.dayText, 
                                    {...Typography.body.x30, color: colors.text}]}
                >{listDateName[i]}</Text>
            )
        }
        return dates;
    }

    return (
        <View style={[styles.headerContainer]}>
            {   showMonth && 
                <View style={[styles.titleContainer]}>
                    <Text
                        style={[{color: colors.text}, Typography.header.x50]}
                    >{  MONTH_NAME_3[thisMonth] }</Text>

                    <Text
                        style={[{color: colors.text, opacity: 0.5}, Typography.subheader.x40]}
                    >{  thisYear }</Text>
                </View>
            }
            <View style={[styles.dateNameContainer]}>
                {renderText()}
            </View>
            <View style={[styles.decorationLine, {backgroundColor: colors.border}]}/>
        </View>
    )
}

export default React.memo(CalendarHeader);

const styles = StyleSheet.create({
    headerContainer : {
        width: '100%',
        alignItems: 'center',
    },
    dateNameContainer: {
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
    dayText: {
        width: DATE_ITEM_WIDTH,
        alignItems: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginVertical: 8,
    },
    decorationLine: {
        width: '100%',
        height: 1,
    }
});