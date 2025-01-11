import * as React from 'react';
import {Text, View, Pressable, StyleSheet, ViewProps, ViewStyle} from 'react-native';
import { Colors, Typography, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';

type LabelTagProps = {
    text: string,
    textColor?: string,
    color: string,
    onPressDeleteButton?: () => void,
    style?: ViewStyle,
}

const LabelTag: React.FC<LabelTagProps> = ({text, color, onPressDeleteButton, textColor, style}) => {
    const _textColor = textColor || Colors.neutral.white;

    return (
        <View style={[styles.container, { backgroundColor: color  }, style]}>
            <Text style={[styles.label, Typography.subheader.x10, {color: _textColor}]}>{text.toLocaleUpperCase()}</Text>

            { onPressDeleteButton && (
                <Pressable onPress={onPressDeleteButton} hitSlop={6}>
                    <Icon name="close-circle" size={13} color={_textColor} library='Ionicons'/>
                </Pressable>
            )}
        </View>
    )
}
export default LabelTag;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,

        paddingLeft: 10,
        paddingRight: 6,
        paddingVertical: 3,
        borderRadius: Outlines.borderRadius.small,
    },
    label: {
        textAlign: 'center',
        paddingRight: 4,
    }
});