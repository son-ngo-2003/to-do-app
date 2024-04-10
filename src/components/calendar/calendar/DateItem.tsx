import moment from 'moment';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import Animated, 
    { useSharedValue, useAnimatedStyle, interpolateColor, 
} from 'react-native-reanimated';

//constants
import { DATE_ITEM_WIDTH, DOT_SIZE } from '../constants';

//styles
import { Colors, Outlines, Typography, Animations as Anim } from '../../../styles';
import { background } from '../../../styles/colors';

export type MarkedObject = {
    key: string,
    color: string,
}

export type SelectedType = 'one-date' | 'range-start' | 'range-end' | 'range-between' | 'none';

type DateItemProps = {
    thisDay: number,
    thisMonth: number,
    thisYear: number,

    onPress: () => void,
    showMarked?: boolean,
    markedThisDate?: MarkedObject[],
    selectedType?: SelectedType,
    isCurrentMonth?: boolean,
}

const DateItem: React.FC<DateItemProps> = ({
    thisDay,
    thisMonth,
    thisYear,

    onPress,
    showMarked = false,
    markedThisDate,
    selectedType = 'none',
    isCurrentMonth = true,
    
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

    const renderDot : () => React.ReactNode = React.useCallback(() => {
        return (
            <View style={[styles.listDot]}>
                {markedThisDate &&  markedThisDate.map((item: MarkedObject) => (
                    <View key={item.key} style={[styles.dot, {backgroundColor: item.color}]} />
                ))}
            </View>
        )
    }, [markedThisDate]);

    React.useEffect(() => {
        if (selectedType != 'none') {
            colorProgress.value = Anim.timing<number>(1).easeIn.fast;
        } else {
            colorProgress.value = Anim.timing<number>(0).easeIn.fast;
        }
    }, [selectedType])

    return (
        <Pressable 
            style={[styles.dateContainer]}
            onPress = {onPress}
        >
            <Animated.View 
                style={[styles.backgroundItem, 
                    , (selectedType == 'range-start') && styles.backgroundItem_start
                    , (selectedType == 'range-end')   && styles.backgroundItem_end
                    , (selectedType == 'one-date')    && styles.backgroundItem_one,
                    containerAnimatedStyles
            ]}>
                <Text style={[styles.dayText, 
                    {...Typography.body.x40, color: colors.text},
                    (!isCurrentMonth) && {opacity: 0.4},
                    (isToday)         && {...Typography.subheader.x40, opacity: 1, color: Colors.primary.blue},
                    (selectedType != 'none')      && {...Typography.subheader.x40, opacity: 1, color: Colors.neutral.white},
                ]}>{ thisDay < 10 ? `0`+thisDay : thisDay  }</Text>
                {showMarked && renderDot()}
            </Animated.View>
        </Pressable>
    )
}

export default React.memo(DateItem);

const styles = StyleSheet.create({
    dateContainer: {
        width: DATE_ITEM_WIDTH,
        alignItems: 'center',
        marginVertical: 2,
    },
    backgroundItem: {
        width: '100%',
        paddingVertical: 4,    
    },
    backgroundItem_one: {
        borderRadius: Outlines.borderRadius.base,
    },
    backgroundItem_start: {
        borderTopLeftRadius: Outlines.borderRadius.base,
        borderBottomLeftRadius: Outlines.borderRadius.base,
    },
    backgroundItem_end: {
        borderTopRightRadius: Outlines.borderRadius.base,
        borderBottomRightRadius: Outlines.borderRadius.base,
    },
    dayText: {
        textAlign: 'center',
    },
    listDot: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        height: 8,
        gap: 2,
        overflow: 'hidden',
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: 2,
    }
});