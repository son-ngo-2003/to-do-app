import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Outlines } from '../../styles';
import Animated, 
    { ZoomIn
} from 'react-native-reanimated';
import { useTraceUpdate} from "../../hooks";

import { Icon } from '../atomic';
import {AnimatedPressable} from "../../helpers/animated";

type NoteInTaskItemProps = {
    note?: Note,
    onPressItemWithNote?: (note: Note) => void,
    onPressDelete?: (note: Note) => void,
    onPressAddNote?: () => void,
}

const NoteInTaskItem: React.FC<NoteInTaskItemProps> = (props) => {
    const {
        note,
        onPressItemWithNote,
        onPressDelete,
        onPressAddNote,
    } = props;

    // useTraceUpdate(props);

    const { dark, colors } = useTheme();

    const _onPressDelete = React.useCallback(() => {
        note && onPressDelete?.(note);
    }, [ onPressDelete, note]);

    return (
        note
        ?   <AnimatedPressable  onPress={() => onPressItemWithNote?.(note)}
                                style={[styles.container,
                                        {backgroundColor: dark ? Colors.neutral.s500 : Colors.neutral.s100}] }
                                entering={ ZoomIn.springify().mass(0.65) }
            >
                <Icon name='sticky-note-o' size={20} color={colors.text} library='FontAwesome'/>
                <Text style={[Typography.body.x40, styles.info, {color: colors.text}]} numberOfLines={2}
                    >{`${note.title}`}</Text>
                <Pressable onPress={_onPressDelete}>
                    <Icon name='trash-can-outline' size={24} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </AnimatedPressable>
        :   <AnimatedPressable  onPress={onPressAddNote}
                                  style={[styles.container,
                                      {backgroundColor: dark ? Colors.neutral.s500 : Colors.neutral.s100}] }
                entering={ZoomIn.springify().mass(0.65) }
            >
                <Icon name='add-circle-outline' size={20} color={colors.text} library='Ionicons'/>
                <Text style={[Typography.body.x40, styles.info, {color: colors.text}]} numberOfLines={2}
                >Add Note To Your Task</Text>
            </AnimatedPressable>
    )
}
export default React.memo( NoteInTaskItem );

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 45,
        paddingHorizontal: 15,
        borderRadius: Outlines.borderRadius.base,
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        flexShrink: 2,
        flexGrow: 2,
        paddingHorizontal: 12,
    }
});