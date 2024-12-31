import React, { ComponentType, PropsWithChildren } from 'react';
import {
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    ViewProps,
    KeyboardAvoidingViewProps,
    TouchableWithoutFeedback
} from 'react-native';

function KeyboardOptimizeHOC (
    Comp: ComponentType<PropsWithChildren<KeyboardAvoidingViewProps>>
) {
    return ( {children, ...props}: React.PropsWithChildren<ViewProps> ) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Comp {...props} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {children}
            </Comp>
        </TouchableWithoutFeedback>
    );
}

export default KeyboardOptimizeHOC(KeyboardAvoidingView);
