import React, { ComponentType, PropsWithChildren } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ViewProps,
    KeyboardAvoidingViewProps, Keyboard,
} from 'react-native';

import {eventEmitter, EventNames} from "../../utils/eventUtil";
import {TapGestureHandler} from "react-native-gesture-handler";

function KeyboardOptimizeHOC (
    Comp: ComponentType<PropsWithChildren<KeyboardAvoidingViewProps>>
) {
    return ( {children, ...props}: React.PropsWithChildren<ViewProps> ) => (
        // <TouchableWithoutFeedback
        //     onPress={(e)=>{
        //         Keyboard.dismiss();
        //         eventEmitter.emit(EventNames.DismissKeyboard, {
        //             pressCoordinate: {y: e.nativeEvent.locationY, x: e.nativeEvent.locationX}
        //         });
        //     }}
        //     accessible={false}
        // >
        //     <Comp {...props} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        //         {children}
        //     </Comp>
        // </TouchableWithoutFeedback>
        <TapGestureHandler onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === 5) { // 5: GestureHandlerStates.END
                Keyboard.dismiss();
                eventEmitter.emit(EventNames.DismissKeyboard);
            }
        }}>
            <Comp {...props} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {children}
            </Comp>
        </TapGestureHandler>
    );
}

export default KeyboardOptimizeHOC(KeyboardAvoidingView);
