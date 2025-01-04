import * as React from 'react';
import {useTheme} from '@react-navigation/native';
import { Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Bases, Layouts, Outlines, Typography} from '../../styles';
import { debounce } from "lodash";

//components
import {Icon, KeyboardDismissableView, Overlay, ModalButton, type ButtonMode, BaseModal} from '../atomic';
import {LabelsList} from '../label';
import {TextEditor} from '../textEditor';
import {EditorBridge} from "@10play/tentap-editor";
import {type AlertFunctionType, useAlertProvider} from "../../hooks";
import AlertModal from "../atomic/AlertModal";
import formReducer, {FormAction, FormActionKind} from "../../reducers/formReducer";
import {
    createInitialNote,
    fromStateToNote,
    isNoteStateEmpty,
    isStateOfNote, isStateOfTask,
    isTaskStateEmpty
} from "../../helpers/formState";
import {NoteFormState} from "../../types/formStateType";
import {useNotesData} from "../../controllers";

type NoteModalProps = {
    mode: 'add' | 'edit',
    noteId?: Note['_id'],
    visible?: boolean,

    onAddNote?: (note: Note) => void, //only Partial<Note> cause id, createdAt, updatedAt, completedAt will be added by service, not by user
    onUpdateNote?: (note: Note) => void,
    onCancel?: (draftNote: Partial<Note>, isEdited: boolean, alert: AlertFunctionType) => Promise<any>,
        //when press turn off modal or when press outside of modal, draft note is what user has changed but not yet press add or update
        //alert is a function to show alert modal, it will be used to ask user if they want to save changes or not
        //onCancel should return called alert function (which return a promise) to wait for user response
    onChangeNote?: (task: Partial<Note>) => void, //this will call every time there is a change in at least one field of the task, avoid this, only use final value when user press update (onPressUpdate)

    onModalHide?: () => void,
    onModalWillHide?: () => void,
    onModalShow?: () => void,
    onModalWillShow?: () => void,
}

export type NoteModalRef = {
    close: () => void,
}

const sizeButton : number = 25;

const NoteModal = React.forwardRef<NoteModalRef, NoteModalProps>(({
    mode,
    noteId,
    visible = true,

    onAddNote,
    onUpdateNote,
    onCancel,
    onChangeNote,

    onModalHide,
    onModalWillHide,
    onModalShow,
    onModalWillShow,
}, ref) => {
    const { getNoteById, addNote, updateNote } = useNotesData(false);
    const [ originalNote, setOriginalNote ] = React.useState<Note | undefined>(undefined);
    const [ noteFormState, dispatch ] = React.useReducer(formReducer<NoteFormState>, undefined, createInitialNote);
    const [ isEdited, setIsEdited ] = React.useState<boolean>(false);
    const [ buttonMode, setButtonMode ] = React.useState<ButtonMode>(mode);
    const { colors } = useTheme();
    const todayDate: string = (new Date()).toLocaleDateString();

    const {
        alert,
        modalVisible, alertProps
    } = useAlertProvider();

    const dispatchNoteForm = React.useCallback( (action: FormAction<NoteFormState>) => {
        dispatch(action);
        const newNoteFromState = formReducer<NoteFormState>(noteFormState, action);
        onChangeNote?.(fromStateToNote(newNoteFromState));
    },[dispatch, noteFormState, onChangeNote]);

    const onPressAdd = React.useCallback( async () => {
        try {
            setButtonMode('loading');

            const note = fromStateToNote(noteFormState);
            const newNote = await addNote(note);
            dispatchNoteForm({type: FormActionKind.UPDATE_ALL, payload: createInitialNote(newNote)});
            setOriginalNote(newNote);
            onAddNote?.(newNote);

            setButtonMode('added');
        } catch (e) {
            console.error(e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while adding note!',
            });
            setButtonMode('add');
        }

    }, [onAddNote, noteFormState, setButtonMode, addNote, alert, setOriginalNote, dispatchNoteForm]);

    const onPressUpdate = React.useCallback( async () => {
        try {
            setButtonMode('loading');

            const note = fromStateToNote(noteFormState);
            const newNote = await updateNote?.(note);
            dispatchNoteForm({type: FormActionKind.UPDATE_ALL, payload: createInitialNote(newNote)});
            setOriginalNote(newNote);
            onUpdateNote?.(newNote);

            setButtonMode('edited');
        } catch (e) {
            console.error(e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while updating note!',
            });
            setButtonMode('edit');
        }
    }, [noteFormState, setButtonMode, updateNote, alert, setOriginalNote, dispatchNoteForm, onUpdateNote]);

    const onPressCancel = React.useCallback( async () => {
        return onCancel?.(fromStateToNote(noteFormState), isEdited, alert)
    }, [onCancel, alert, noteFormState, isEdited]);

    const onChangeTitle = React.useCallback((newTitle: string) => {
        dispatchNoteForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'title', value: newTitle}});
    },[dispatchNoteForm])

    const onChangeTextEditor = React.useCallback((editor: EditorBridge) => {
        editor.getHTML().then((html) => {
            dispatchNoteForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'content', value: html}});
        });
    }, [dispatchNoteForm]);

    const onChangeLabels = React.useCallback((newListLabels: Label[]) => {
        dispatchNoteForm({type: FormActionKind.UPDATE_LIST, payload: {field: 'labels', value: newListLabels}});
    }, [dispatchNoteForm]);

    React.useImperativeHandle(ref, () => ({
        close: onPressCancel,
    }), [onPressCancel]);

    React.useEffect(() => {
        if (!visible) {return }
        setButtonMode(mode);
        if (noteId) {
            getNoteById(noteId).then((note) => {
                dispatchNoteForm({type: FormActionKind.UPDATE_ALL, payload: createInitialNote(note)});
                setOriginalNote(note);
                console.log(note)
            });
        } else {
            dispatchNoteForm({type: FormActionKind.UPDATE_ALL, payload: createInitialNote()});
            setOriginalNote(undefined);
        }
    }, [noteId, mode, visible]);

    const checkIsEdited = debounce(() => {
        const _isEdited = buttonMode == 'add'
            ? !isNoteStateEmpty(noteFormState)
            : !!originalNote && !isStateOfNote(noteFormState, originalNote) ;
        setIsEdited(_isEdited);
        if (_isEdited && (buttonMode === 'added' || buttonMode === 'edited')) {
            setButtonMode('edit');
        }
    }, 200);

    React.useEffect(() => {
        if (buttonMode === 'edit' && !originalNote) { return }
        checkIsEdited();
    }, [noteFormState, originalNote]);

    return (
        <BaseModal isVisible={visible} hasBackdrop={true} avoidKeyboard={false}
                   animationIn={'fadeInUpBig'} animationInTiming={500} animationOut={'fadeOutDownBig'} animationOutTiming={300}
                   onModalHide={onModalHide} onModalWillHide={onModalWillHide} onModalShow={onModalShow} onModalWillShow={onModalWillShow}

                   customBackdrop={<Overlay onPress={onPressCancel} background={'highOpacity'}/>}
        >
            <KeyboardDismissableView>
                {/* Modal parts */}
                <View style={[styles.modalContainer, {backgroundColor: colors.card}]}>

                    {/* Add/Edit and Close Buttons */}
                    <View style={[styles.buttonsContainer]}>
                        <ModalButton mode={buttonMode}
                            isDisabled={!isEdited} size={sizeButton}
                            onPress={{add: onPressAdd, edit: onPressUpdate}}
                        />

                        <Pressable  onPress={onPressCancel} hitSlop={6}>
                            <Icon name="window-close" size={sizeButton} color={colors.text} library='MaterialCommunityIcons'/>
                        </Pressable>
                    </View>

                    {/* Title  */}
                    <Text style={[{color: colors.text, opacity: 0.6}]}>
                        {
                            mode === 'add'
                            ? 'Today: ' + todayDate
                            : originalNote?.updatedAt
                                ? 'Last modified: ' + originalNote.updatedAt.toLocaleDateString()
                                : 'Created at: ' + originalNote?.createdAt.toLocaleDateString()
                        }
                    </Text>
                    <TextInput style={[styles.title, {color: colors.text}]} multiline={true}
                                onChangeText={onChangeTitle} value={noteFormState.title}
                                placeholder='Press here to add title to your note'/>

                    {/* Labels */}
                    <LabelsList
                        withAddButton={true}
                        withDeleteButton={true}
                        onChangeList={onChangeLabels}
                        chosenLabelsList={noteFormState.labels}
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
            </KeyboardDismissableView>
        </BaseModal>
    )
});

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