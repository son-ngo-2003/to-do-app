import {StyleSheet, PanResponder} from "react-native";
import Icon from "../atomic/Icon";
import {Bases, Colors, Animations as Anim} from "../../styles";
import React from "react";
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDecay
} from "react-native-reanimated";

import {
    BUTTON_CLAMP_X,
    BUTTON_CLAMP_Y,
    FAB_ROTATION_CLOSE,
    FAB_ROTATION_OPEN,
    ICON_SIZE_PERCENT,
    SIZE_ACTION_BUTTON
} from "./constants";
import {clamp} from "lodash";
import {
    Gesture, GestureDetector,
} from "react-native-gesture-handler";

type FloatingButtonProps = {
    initialPosition: {x: number, y: number}
    deltaPosition?: {dx: number, dy: number}, // position is not always correct (like because of AppHeader), this will help to adjust it

    initialPositionSetImmediate?: boolean,
    onPress?: () => void,
    onDrag?: ( currentPosition: {x: number, y:number}, change: {dx: number, dy: number} ) => void, //also call when decaying
    onEndDrag?: ( newPosition: {x: number, y:number} ) => void,
    onStartDrag?: () => void,

    isOpened?: boolean,
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
    initialPosition,
    deltaPosition = {dx: 0, dy: 0},
    initialPositionSetImmediate = false,
    onPress,
    onEndDrag,
    onDrag,
    onStartDrag,
    isOpened = false,
}) => {
    const translateX = useSharedValue(initialPosition.x);
    const translateY = useSharedValue(initialPosition.y);
    const rotate = useSharedValue(isOpened ? FAB_ROTATION_OPEN : FAB_ROTATION_CLOSE);
    const isDecayX = useSharedValue(false);
    const isDecayY = useSharedValue(false);

    const tapGesture = React.useMemo(() =>
        Gesture.Tap().onStart(() => {
            onPress && runOnJS(onPress)();
        })
    , [onPress]);

    // PanResponder for drag logic
    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: (_, gesture) => {
                    return Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2;
                },
                onMoveShouldSetPanResponder: (_, gesture) => {
                    return Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2;
                },
                onPanResponderGrant: () => {
                    onStartDrag && runOnJS(onStartDrag)();
                },
                onPanResponderMove: (_, gesture) => {
                    translateX.value = clamp( gesture.moveX - SIZE_ACTION_BUTTON / 2, BUTTON_CLAMP_X[0], BUTTON_CLAMP_X[1] );
                    translateY.value = clamp( gesture.moveY - SIZE_ACTION_BUTTON / 2, BUTTON_CLAMP_Y[0], BUTTON_CLAMP_Y[1] );
                },
                onPanResponderRelease: (_, gesture) => {
                    isDecayX.value = true;
                    isDecayY.value = true;

                    translateX.value = withDecay({
                        velocity: gesture.vx * 300, // Scale velocity to fit screen
                        clamp: BUTTON_CLAMP_X,
                        deceleration: 0.991,
                    }, () => {isDecayX.value = false;});

                    translateY.value = withDecay({
                        velocity: gesture.vy * 300,
                        clamp: BUTTON_CLAMP_Y,
                        deceleration: 0.991,
                    }, () => {isDecayY.value = false;});
                },
            }),
        [onStartDrag]
    );

    // Animated style for smooth updates
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value - deltaPosition.dx },
            { translateY: translateY.value - deltaPosition.dy },
            { rotate: `${rotate.value}deg` },
        ],
    }));

    useAnimatedReaction(() => ({
        isDecay: isDecayX.value || isDecayY.value,
        x: translateX.value,
        y: translateY.value,
    }), ( newState, oldState) => {
        if (!newState.isDecay && oldState?.isDecay) {
            onEndDrag && runOnJS(onEndDrag)({x: newState.x, y: newState.y});
        }
        if (oldState?.x && oldState?.y) {
            onDrag && runOnJS(onDrag)({x: newState.x, y: newState.y}, {dx: newState.x - oldState?.x, dy: newState.y - oldState.y});
        }
    }, []);

    React.useEffect(() => {
        const newPosition = {
            x: clamp( initialPosition.x, BUTTON_CLAMP_X[0], BUTTON_CLAMP_X[1] ),
            y: clamp( initialPosition.y, BUTTON_CLAMP_Y[0], BUTTON_CLAMP_Y[1] ),
        }
        if (initialPositionSetImmediate) {
            translateX.value = newPosition.x;
            translateY.value = newPosition.y;
            return;
        }
        translateX.value = Anim.spring<number>(newPosition.x).base.glacial;
        translateY.value = Anim.spring<number>(newPosition.y).base.glacial;
    }, []);

    React.useEffect(() => {
        rotate.value = Anim.spring<number>(isOpened ? FAB_ROTATION_OPEN : FAB_ROTATION_CLOSE).base.glacial;
    }, [isOpened]);

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={ [ Bases.circle(SIZE_ACTION_BUTTON), styles.actionButton, animatedStyle ] }>
            <GestureDetector gesture={tapGesture}>
                <Icon name={'plus'} size={SIZE_ACTION_BUTTON * ICON_SIZE_PERCENT} color={ Colors.neutral.white } library={'FontAwesome6'}/>
            </GestureDetector>
        </Animated.View>
    )
}

export default FloatingButton;

const styles = StyleSheet.create({
    actionButton: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.yellow,
        zIndex: 100,
    }
})