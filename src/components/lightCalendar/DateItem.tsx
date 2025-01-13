import dayjs from 'dayjs';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {Text, Pressable, StyleSheet, TextStyle, InteractionManager} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolateColor } from 'react-native-reanimated';

//constants
import { DATE_ITEM_WIDTH } from './constants';

//styles
import { Colors, Outlines, Typography, Animations as Anim } from '../../styles';
import {AnimatedPressable} from "../../helpers/animated";


interface DateItemProps {
    thisDate: string,
    isCurrentMonth?: boolean,
    isSelected?: boolean,
    onPress?: (date: Date, dateString: string) => void,
}

const DateItem: React.FC<DateItemProps> = (props) => {
    const {
        thisDate,
        isCurrentMonth = true,
        isSelected = false,
        onPress,
    } = props;

    const { colors } = useTheme();
    const progress = useSharedValue<number>(0);
    const thisDay = React.useMemo(() => dayjs(thisDate), [thisDate]);
    const isToday = React.useMemo(() => dayjs().isSame(thisDay, 'day'), [thisDay]);

    const onPressDate = React.useCallback( () => {
        onPress?.( thisDay.toDate(), thisDay.format() );
    }, [onPress, thisDay]);

    const containerAnimatedStyles = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor( progress.value, [ 0, 1 ],
            [ `${colors.background}00`, colors.primary ], 'RGB'),
        })
    );

    React.useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            isSelected
                ? (progress.value = Anim.timing<number>(1).easeIn.fast)
                : (progress.value = Anim.timing<number>(0).easeOut.fast);
        });

        return () => task.cancel();
    }, [isSelected]);

    const textStyle : TextStyle[] = React.useMemo(() => {
        let baseStyle : TextStyle[] =  [];
        if (!isCurrentMonth) baseStyle.push({opacity: 0.4});
        if (isToday) baseStyle.push({ ...Typography.subheader.x30, color: Colors.primary.blue });
        if (isSelected) baseStyle.push({ ...Typography.subheader.x30, color: Colors.neutral.white });
        return baseStyle;
    }, [isCurrentMonth, isToday, isSelected]);

    return (
        <AnimatedPressable
            style={[styles.dateContainer, containerAnimatedStyles]}
            onPress = {onPressDate}
        >
            <Text style={[styles.dayText, textStyle]}>{ thisDay.format('DD')  }</Text>
        </AnimatedPressable>
    )
}

export default React.memo(DateItem);

const styles = StyleSheet.create({
    dateContainer: {
        alignItems: 'center',
        marginVertical: 1,
        paddingVertical: 3,
        borderRadius: Outlines.borderRadius.base,
        flex: 1,
    },
    dayText: {
        ...Typography.body.x30,
        textAlign: 'center',
    }
});