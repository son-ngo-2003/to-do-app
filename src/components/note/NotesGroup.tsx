import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {Text, View, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {Typography, Outlines, Colors} from '../../styles';
import {UNLABELED_KEY} from "../../constant";
import NoteCard from "./NoteCard";

type NoteGroupProps = {
    notes: Note[],
    label: Label | typeof UNLABELED_KEY,

    onPressNote?: (note: Note) => void,
    onPressDeleteNote?: (note: Note) => void,

    showShowMoreButton?: boolean,
    onPressShowMore?: () => void,

    showLabelNoteCard?: boolean,
    style?: ViewStyle,
}

const NoteGroup: React.FC<NoteGroupProps> = ({
    notes,
    label,

    onPressNote,
    onPressDeleteNote,

    showShowMoreButton = false,
    onPressShowMore,

    showLabelNoteCard = false,
    style,
}) => {
    const { colors } = useTheme();
    const colorGroup = React.useMemo(() => label === UNLABELED_KEY ? Colors.primary.teal : label.color, [label]);
    const groupTitle = React.useMemo(() => label === UNLABELED_KEY ? 'Not Labeled' : label.name, [label]);

    return (
        <View style={[style, {display: "flex", flexDirection: 'column'}]}>
            <Text style={[ Typography.header.x40, { textTransform: 'uppercase', color: colorGroup } ]}>{groupTitle}</Text>
            <View style={[styles.container]}>
                { notes.map((note: Note, index: number) => (
                    <View key={index} style={[styles.cardContainer,
                        index % 2 === 0 ? {paddingRight: 5} : {paddingLeft: 5}]
                    }>
                        <NoteCard
                            note={note}
                            orientation={'portrait'}

                            onPressEdit={ onPressNote }
                            onPress={ onPressNote }
                            onPressDelete={onPressDeleteNote}

                            showLabels={showLabelNoteCard}
                        />
                    </View>
                ))}
            </View>
            { showShowMoreButton && (
                <TouchableOpacity onPress={onPressShowMore} style={{alignSelf: 'flex-end'}}>
                    <Text style={[Typography.subheader.x30, { color: colorGroup }]}>Show More</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}
export default NoteGroup;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        display: "flex",
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },

    cardContainer: {
        maxWidth: '50%',
        paddingBottom: 10,
    }
});