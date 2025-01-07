import {AlertModalProps} from "../components/atomic";

export const ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL : AlertModalProps = {
    type: 'warning',
    title: 'Note not saved!',
    message: 'Do you want to save this note?',

    primaryButton: {
        text: 'Save',
    },

    secondaryButton: {
        text: 'Discard',
    },

    useCancel: true,
    onPressCancel: () => {},
}

export const ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL : AlertModalProps = {
    type: 'warning',
    title: 'Task not saved!',
    message: 'Do you want to save this task?',

    primaryButton: {
        text: 'Save',
    },

    secondaryButton: {
        text: 'Discard',
    },

    useCancel: true,
    onPressCancel: () => {},
}

export const ALERT_OPTION_NOT_SAVED_FOR_LABEL_MODAL : AlertModalProps = {
    type: 'warning',
    title: 'Label not saved!',
    message: 'Do you want to save this label?',

    primaryButton: {
        text: 'Save',
    },

    secondaryButton: {
        text: 'Discard',
    },

    useCancel: true,
    onPressCancel: () => {},
}