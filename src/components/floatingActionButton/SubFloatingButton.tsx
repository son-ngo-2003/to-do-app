import {StyleSheet} from "react-native";
import Icon from "../atomic/Icon";
import {Bases} from "../../styles";
import React from "react";
import Animated, {
    runOnJS
} from "react-native-reanimated";

import {
    ICON_SIZE_PERCENT,
    SIZE_ACTION_BUTTON, SIZE_SUB_ACTION_BUTTON
} from "./constants";
import {
    Gesture, GestureDetector,
} from "react-native-gesture-handler";
import {useTheme} from "@react-navigation/native";

export type SubFloatingActionProps = {
    icon: {name: string, library: string}
    onPress?: () => void,
    style?: any,
    animatedStyle?: any,
}

const SubFloatingAction: React.FC<SubFloatingActionProps> = ({
    icon,
    onPress,
    style,
    animatedStyle,
}) => {
    const { colors } = useTheme();

    const tapGesture = React.useMemo(() =>
        Gesture.Tap().onStart(() => {
            onPress && runOnJS(onPress)();
        })
    , [onPress]);

    return (
        <Animated.View
            style={ [ Bases.circle(SIZE_SUB_ACTION_BUTTON), { backgroundColor: colors.border }, styles.actionButton, style, animatedStyle ] }>
            <GestureDetector gesture={tapGesture}>
                <Icon name={icon.name} library={icon.library} size={SIZE_SUB_ACTION_BUTTON * ICON_SIZE_PERCENT} color={colors.text} />
            </GestureDetector>
        </Animated.View>
    )
}

export default SubFloatingAction;

const styles = StyleSheet.create({
    actionButton: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    }
})