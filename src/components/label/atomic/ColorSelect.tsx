import * as React from 'react';
import {Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import { Colors, Animations as Anim} from '../../../styles';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { Icon } from '../../atomic';
import { useTheme } from '@react-navigation/native';

type ColorSelectProps = {
    color: string,
    onPress: () => void,
    selectedColor?: string,
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ColorSelect: React.FC<ColorSelectProps> = ({color, onPress, selectedColor }) => {
    const { colors } = useTheme();
    const opacity = useSharedValue<number>(0.3);
    const backgroundColor = React.useMemo(() => Colors.primary[color as Colors.Primary] || colors.background, [color])

    React.useEffect(() => {
        if (selectedColor === color || (color === 'random' && !selectedColor)) {
            opacity.value = Anim.timing<number>(1).easeIn.base;
        } else {
            opacity.value = Anim.timing<number>(0.3).easeIn.base;
        }
    }, [selectedColor])

    return (
        <AnimatedPressable onPress={onPress}
            style={[styles.colorSelect, {opacity, backgroundColor},
                        color === 'random' && {borderWidth: 2}
                    ]}>
            {color === 'random' && <Icon name="question" size={18} color={colors.text} library='FontAwesome6' />}
        </AnimatedPressable>
    )
};

export default React.memo(ColorSelect);

const styles = StyleSheet.create({
    colorSelect: {
        width: 25,
        height: 25,
        borderRadius: 8,
        borderColor: Colors.primary.yellow,

        justifyContent: 'center',
        alignItems: 'center',
    },
});