import {View, StyleSheet} from "react-native";
import {Animations as Anim} from "../../styles";
import React, {useState} from "react";

import FloatingButton from "./FloatingButton";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import {BUTTONS_GAP, SIZE_ACTION_BUTTON, SIZE_SUB_ACTION_BUTTON} from "./constants";
import SubFloatingAction, {type SubFloatingActionProps} from "./SubFloatingButton";
import {Overlay} from "../atomic";

type ActionButtonProps = {
    initialPosition: {x: number, y: number} // position of the button; x,y will be the center of the button; x: top, y: left
    subButtons: SubFloatingActionProps[],
    onPress?: () => void,
}

const FloatingActionButton: React.FC<ActionButtonProps> = ({
    initialPosition,
    subButtons,
    onPress,
}) => {
    const referencePositionLeft = useSharedValue(0);
    const referencePositionBottom = useSharedValue(0);
    const buttonsGap = useSharedValue(BUTTONS_GAP + (SIZE_ACTION_BUTTON + SIZE_SUB_ACTION_BUTTON) / 2);
    const [isOpened, setIsOpened] = useState<boolean>(false);

    const subButtonsContainerStyle = useAnimatedStyle(()=>({
        bottom: -initialPosition.y - (SIZE_ACTION_BUTTON + SIZE_SUB_ACTION_BUTTON) / 2 + 2,
        left: initialPosition.x + 1,
        gap: buttonsGap.value,
    }), []);

    const renderSubButton = ( subBtn: SubFloatingActionProps, index: number ) => {
        const animatedStyles = useAnimatedStyle(() => ({
            ...subBtn.animatedStyle,
            left: referencePositionLeft.value,
            bottom: referencePositionBottom.value + (index + 1) * buttonsGap.value,
        }));

        const onPress = () => {
            setIsOpened(false);
            subBtn.onPress?.();
        }

        return <SubFloatingAction {...subBtn} animatedStyle={animatedStyles} onPress={onPress} key={index}/>
    }

    const onMainButtonDrag = (_: {x: number, y: number}, change: {dx: number, dy: number}) => {
        referencePositionLeft.value += change.dx;
        referencePositionBottom.value -= change.dy;
    }

    const onMainButtonStartDrag = () => {
        setIsOpened(false);
    }

    React.useEffect(() => {
        buttonsGap.value = Anim.spring<number>( isOpened ? BUTTONS_GAP + (SIZE_ACTION_BUTTON + SIZE_SUB_ACTION_BUTTON) / 2 : 0 ).base.long;
    }, [isOpened]);

    return (
        <View style={{zIndex: 100, position:'absolute'}}>
            <FloatingButton initialPosition={initialPosition} deltaPosition={{dx: 0, dy: 0}}
                            onDrag={onMainButtonDrag} onStartDrag={onMainButtonStartDrag} onPress={() => { setIsOpened(!isOpened); onPress?.() }} isOpened={isOpened}
            />

            <Animated.View style={[styles.subButtonsContainer, subButtonsContainerStyle]}>
                {subButtons.map(renderSubButton)}
            </Animated.View>
            {
                isOpened &&
                <Overlay background={'highOpacity'} onPress={() => {setIsOpened(false)}}/>
            }

        </View>
    )
}

export default React.memo(FloatingActionButton);

const styles = StyleSheet.create({
    subButtonsContainer: {
        backgroundColor: 'red',
        position: 'absolute',
        zIndex: 50,
    }
})