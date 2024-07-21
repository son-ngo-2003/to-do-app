import React, { ComponentType, PropsWithChildren } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, ViewProps, KeyboardAvoidingViewProps } from 'react-native';

function KeyboardOptimizeHOC (
    Comp: ComponentType<PropsWithChildren<KeyboardAvoidingViewProps>>
) {
    return ( {children, ...props}: React.PropsWithChildren<ViewProps> ) => (
        <ScrollView contentContainerStyle={{flexGrow: 1}}
                    keyboardShouldPersistTaps='handled'
                    keyboardDismissMode = "on-drag"
        >
            <Comp {...props} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {children}
            </Comp>
        </ScrollView>
    );
}

export default KeyboardOptimizeHOC(KeyboardAvoidingView);
