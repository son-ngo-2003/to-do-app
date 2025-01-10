import React from "react";
import {Text, View, StyleSheet} from "react-native";
import {AnimatedPressable} from "../../helpers/animated";
import {Animations as Anim, Colors, Outlines, Typography} from "../../styles";
import {useTheme} from "@react-navigation/native";
import {interpolateColor, useAnimatedStyle, useSharedValue} from "react-native-reanimated";

type CheckboxProps = {
    label?: string;
    initialValue?: boolean;
    onPress?: (isChecked: boolean) => void;
}

const Checkbox : React.FC<CheckboxProps> = ({ label, initialValue, onPress }) => {
    const { colors } = useTheme();
    const [isChecked, setIsChecked] = React.useState<boolean>(initialValue || false);
    const colorProgress = useSharedValue<number>(  initialValue ? 1 : 0 );

    const onPressCompletedCheckbox = React.useCallback( () => {
        onPress?.(!isChecked);
        setIsChecked(!isChecked);
    }, [isChecked, onPress, setIsChecked]);

    const checkboxAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.card, Colors.primary.yellow ], 'RGB',
            ),
        };
    });

    React.useEffect(() => {
        colorProgress.value = Anim.timing<number>(isChecked ? 1 : 0).easeIn.fast;
    }, [isChecked]);

    React.useEffect(() => {
        setIsChecked(initialValue || false);
    }, [initialValue]);

    return (
        <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <AnimatedPressable
                style={[styles.checkbox, checkboxAnimatedStyles]}
                hitSlop={15}
                onPress={onPressCompletedCheckbox}
            />
            <Text style={[Typography.body.x30, {color: colors.text, opacity: 0.6}]}>{label}</Text>
        </View>
    )
}

export default Checkbox;

const styles = StyleSheet.create({
    checkbox: {
        width: 17,
        height: 17,
        borderRadius: Outlines.borderRadius.small,
        borderWidth: 1,
        borderColor: Colors.primary.yellow,
    },
});