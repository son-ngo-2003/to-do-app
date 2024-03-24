import * as React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Colors, Bases, Typography, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';
import { useTheme } from '@react-navigation/native';

type NoteCardProps = {
    note: Note,
}

const NoteCardLandscape: React.FC<NoteCardProps> = ({ note }) => {
    const { colors } = useTheme();

    const onPressCard = React.useCallback(() => {
        console.log(note);
    },[]);

    const onPressDeleteButton = React.useCallback(() => {
        console.log("delete label")
    },[]);

    const onPressEditButton = React.useCallback(() => {
        console.log("edit label")
    },[]);

    return (
        <Pressable  onPress={onPressCard}
                    style={[styles.container, {backgroundColor: colors.card}]}>
            <View style={[styles.buttonsContainer]}>
                <Pressable  onPress={onPressEditButton}
                            style={Bases.flip.horizontal}  hitSlop={6}>
                    <Icon name="pencil" size={20} color={colors.text} library='Octicons'/>
                </Pressable>

                <Pressable onPress={onPressDeleteButton} hitSlop={6}>
                    <Icon name="window-close" size={25} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>

            <View style={[styles.headingCover]}>
                <Text style={[Typography.header.x40, styles.heading,]}>{note.title}</Text>
            </View>

            <Text style={[Typography.body.x10, styles.info, ]}>{note.content}</Text>
        </Pressable>
    )
}
export default NoteCardLandscape;

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 150,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
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