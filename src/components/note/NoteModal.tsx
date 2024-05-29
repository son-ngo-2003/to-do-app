import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Pressable, View, TextInput, StyleSheet, Modal, Text,
         Keyboard } from 'react-native';
import { Typography, Outlines, Layouts, Bases} from '../../styles';
import Animated, { ZoomInEasyDown} from 'react-native-reanimated';

//components
import { Icon, Overlay, KeyboardOptimizeView } from '../atomic';
import { LabelsList } from '../label';
import { TextEditor } from '../textEditor';

type NoteModalProps = {
    mode: 'add' | 'edit',
    note?: Note,
    setIsOpenModal: (isOpen: boolean) => void,
    onAddNote: (note: Note) => void,
}

const sizeButton : number = 25;

const NoteModal: React.FC<NoteModalProps> = ({ 
    mode, 
    note, 
    setIsOpenModal, 
    onAddNote 
}) => {
    const [ title, setTitle ] = React.useState<string>((mode === 'add' || !note) ? '' :  note.title) ;
    const [ content, setContent ] = React.useState<string>((mode === 'add' || !note) ? '' :  note.content) ;
    const [ listLabels, setListLabels ] = React.useState<Label[]>((mode === 'add' || !note) ? [] :  note.labels) ;
    const { colors } = useTheme();
    const todayDate: string = (new Date()).toLocaleDateString();

    const onPressAdd = () => {
        if (Keyboard.isVisible()) return;
        console.log('Add');
        setIsOpenModal(false);
        //TODO: get note from service add, and call onAddNote(note)
    }

    const onPressUpdate = () => {
        if (Keyboard.isVisible()) return;
        console.log('Update');
        setIsOpenModal(false);
    }

    const onPressCancel = () => {
        if (Keyboard.isVisible()) return;
        console.log('Cancel');
        setIsOpenModal(false);
    }

    const onPressAddLabel = () => {
        if (Keyboard.isVisible()) return;
        console.log('Add labels');
        setIsOpenModal(false);
    };

    const onChangeLabels = (newListLabels: Label[]) => {
        setListLabels(newListLabels);
        //TODO: base on auto save then auto update this to storage
    }

    return (
        <Modal transparent={true} animationType='fade'>
            <KeyboardOptimizeView style={styles.container}>
                <Overlay onPress={onPressCancel} background='highOpacity'/>

                {/* Modal parts */}
                <Animated.View style={[styles.modalContainer, {backgroundColor: colors.card}]}
                            entering={ZoomInEasyDown}
                >
                        
                    {/* Add/Edit and Close Buttons */}
                    <View style={[styles.buttonsContainer]}>
                        {
                            mode === 'add'
                            ? 
                                (<Pressable  onPress={onPressAdd} hitSlop={6}>
                                    <Icon name="plus" size={sizeButton} color={colors.text} library='Octicons'/>
                                </Pressable>)
                            :
                                (<Pressable  onPress={onPressUpdate} hitSlop={6}>
                                    <Icon name="cloud-upload" size={sizeButton} color={colors.text} library='SimpleLineIcons'/>
                                </Pressable>)
                        }

                        <Pressable  onPress={onPressCancel} hitSlop={6}>
                            <Icon name="window-close" size={sizeButton} color={colors.text} library='MaterialCommunityIcons'/>
                        </Pressable>
                    </View>

                    {/* Title  */}
                    <Text style={[{color: colors.border}]}>
                        {
                            mode === 'add'
                            ? 'Today: ' + todayDate
                            : note?.updatedAt
                                ? 'Last modified: ' + note.updatedAt.toLocaleDateString()
                                : 'Created at: ' + note?.createdAt.toLocaleDateString()
                        }
                    </Text>
                    <TextInput style={[styles.title, {color: colors.text}]} multiline={true}
                                onChangeText={setTitle} value={title}
                                placeholder='Press here to add title to your note'/>

                    {/* Labels */}
                    <LabelsList
                        withAddButton={true}
                        withDeleteButton={true}
                        setListLabels={(newLabels) => onChangeLabels(newLabels)}
                        choseLabelsList={listLabels}
                    />

                    <View style={[styles.decorationLine, {backgroundColor: colors.border}]}></View>

                    {/* Content */}
                    <View style={[styles.textEditorContainer]}>
                        <TextEditor
                            placeholder='Write something ...'
                            onChange={() => {}} //TODO: check autosave and update this onChange
                        />
                    </View>

                </Animated.View>            

            </KeyboardOptimizeView>
        </Modal>
    )
}
export default NoteModal;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.all,
        ...Layouts.screen,
    },
    modalContainer: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderRadius: Outlines.borderRadius.large,
        overflow: 'hidden',
    },

    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'flex-end',
        gap: 20,
    },


    title: {
        ...Typography.subheader.x50,
    },

    decorationLine: {
        width: '100%',
        height: 1,
        marginTop: 10,
    },

    textEditorContainer: {
        width: '100%',
        height: 300,
    },
});