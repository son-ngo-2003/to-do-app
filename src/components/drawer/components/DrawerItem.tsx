//src: @react-navigation/drawer/views/DrawerItem

import { PlatformPressable } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { Text, View } from 'react-native';

import styles from './DrawerItem.style';

type Props = {
    //href?: string;
    label: string,
    icon?: (props: {
        focused: boolean;
        size: number;
        color: string;
    }) => React.ReactNode;
    focused?: boolean;
    onPress: () => void;
    /**
     * Whether label font should scale to respect Text Size accessibility settings.
     */
    allowFontScaling?: boolean;
    /**
     * ID to locate this drawer item in tests.
     */
    testID?: string;
};

/**
 * A component used to show an action item with an icon and a label in a navigation drawer.
 */
export default function DrawerItem(props: Props) {
    const { colors } = useTheme();

    const {
        //href,
        icon,
        label,
        focused = false,
        allowFontScaling,
        onPress,
        testID,
        ...rest
    } = props;

    const color = focused ? colors.primary : colors.text;
    const iconNode = icon ? icon({ size: 24, focused, color }) : null;

    return (
        <View
            collapsable={false}
            {...rest}
            style={[styles.container]}
        >
            <PlatformPressable
                testID={testID}
                onPress={onPress}
                // accessibilityLabel={accessibilityLabel}
                // accessibilityRole="button"
                // accessibilityState={{ selected: focused }}
                // pressColor={pressColor}
                // pressOpacity={pressOpacity}
                // href={href}
            >
                <View style={[ styles.wrapper ]}>
                    {iconNode}
                    <View style={[styles.label, { marginStart: iconNode ? 16 : 0 }]}>
                        <Text
                            numberOfLines={1}
                            allowFontScaling={allowFontScaling}
                            style={[styles.labelText, { color }]}
                        >
                            {label}
                        </Text>
                    </View>
                </View>
            </PlatformPressable>
        </View>
    );
}