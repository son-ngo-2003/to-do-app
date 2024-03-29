import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

//components
import { LabelSelectItem, AddLabelCard, LabelModal, 
        NoteCard, NoteModal
} from '../../components/';


//Services
import { LabelService, NoteService } from '../../services';
import StorageService from '../../services/StorageService'
import { Message } from '../../services/models';

import { Colors, Bases, Typography } from '../../styles';

const HomeScreen : React.FC = () => {
    const [ isOpenModal, setIsOpenModal ] = React.useState<boolean>(false);
    const { colors } = useTheme();
    const [newLabel, setNewLabel] = React.useState<Label>();
    const [newLabel2, setNewLabel2] = React.useState<Label>();
    const [newNote, setNewNote] = React.useState<Note>();

    React.useEffect(() => {
        StorageService.clearAllData('label');

        const pro1 = LabelService.addLabel({name: "WORKING", color: Colors.primary.orange})
        const pro2 = LabelService.addLabel({name: "STUDY", color: Colors.primary.teal});
        const pro3 = LabelService.addLabel({name: "FREE TIME", color: Colors.primary.red});

        Promise.all([pro1, pro2, pro3]).then((messages) => {
            const l1 = messages[0].getData();
            const l2 = messages[1].getData();
            const l3 = messages[2].getData();

            setNewLabel(l1);
            setNewLabel2(l2);

            NoteService.addNote({
                title: "New Note",
                content: "Lorem ipsum dolor sit amet, consecte adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et netus et malesuada fames ac turpis egestas maecenas. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Felis bibendum ut tristique et egestas quis ipsum. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam. Auctor neque vitae tempus quam pellentesque nec nam.",
                labels: [l1, l2, l3],
            }).then((message: Message<Note>) => {
                setNewNote(message.getData());
            });
        });
    },[]);

    return (
        <View style={styles.container}>
    
            <Text style={[styles.title]}>Welcome to the Home Screen!</Text>
            <View style={{width: '45%'}}>
                {newLabel && <LabelSelectItem label={newLabel} onPress={()=>{setIsOpenModal(true)}} isSelectedAtFirst/>}

            </View> 
            {   isOpenModal &&
                <NoteModal
                    mode="edit"
                    setIsOpenModal={setIsOpenModal}
                    note={newNote}
                ></NoteModal>
            }
            {newNote && <NoteCard note={newNote} orientation='portrait' showLabels={true}/>}
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