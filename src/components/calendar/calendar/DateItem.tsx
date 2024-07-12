import dayjs from 'dayjs';
import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import Animated, 
    { useSharedValue, useAnimatedStyle, interpolateColor, interpolate, 
} from 'react-native-reanimated';

//constants
import { DATE_ITEM_WIDTH, DOT_SIZE } from '../constants';

//styles
import { Colors, Outlines, Typography, Animations as Anim } from '../../../styles';
import { type SelectedType, type MarkedObject } from '../type';

//hooks
import { useTraceUpdate } from '../../../hooks';

type DateItemProps = {
    thisDate: string,

    isCurrentMonth?: boolean,
    selectedType?: SelectedType,

    onPress?: (date: Date, dateString: string) => void,
    showMarked?: boolean,
    markedThisDate?: MarkedObject[],
}

const DateItem: React.FC<DateItemProps> = (props) => {
    const {
        thisDate,
        
        isCurrentMonth = true,
        selectedType = 'none',
    
        onPress = () => {},
        showMarked = false,
        markedThisDate, 
        
    } = props;

    // useTraceUpdate(props);

    const { colors } = useTheme();
    const progress = useSharedValue<number>(0);
    const thisDay = React.useMemo(() => dayjs(thisDate), [thisDate]);
    const isToday = React.useMemo(() => dayjs().isSame(thisDay, 'day'), [thisDate]);
    const [ borderRadius, setBorderRadius ] = React.useState({borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0});

    const onPressDate = React.useCallback( () => {
        onPress(thisDay.toDate(), thisDay.format());
    }, [thisDate]);

    const containerAnimatedStyles = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor( progress.value, [ 0, 1 ],
            [ colors.background, colors.primary ], 'RGB'),
        }));

    const renderDot : () => React.ReactNode = React.useCallback(() => {
        return (
            <View style={[styles.listDot]}>
                {markedThisDate &&  markedThisDate.map((item: MarkedObject) => (
                    <View key={item.id} style={[styles.dot, {backgroundColor: item.color}]} />
                ))}
            </View>
        )
    }, [markedThisDate]);


    React.useEffect(() => {
        if (selectedType != 'none') {
            progress.value = Anim.timing<number>(1).easeIn.fast

            switch (selectedType) {
                case 'range-start':
                    setBorderRadius({borderTopLeftRadius: Outlines.borderRadius.base, borderBottomLeftRadius: Outlines.borderRadius.base, borderTopRightRadius: 0, borderBottomRightRadius: 0});
                    break;
                case 'range-end':
                    setBorderRadius({borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: Outlines.borderRadius.base, borderBottomRightRadius: Outlines.borderRadius.base});
                    break;
                case 'one-date':
                    setBorderRadius({borderTopLeftRadius: Outlines.borderRadius.base, borderBottomLeftRadius: Outlines.borderRadius.base, borderTopRightRadius: Outlines.borderRadius.base, borderBottomRightRadius: Outlines.borderRadius.base});
                    break;
            }
        }
        else {
            progress.value = Anim.timing<number>(0).easeIn.fast;
        }    
    }, [selectedType])

    // React.useEffect(() => {
    //     console.log('DateItem' + thisDay.format('DD/MM'))
    // });

    return (
        <Pressable 
            style={[styles.dateContainer]}
            onPress = {onPressDate}
        >
            <Animated.View 
                style={[styles.backgroundItem, 
                    borderRadius,
                    containerAnimatedStyles
            ]}>
                <Text style={[styles.dayText, 
                    {...Typography.body.x40, color: colors.text},
                    (!isCurrentMonth) && {opacity: 0.4},
                    (isToday)         && {...Typography.subheader.x40, opacity: 1, color: Colors.primary.blue},
                    (selectedType != 'none')      && {...Typography.subheader.x40, opacity: 1, color: Colors.neutral.white},
                ]}>{ thisDay.format('DD')  }</Text>
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