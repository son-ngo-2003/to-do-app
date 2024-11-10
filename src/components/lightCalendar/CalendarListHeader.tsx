import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

//components
import { Typography } from '../../styles';
import { MONTH_NAME_FULL } from './constants';
import { Icon } from '../atomic';
import { type ScrollType } from './type';


export type CalendarListHeaderProps = {
    selectDateString: string,
    currentMonth: number,
    currentYear: number,

    onPressLeft: () => void,
    onPressRight: () => void,

    canScroll?: ScrollType
    styleNumber?: 1 | 2,
}

const CalendarListHeader: React.FC<CalendarListHeaderProps> = ({
    selectDateString,
    currentMonth,
    // currentYear,

    onPressLeft,
    onPressRight,

    canScroll = {left: true, right: true},
    styleNumber = 1,
}) => {
    const { colors } = useTheme();

    const renderStyle = (styleNumber: number) => {
        switch (styleNumber) {
            case 1:
                return (
                    <View style={[styles.customHeader ]}>
                        <View style={[styles.info]}>
                            <Text style={[Typography.header.x50,
                                {color: colors.text}]}
                            >{MONTH_NAME_FULL[currentMonth]}</Text>

                            <Text style={[Typography.subheader.x40,
                                {color: colors.text, opacity: 0.5}]}
                            >{selectDateString}</Text>
                        </View>

                        <View style={[styles.buttonsContainer]}>
                            <TouchableOpacity onPress={onPressLeft}
                                              disabled={!canScroll.left}
                                style={{opacity: canScroll.left ? 1 : 0.3}}
                            >
                                <Icon name="chevron-left" size={20} color={colors.text} library='FontAwesome5'/>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onPressRight}
                                              disabled={!canScroll.right}
                                style={{opacity: canScroll.right ? 1 : 0.3}}
                            >
                                <Icon name="chevron-right" size={20} color={colors.text} library='FontAwesome5'/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            case 2:
                return (
                    <View style={[styles.customHeader ]}>
                        <TouchableOpacity onPress={onPressLeft}
                                          disabled={!canScroll.left}
                            style={{opacity: canScroll.left ? 1 : 0.3}}
                        >
                            <Icon name="chevron-left" size={20} color={colors.text} library='FontAwesome5'/>
                        </TouchableOpacity>

                        <Text style={[Typography.header.x45,
                            {color: colors.text}]}
                        >{MONTH_NAME_FULL[currentMonth]}</Text>

                        <TouchableOpacity onPress={onPressRight}
                                          disabled={!canScroll.right}
                            style={{opacity: canScroll.right ? 1 : 0.3}}
                        >
                            <Icon name="chevron-right" size={20} color={colors.text} library='FontAwesome5'/>
                        </TouchableOpacity>
                    </View>
                )
        }
    }

    return renderStyle(styleNumber);
}

export default CalendarListHeader;

const styles = StyleSheet.create({
    customHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 4,
        width: '100%',
    },
    info: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    modalContainer: {

    }
});