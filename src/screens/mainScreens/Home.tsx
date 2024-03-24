import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

//components
import { LabelSelectItem, AddLabelCard, LabelModal, NoteCardLandscape } from '../../components/';


//Services
import { LabelService, NoteService } from '../../services';
import { Message } from '../../services/models';

import { Colors, Bases, Typography } from '../../styles';

const HomeScreen : React.FC = () => {
    const [ isOpenModal, setIsOpenModal ] = React.useState<boolean>(false);
    const { colors } = useTheme();
    const [newLabel, setNewLabel] = React.useState<Label>();
    const [newNote, setNewNote] = React.useState<Note>();

    React.useEffect(() => {
        LabelService.addLabel({name: "WORKING", color: 'orange'}).then((message: Message<Label>) => {
            setNewLabel(message.getData());
        });

        NoteService.addNote({
            title: "New Note",
            content: "This is a new note",
            labels: [],
        }).then((message: Message<Note>) => {
            setNewNote(message.getData());
        });
    },[]);

    return (
        <View style={styles.container}>
    
            <Text style={[styles.title]}>Welcome to the Home Screen!</Text>
            <View style={{width: '45%'}}>
                {newLabel && <LabelSelectItem label={newLabel} onPress={()=>{setIsOpenModal(true)}} isSelectedAtFirst/>}

            </View> 
            {   isOpenModal &&
                <LabelModal
                    mode="edit"
                    setIsOpenModal={setIsOpenModal}
                    label={newLabel}
                ></LabelModal>
            }
            {newNote && <NoteCardLandscape note={newNote}/>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default HomeScreen;