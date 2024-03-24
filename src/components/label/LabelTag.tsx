import * as React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, Bases, Typography, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';

type LabelTagProps = {
    text: string,
    backgroundColor: string,
    onPressDeleteButton?: () => void,
}

const LabelTag: React.FC<LabelTagProps> = ({text, backgroundColor, onPressDeleteButton, }) => {

    return (
        <View style={[styles.container, {backgroundColor}]}>
            <Text style={[styles.label, Typography.subheader.x10]}>{text.toLocaleUpperCase()}</Text>

            { onPressDeleteButton && (
                <Pressable onPress={onPressDeleteButton} hitSlop={6}>
                    <Icon name="close-circle" size={13} color={Colors.neutral.white} library='Ionicons'/>
                </Pressable>
            )}
        </View>
    )
}
export default LabelTag;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.vertical,
        flexDirection: 'row',
        gap: 3,

        paddingLeft: 10,
        paddingRight: 6,
        paddingVertical: 3,
        borderRadius: Outlines.borderRadius.small,
    },
    label: {
        textAlign: 'center',
        paddingRight: 4,
        color: Colors.neutral.white,
    }
});