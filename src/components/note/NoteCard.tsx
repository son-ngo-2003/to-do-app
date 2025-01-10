import * as React from 'react';
import {Text, View, Pressable, StyleSheet, ViewStyle} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Bases, Typography, Outlines } from '../../styles';
import { useTheme } from '@react-navigation/native';

//Components
import { Icon } from '../atomic';
import { LabelTag } from '../label';
import {Textarea, TextEditor} from "../textEditor";

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
    portrait: {height: 200},
    landscape: {width: 240, height: 150},
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
    const dimensions = React.useMemo(() => {
        let dim = {...CARD_DIMENSIONS[orientation]};
        showLabels && (dim.height += LABEL_HEIGHT);
        return dim;
    }, [orientation, showLabels]);

    const onPressCard = React.useCallback(() => {
        onPress?.(note)
    },[onPress, note]);

    const onPressDeleteButton = React.useCallback(() => {
        //TODO: ??
        onPressDelete?.(note)
    },[onPressDelete, note]);

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

                <Pressable onPress={onPressDeleteButton} hitSlop={6}>
                    <Icon name="window-close" size={25} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>

            <Pressable onPress={onPressCard}>
                <Text numberOfLines={2}
                        style={[Typography.header.x40, styles.heading,
                            {color: colors.text}            
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
                showLabels &&
                <ScrollView style={[styles.labelsContainer]}
                            contentContainerStyle={styles.labelsContentContainer}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            >
                    {note.labels.map((label: Label, index) => (
                        <LabelTag key={index} text={label.name} color={label.color}/>
                    ))}
                </ScrollView>
            }
        </View>
    )
}
export default NoteCard;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
    },
    heading: {
        ...Typography.lineHeight.x10,
        marginTop: 10,
    },
    info: {
        lineHeight: 15,
        textAlign: 'justify',
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
        marginTop: 10,
    },
    labelsContentContainer: {
        alignItems: 'center',
        gap: 10,
    }
});