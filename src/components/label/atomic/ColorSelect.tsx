import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Colors, Animations as Anim} from '../../../styles';
import { useSharedValue } from 'react-native-reanimated';
import { Icon } from '../../atomic';
import { useTheme } from '@react-navigation/native';
import {AnimatedPressable} from "../../../helpers/animated";

type ColorSelectProps = {
    color: string,
    onPress: () => void,
    selectedColor?: string,
}

const ColorSelect: React.FC<ColorSelectProps> = ({color, onPress, selectedColor }) => {
    const { colors } = useTheme();
    const opacity = useSharedValue<number>(0.3);
    const backgroundColor = Colors.primary[color as Colors.Primary] || colors.background;

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

export default ColorSelect;

const styles = StyleSheet.create({
    colorSelect: {
        width: 25,
        height: 25,
        borderRadius: 8,
        borderColor: Colors.primary.yellow,
        opacity: 0.3,

        justifyContent: 'center',
        alignItems: 'center',
    },
});