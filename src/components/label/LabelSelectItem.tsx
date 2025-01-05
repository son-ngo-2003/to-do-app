import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Outlines, Animations as Anim } from '../../styles';
import Animated, 
    { useSharedValue, useAnimatedStyle, interpolateColor, 
} from 'react-native-reanimated';

type LabelSelectItemProps = {
    label: Label,
    onPress: (label: Label, isSelected: boolean) => void,
    isSelected: boolean,
}

const LabelSelectItem: React.FC<LabelSelectItemProps> = ({ label, onPress, isSelected }) => {
    const { colors } = useTheme();
    const colorProgress = useSharedValue<number>( isSelected ? 1 : 0);

    const onPressItem = React.useCallback(() => {
        onPress(label, isSelected);
    }, [onPress, label, isSelected]);

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.background, label.color ], 'RGB',
            ),
            borderWidth: 1-colorProgress.value,
            borderColor: colors.border,
        };
    });

    const checkboxAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.card, Colors.primary.yellow ], 'RGB',
            ),
        };
    });

    React.useEffect(() => {
        colorProgress.value = Anim.timing<number>(isSelected ? 1 : 0).easeIn.base;
    }, [isSelected]);

    return (
        <Pressable  onPress={onPressItem}>
            <Animated.View  style={[styles.container, containerAnimatedStyles]}>
                <Text style={[Typography.subheader.x20, styles.info, 
                                isSelected ? {color: Colors.neutral.white} : {color: colors.text} ]}
                        >{`${label.name}`}</Text>
                <Animated.View style={[styles.checkbox, checkboxAnimatedStyles]}></Animated.View>
            </Animated.View>
        </Pressable>
    )
}
export default LabelSelectItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        width: '100%',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Outlines.borderRadius.base,
    },
    info: {
        lineHeight: 17,
    },
    checkbox: {
        width: 15,
        height: 15,
        borderRadius: Outlines.borderRadius.small,
        borderWidth: 1,
        borderColor: Colors.primary.yellow,
    },
});