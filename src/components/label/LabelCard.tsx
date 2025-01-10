import * as React from 'react';
import {Text, View, Pressable, StyleSheet, ViewStyle, TouchableOpacity} from 'react-native';
import { Colors, Bases, Typography, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';

type LabelCardProps = {
    label: Label,
    numberOfNotes?: number,
    numberOfTasks?: number,
    numberOfCompletedTasks?: number,

    onPress?: (label: Label) => void,
    onPressDelete?: (label: Label) => void,
    onPressEdit?: (label: Label) => void,

    style?: ViewStyle,
}

export const LABEL_CARD_HEIGHT = 160;

const LabelCard: React.FC<LabelCardProps> = ({
    label,
    numberOfNotes = 0,
    numberOfTasks = 0,
    numberOfCompletedTasks = 0,

    onPress,
    onPressDelete,
    onPressEdit,

    style
}) => {
    const onPressCard = React.useCallback(() => {
        onPress?.(label);
    },[onPress, label]);

    const onPressDeleteButton = React.useCallback(() => {
        onPressDelete?.(label);
    },[onPressDelete, label]);

    const onPressEditButton = React.useCallback(() => {
        onPressEdit?.(label);
    },[onPressEdit, label]);

    return (
        <TouchableOpacity  onPress={onPressCard}
                    style={[styles.container, {backgroundColor: label.color}, style]}>
            <View style={[styles.buttonsContainer]}>
                <Pressable  onPress={onPressEditButton}
                            style={Bases.flip.horizontal}  hitSlop={6}>
                    <Icon name="pencil" size={20} color={Colors.neutral.white} library='Octicons'/>
                </Pressable>

                <Pressable onPress={onPressDeleteButton} hitSlop={6}>
                    <Icon name="window-close" size={25} color={Colors.neutral.white} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>

            <View style={[styles.headingCover]}>
                <Text style={[Typography.header.x40, styles.heading,]}>{label.name}</Text>
            </View>

            <Text style={[Typography.body.x10, styles.info, ]}>{`${numberOfNotes} notes`}</Text>
            <Text style={[Typography.body.x10, styles.info, ]}>{`${numberOfTasks} tasks (${numberOfCompletedTasks} completed)`}</Text>
            <Text style={[Typography.body.x10, styles.info, ]}>{`Created: ${label.createdAt?.toLocaleDateString()}`}</Text>
        </TouchableOpacity>
    )
}
export default LabelCard;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: LABEL_CARD_HEIGHT,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: Outlines.borderRadius.large,
    },
    headingCover: {
        justifyContent: 'center',
        height: 50,
    },
    heading: {
        ...Typography.lineHeight.x20,
        marginTop: 6,
        color: Colors.neutral.white,
        letterSpacing: 0.1,
    },
    info: {
        lineHeight: 17,
        color: Colors.neutral.white,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        width: '100%',
    }
});