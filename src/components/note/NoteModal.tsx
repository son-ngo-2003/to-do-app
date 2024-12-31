import * as React from 'react';
import {useTheme} from '@react-navigation/native';
import {Keyboard, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Bases, Layouts, Outlines, Typography} from '../../styles';
import Modal from 'react-native-modal';

//components
import {Icon, KeyboardOptimizeView, Overlay} from '../atomic';
import {LabelsList} from '../label';
import {TextEditor} from '../textEditor';
import {EditorBridge} from "@10play/tentap-editor";
import {type AlertFunctionType, useAlertProvider} from "../../hooks";
import AlertModal from "../atomic/AlertModal";
import formReducer, {FormAction, FormActionKind} from "../../reducers/formReducer";
import {createInitialNote, fromStateToNote} from "../../helpers/formState";
import {NoteFormState} from "../../types/formStateType";

type NoteModalProps = {
    mode: 'add' | 'edit',
    note?: Note,
    visible?: boolean,

    onAddNote?: (note: Partial<Note>) => void, //only Partial<Note> cause id, createdAt, updatedAt, completedAt will be added by service, not by user
    onUpdateNote?: (note: Partial<Note>) => void,
    onCancel?: (draftNote: Partial<Note>, alert: AlertFunctionType) => Promise<any>,
        //when press turn off modal or when press outside of modal, draft note is what user has changed but not yet press add or update
        //alert is a function to show alert modal, it will be used to ask user if they want to save changes or not
        //onCancel should return called alert function (which return a promise) to wait for user response
    onChangeNote?: (task: Partial<Note>) => void, //this will call every time there is a change in at least one field of the task, avoid this, only use final value when user press update (onPressUpdate)

    onModalHide?: () => void,
    onModalWillHide?: () => void,
    onModalShow?: () => void,
    onModalWillShow?: () => void,
}

const sizeButton : number = 25;

const NoteModal: React.FC<NoteModalProps> = ({ 
    mode,
    note, 
    visible = true,

    onAddNote,
    onUpdateNote,
    onCancel,
    onChangeNote,

    onModalHide,
    onModalWillHide,
    onModalShow,
    onModalWillShow,
}) => {
    const [ noteFormState, dispatch ] = React.useReducer(formReducer<NoteFormState>, note, createInitialNote);
    const { colors } = useTheme();
    const todayDate: string = (new Date()).toLocaleDateString();

    const {
        alert,
        modalVisible, alertProps
    } = useAlertProvider();

    const onPressAdd = React.useCallback( () => {
        if (Keyboard.isVisible()) return;
        onAddNote?.(fromStateToNote(noteFormState));
    }, [onAddNote, noteFormState]);

    const onPressUpdate = React.useCallback(() => {
        if (Keyboard.isVisible()) return;
        onUpdateNote?.(fromStateToNote(noteFormState));
    }, [onUpdateNote, noteFormState]);

    const onPressCancel = React.useCallback(() => {
        if (Keyboard.isVisible()) return;
        return onCancel?.(fromStateToNote(noteFormState), alert)
    }, [onCancel, alert, noteFormState]);

    const dispatchNoteForm = React.useCallback( (action: FormAction<NoteFormState>) => {
        dispatch(action);
        const newNoteFromState = formReducer<NoteFormState>(noteFormState, action);
        onChangeNote?.(fromStateToNote(newNoteFromState));
    },[dispatch, noteFormState, onChangeNote]);

    const onChangeTitle = React.useCallback((newTitle: string) => {
        dispatchNoteForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'title', value: newTitle}});
    },[dispatchNoteForm])

    const onChangeTextEditor = React.useCallback((editor: EditorBridge) => {
        editor.getHTML().then((html) => {
            dispatchNoteForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'content', value: html}});
        });
    }, [dispatchNoteForm]);

    const onChangeLabels = React.useCallback((newListLabels: Label[]) => {
        dispatchNoteForm({type: FormActionKind.UPDATE_LIST, payload: {field: 'listLabels', value: newListLabels}});
    }, [dispatchNoteForm]);

    React.useEffect(() => {
        if (note) {
            dispatchNoteForm({type: FormActionKind.UPDATE_ALL, payload: createInitialNote(note)});
        }
    }, [note]);

    return (
        <KeyboardOptimizeView>
            <Modal isVisible={visible} hasBackdrop={true} avoidKeyboard={false}
                   animationIn={'fadeInUpBig'} animationInTiming={500} animationOut={'fadeOutDownBig'} animationOutTiming={500}
                   onModalHide={onModalHide} onModalWillHide={onModalWillHide} onModalShow={onModalShow} onModalWillShow={onModalWillShow}

                   customBackdrop={<Overlay onPress={onPressCancel} background={'highOpacity'}/>}
            >
                {/* Modal parts */}
                <View style={[styles.modalContainer, {backgroundColor: colors.card}]}>
                        
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
                    <Text style={[{color: colors.text, opacity: 0.6}]}>
                        {
                            mode === 'add'
                            ? 'Today: ' + todayDate
                            : note?.updatedAt
                                ? 'Last modified: ' + note.updatedAt.toLocaleDateString()
                                : 'Created at: ' + note?.createdAt.toLocaleDateString()
                        }
                    </Text>
                    <TextInput style={[styles.title, {color: colors.text}]} multiline={true}
                                onChangeText={onChangeTitle} value={noteFormState.title}
                                placeholder='Press here to add title to your note'/>

                    {/* Labels */}
                    <LabelsList
                        withAddButton={true}
                        withDeleteButton={true}
                        setListLabels={(newLabels) => onChangeLabels(newLabels)}
                        chosenLabelsList={noteFormState.listLabels}
                    />

                    <View style={[styles.decorationLine, {backgroundColor: colors.border}]}></View>

                    {/* Content */}
                    <View style={[styles.textEditorContainer]}>
                        <TextEditor
                            initialContent={noteFormState.content}
                            placeholder='Write something ...'
                            onChange={onChangeTextEditor} //TODO: check autosave and update this onChange
                        />
                    </View>

                </View>

                {
                    alertProps &&
                    <AlertModal
                        {...alertProps}
                        visible={modalVisible}
                    />
                }
            </Modal>
        </KeyboardOptimizeView>
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