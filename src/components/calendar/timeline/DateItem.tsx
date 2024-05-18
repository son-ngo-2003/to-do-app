import moment from 'moment';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet, DimensionValue } from 'react-native';
import Animated, 
    { useSharedValue, useAnimatedStyle, interpolateColor, 
} from 'react-native-reanimated';

//constants
import { DATE_ITEM_WIDTH, DOT_SIZE } from '../constants';

//styles
import { Colors, Outlines, Typography, Animations as Anim } from '../../../styles';
import { type TaskTimeline } from '../type';

type DateItemProps = {
    thisDay: number,
    thisMonth: number,
    thisYear: number,

    thisDayOfWeek: number,
    listDateNames: string[],

    width: DimensionValue,

    onPress: () => void,
    showMarked?: boolean,
    taskListThisDay?: TaskTimeline[],
    isSelected?: boolean,
    isCurrentMonth?: boolean,
}

const DateItem: React.FC<DateItemProps> = ({
    thisDay,
    thisMonth,
    thisYear,
    taskListThisDay,
    
    thisDayOfWeek,
    listDateNames,

    onPress,
    isSelected,

    width,
}) => {
    const { colors } = useTheme();
    const colorProgress = useSharedValue<number>(0);
    const isToday = React.useMemo(() => moment([thisYear, thisMonth, thisDay]).isSame(moment(), 'date'), [thisDay, thisMonth, thisYear]);

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.background, colors.primary ], 'RGB',
            )
        };
    });

    const renderDots : () => React.ReactNode = () => {
        return (
            <View style={[styles.listDot]}>
                {taskListThisDay && taskListThisDay.map( task => (
                    <View key={task.id} style={[styles.dot, {backgroundColor: task.color}]}/>
                ))}
            </View>
        )
    }

    React.useEffect(() => {
        if (isSelected) {
            colorProgress.value = Anim.timing<number>(1).easeIn.fast;
        } else {
            colorProgress.value = Anim.timing<number>(0).easeIn.fast;
        }
    }, [isSelected])

    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    return (
        <AnimatedPressable 
            style={[
                styles.dayTextContainer,
                containerAnimatedStyles,
                {width},
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.dayText,
                {...Typography.header.x40, fontSize: 21, color: colors.text},
                isToday && {color: Colors.primary.blue},
                isSelected && {color: Colors.neutral.white},
            ]}>{thisDay}</Text>

            <Text style={[styles.dayText, 
                {...Typography.body.x10, color: colors.text, lineHeight: 15},
                isToday && {color: Colors.primary.blue},
                isSelected && {color: Colors.neutral.white},
            ]}>{listDateNames[thisDayOfWeek - 1]}</Text>

            {renderDots()}
        </AnimatedPressable>
    )
}

export default React.memo(DateItem);

const styles = StyleSheet.create({
    backgroundItem: {
        width: '100%',
        paddingVertical: 4,    
    },
    dayTextContainer: {
        borderRadius: Outlines.borderRadius.base,
        paddingVertical: 5,
        marginBottom: 2,
    },
    dayText: {
        alignItems: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    listDot: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        height: 8,
        gap: 2,
        overflow: 'hidden',
        marginTop: 2,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: 2,
    }
});