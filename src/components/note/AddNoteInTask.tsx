import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Outlines, Animations as Anim } from '../../styles';

import NoteModal from './NoteModal'

type AddNoteInTaskProps = {
    onAddNote: (note: Note) => void,
}

const AddNoteInTask: React.FC<AddNoteInTaskProps> = ({ 
    onAddNote,
}) => {
    const [ isShowNoteModal, setIsShowNoteModal ] = React.useState<boolean>(false);
    const { dark, colors } = useTheme();

    return (
        <>
            <Pressable  onPress={() => setIsShowNoteModal(true)} 
                        style={[styles.container, 
                                {backgroundColor: dark ? Colors.neutral.s800 : Colors.neutral.s100}] }>
                <Text style={[Typography.subheader.x30, styles.info]} numberOfLines={2}
                    >{`Add Note To Your Task`}</Text>
            </Pressable>

            {
                isShowNoteModal &&
                <NoteModal
                    mode="add"
                    setIsOpenModal={setIsShowNoteModal}
                    onAddNote={onAddNote}
                ></NoteModal>
            }
        </>
    )
}
export default AddNoteInTask;

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
        textAlign: 'center',
    }
});