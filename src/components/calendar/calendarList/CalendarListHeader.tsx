import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';

//components
import { Typography } from '../../../styles';
import { MONTH_NAME_FULL } from '../constants';
import { Icon } from '../../atomic';
import { type ScrollType } from '../type';

type CalendarListProps = {
    selectDateString: string,
    currentMonth: number,
    currentYear: number,

    onPressLeft: () => void,
    onPressRight: () => void,
    onPressExpand?: () => void,
    canScroll?: ScrollType
}

const CalendarListHeader: React.FC<CalendarListProps> = ({
    selectDateString,
    currentMonth,
    // currentYear,
    
    onPressLeft = () => {},
    onPressRight = () => {},
    onPressExpand,
    canScroll = {left: true, right: true},
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.customHeader ]}>
            <Animated.View style={[styles.info]} entering={FadeIn}>
                <Text style={[Typography.header.x55,
                    {color: colors.text}]}
                >{MONTH_NAME_FULL[currentMonth]}</Text>

                <Text style={[Typography.subheader.x40, 
                        {color: colors.text, opacity: 0.5}]}
                >{selectDateString}</Text>
            </Animated.View>

            <View style={[styles.buttonsContainer]}>
                <TouchableOpacity onPress={onPressLeft}
                    style={{opacity: canScroll.left ? 1 : 0.3}}
                >
                    <Icon name="chevron-left" size={20} color={colors.text} library='FontAwesome5'/>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onPressRight}
                    style={{opacity: canScroll.right ? 1 : 0.3}}
                >
                    <Icon name="chevron-right" size={20} color={colors.text} library='FontAwesome5'/>
                </TouchableOpacity>

                {
                    onPressExpand &&
                    <TouchableOpacity onPress={onPressExpand}>
                        <Icon name="list" size={28} color={colors.text} library='Entypo'/>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
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
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
});