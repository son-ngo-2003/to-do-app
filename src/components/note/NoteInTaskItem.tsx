import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Outlines, Animations as Anim } from '../../styles';
import Animated, 
    { ZoomIn
} from 'react-native-reanimated';
import { LabelsList } from '../label';

import { Icon } from '../atomic';

type NoteInTaskItemProps = {
    note: Note,
    onPressItem: (note: Note) => void,
    onPressDelete: (note: Note) => void,
}

const NoteInTaskItem: React.FC<NoteInTaskItemProps> = ({ 
    note,
    onPressItem,
    onPressDelete,
}) => {
    const { dark, colors } = useTheme();

    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    return (
        <AnimatedPressable  onPress={() => onPressItem(note)} 
                            style={[styles.container, 
                                    {backgroundColor: dark ? Colors.neutral.s800 : Colors.neutral.s100}] }
                            entering={ZoomIn.springify()}>
            <Icon name='note-text-outline' size={22} color={colors.text} library='MaterialCommunityIcons'/>
            <Text style={[Typography.subheader.x30, styles.info]} numberOfLines={2}
                >{`${note.title}`}</Text>
            <Pressable onPress={() => onPressDelete(note)}>
                <Icon name='trash-can-outline' size={24} color={colors.text} library='MaterialCommunityIcons'/>
            </Pressable>
        </AnimatedPressable>
    )
}
export default NoteInTaskItem;

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