import * as React from 'react';
import {Text, View, Pressable, StyleSheet, ViewStyle} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Bases, Typography, Outlines } from '../../styles';
import { useTheme } from '@react-navigation/native';

//Components
import { Icon } from '../atomic';
import { LabelTag } from '../label';
import {Textarea} from "../textEditor";
import {useNotesData} from "../../controllers";

type NoteCardProps = {
    note: Note,
    orientation: 'landscape' | 'portrait',
    showLabels?: boolean,

    onPress?: (note: Note) => void,
    onPressDelete?: (note: Note) => void,
    onPressEdit?: (note: Note) => void,

    style?: ViewStyle,
}

export const CARD_DIMENSIONS = {
    portrait: {height: 190},
    landscape: {width: 200, height: 133},
}

export const LABEL_HEIGHT = 40;

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    orientation,
    showLabels = true,

    onPress,
    onPressDelete,
    onPressEdit,

    style,
}) => {
    const { colors } = useTheme();
    const { deleteNote } = useNotesData();

    const dimensions = React.useMemo(() => {
        let dim = {...CARD_DIMENSIONS[orientation]};
        showLabels && (dim.height += LABEL_HEIGHT);
        return dim;
    }, [orientation, showLabels]);

    const onPressCard = React.useCallback(() => {
        onPress?.(note)
    },[onPress, note]);

    const onPressDeleteButton = React.useCallback( async () => {
        try {
            const deletedTask = await deleteNote(note);
            onPressDelete?.(deletedTask);
        } catch (e) {
            console.error('TaskItem.tsx: ', e);
            alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while deleting note',
            });
        }
    },[onPressDelete, note, deleteNote]);

    const onPressEditButton = React.useCallback(() => {
        onPressEdit?.(note)
    },[onPressEdit, note]);

    return (
        <View  style={[styles.container, {backgroundColor: colors.card}, dimensions, style]}>
            <View style={[styles.buttonsContainer]}>
                <Pressable  onPress={onPressEditButton}
                            style={Bases.flip.horizontal}  hitSlop={6}>
                    <Icon name="pencil" size={20} color={colors.text} library='Octicons'/>
                </Pressable>

                <Pressable onPress={onPressDeleteButton} hitSlop={6} style={{transform: [{translateX: 5}]}}>
                    <Icon name="window-close" size={25} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>

            <Pressable onPress={onPressCard}>
                <Text numberOfLines={1} style={[Typography.subheader.x40, styles.heading, {color: colors.text}
                ]}>{note.title}</Text>

                {/*<Text   numberOfLines={orientation === 'portrait' ? 7 : 4}*/}
                {/*        style={[Typography.body.x20, styles.info, */}
                {/*            {color: colors.text}*/}
                {/*]}>{note.content}</Text>*/}

                <Textarea
                    value={note.content}
                    numberOfLines={orientation === 'portrait' ? 7 : 4}
                    textEditorStyle={{...Typography.body.x20, ...styles.info, color: colors.text}}
                />
            </Pressable>

            {
                showLabels && (
                    note.labels.length > 0
                    ? <ScrollView style={[styles.labelsContainer]}
                                contentContainerStyle={styles.labelsContentContainer}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                    >
                        {note.labels.map((label: Label, index) => (
                            <LabelTag key={index} text={label.name} color={label.color}/>
                        ))}
                    </ScrollView>
                    : <View style={[[styles.labelsContainer]]}>
                        <LabelTag text='No Label' color={colors.card} textColor={colors.border}
                            style={{borderColor: colors.border, borderWidth: Outlines.borderWidth.thin}}
                        />
                    </View>
                )

            }
        </View>
    )
}
export default NoteCard;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        paddingVertical: 13,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
    },
    heading: {
        ...Typography.lineHeight.x10,
        marginTop: 8,
        marginBottom: 6,
    },
    info: {
        lineHeight: 15,
        textAlign: 'justify',
        opacity: 0.95,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        width: '100%',
    },
    labelsContainer: {
        //alignItems: 'center',
        width: '100%',
        marginTop: 5,
    },
    labelsContentContainer: {
        alignItems: 'center',
        gap: 10,
    }
});