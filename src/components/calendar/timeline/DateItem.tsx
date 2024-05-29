import dayjs from 'dayjs';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, StyleSheet, DimensionValue } from 'react-native';
import { useSharedValue, useAnimatedStyle, interpolateColor, 
} from 'react-native-reanimated';
import { AnimatedPressable } from '../../../helpers/animated';

//constants
import { DOT_SIZE } from '../constants';

//styles
import { Colors, Outlines, Typography, Animations as Anim } from '../../../styles';
import { type TaskTimeline } from '../type';
import { useTraceUpdate } from '../../../hooks';

type DateItemProps = {
    thisDate: Date | string,
    onPress: () => void,

    listDateNames: string[],
    taskListThisDay?: TaskTimeline[],
    
    isSelected?: boolean,
    isToday?: boolean,
    
    width: DimensionValue,
}

const DateItem: React.FC<DateItemProps> = (props) => {
    const {
        thisDate,
        onPress,
        
        listDateNames,
        taskListThisDay ,
    
        isSelected = false,
        isToday = false,
    
        width,
    } = props;

    useTraceUpdate(props);

    const { colors } = useTheme();
    const colorProgress = useSharedValue<number>(0);
    const thisDay = React.useMemo(() => dayjs(thisDate), [thisDate]);

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.background, colors.primary ], 'RGB',
            )
        };
    });

    const renderDots : () => React.ReactNode = () => {
        return (
            taskListThisDay &&
            <View style={[styles.listDot]}>
                {taskListThisDay.map( task => (
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
            ]}>{ thisDay.date() }</Text>

            <Text style={[styles.dayText, 
                {...Typography.body.x10, color: colors.text, lineHeight: 15},
                isToday && {color: Colors.primary.blue},
                isSelected && {color: Colors.neutral.white},
            ]}>{listDateNames[ thisDay.isoWeekday() - 1]}</Text>

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