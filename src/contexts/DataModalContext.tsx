import React from "react";
import {AlertFunctionType} from "../hooks";
import {
    LabelModal,
    LabelModalProps,
    NoteModal,
    NoteModalProps,
    SequentialModals,
    TaskModal,
    TaskModalProps
} from "../components";
import {
    ALERT_OPTION_NOT_SAVED_FOR_LABEL_MODAL,
    ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL,
    ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL
} from "../constant";
import {useLabelsData, useNotesData, useTasksData} from "../controllers";
import {TaskModalRef, NoteModalRef, LabelModalRef} from "../components";

type DataModalType = 'note' | 'task' | 'label' | 'none'

type DataModalContextProps = {
    visibleModal: DataModalType,
    showModal: (modal: Exclude<DataModalType, 'none'>) => void,
    hideModal: () => void,
    setDataModal: (modal: Exclude<DataModalType, 'none'>, dataId: string | undefined, mode: 'edit' | 'add') => void,

    updateProps: (props: useDataModalProps) => void,
};
const dataModalContext = React.createContext<DataModalContextProps | undefined>(undefined);

interface DataModalProviderProps {
    children: React.ReactNode;
}

export const DataModalProvider : React.FC<DataModalProviderProps>  = ({ children }) => {
    const { addLabel, updateLabel } = useLabelsData();
    const { addNote, updateNote  } = useNotesData();
    const { addTask, updateTask } = useTasksData(false);

    const [visibleModal, setVisibleModal] = React.useState<DataModalType>('none');
    const [mode, setMode] = React.useState<'edit' | 'add'>('add');
    const [noteModalProps, setNoteModalProps] = React.useState<Partial<NoteModalProps>>({});
    const [taskModalProps, setTaskModalProps] = React.useState<Partial<TaskModalProps>>({});
    const [labelModalProps, setLabelModalProps] = React.useState<Partial<LabelModalProps>>({});

    const [noteId, setNoteId] = React.useState<Note['_id']>();
    const [taskId, setTaskId] = React.useState<Task['_id']>();
    const [labelId, setLabelId] = React.useState<Label['_id']>();

    const noteModalRef = React.useRef<NoteModalRef>(null);
    const taskModalRef = React.useRef<TaskModalRef>(null);
    const labelModalRef = React.useRef<LabelModalRef>(null);

    const showModal = React.useCallback( (modal: Exclude<DataModalType, 'none'>) => {
        if (visibleModal !== 'none') {
            let promise: Promise<any> | undefined;
            switch (visibleModal) {
                case 'note':
                    promise = noteModalRef.current?.close();
                    break;
                case 'task':
                    promise = taskModalRef.current?.close();
                    break;
                case 'label':
                    promise = labelModalRef.current?.close();
                    break;
            }
            promise?.then((alertButtonResult) => {
                if (alertButtonResult === undefined) return; // User close the modal by pressing X or outside of modal
                setVisibleModal(modal);
            });
            return;
        }
        setVisibleModal(modal);
    }, [visibleModal, setVisibleModal]);

    const hideModal = React.useCallback(() => {
        setVisibleModal('none');
    }, [setVisibleModal]);

    const setDataModal = React.useCallback( (modal: Exclude<DataModalType, 'none'>, id: string | undefined, mode: 'edit' | 'add') => {
        switch (modal) {
            case 'note':
                setNoteId(id);
                break;
            case 'task':
                setTaskId(id);
                break;
            case 'label':
                setLabelId(id);
                break;
        }
        setMode(mode);
    }, [setMode, setNoteId, setTaskId, setLabelId]);

    const updateProps = React.useCallback( (props: useDataModalProps) => {
        //compare with previous props and update if needed
        setNoteModalProps(props.noteModalProps || {});
        setTaskModalProps(props.taskModalProps || {});
        setLabelModalProps(props.labelModalProps || {});
    }, [setNoteModalProps, setTaskModalProps, setLabelModalProps]);

    const onCancelNoteModal = React.useCallback((draftNote: Partial<Note>, isEdited: boolean, alert: AlertFunctionType) => {
        if (!isEdited) {
            setVisibleModal('none');
            return Promise.resolve();
        }

        return alert({
            ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL,
            primaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL.primaryButton,
                onPress: () => {
                    mode == 'add' && addNote(draftNote).then((note) => noteModalProps.onAddNote?.(note))
                        .catch((error) => {
                            alert({
                                type: 'error', title: 'Error', message: error.message, useCancel: false,
                                secondaryButton: {text: 'OK', onPress: () => {}},
                                primaryButton: {visible: false},
                            })
                    });
                    
                    mode == 'edit' && updateNote(draftNote).then((note) => noteModalProps.onUpdateNote?.(note))
                        .catch((error) => {
                            alert({
                                type: 'error', title: 'Error', message: error.message, useCancel: false,
                                secondaryButton: {text: 'OK', onPress: () => {}},
                                primaryButton: {visible: false},
                            })
                    });
                }
            },
            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL.secondaryButton,
                onPress: () => {
                    setVisibleModal('none');
                }
            }
        });
    }, [addNote, setVisibleModal, mode, noteModalProps, updateNote]);

    const onCancelTaskModal = React.useCallback((draftTask: Partial<Task>,  isEdited: boolean,  alert: AlertFunctionType) => {
        if (!isEdited) {
            setVisibleModal('none');
            return Promise.resolve();
        }

        return alert({
            ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL,

            primaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL.primaryButton,
                onPress: () => {
                    mode == 'add' && addTask(draftTask).then((task) => taskModalProps.onAddTask?.(task))
                        .catch((error) => {
                            alert({
                                type: 'error', title: 'Error', message: error.message, useCancel: false,
                                secondaryButton: {text: 'OK', onPress: () => {}},
                                primaryButton: {visible: false},
                            })
                        });

                    mode == 'edit' && updateTask(draftTask).then((task) => taskModalProps.onUpdateTask?.(task))
                        .catch((error) => {
                            alert({
                                type: 'error', title: 'Error', message: error.message, useCancel: false,
                                secondaryButton: {text: 'OK', onPress: () => {}},
                                primaryButton: {visible: false},
                            })
                        });
                },
            },

            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL.secondaryButton,
                onPress: () => {
                    setVisibleModal('none')
                },
            },
        });
    }, [addTask, setVisibleModal, mode, taskModalProps, updateTask]);

    const onCancelLabelModal = React.useCallback((draftLabel: Partial<Label>, isEdited: boolean, alert: AlertFunctionType) => {
        if (!isEdited) {
            setVisibleModal('none');
            return Promise.resolve();
        }

        return alert({
            ...ALERT_OPTION_NOT_SAVED_FOR_LABEL_MODAL,
            primaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_LABEL_MODAL.primaryButton,
                onPress: () => {
                    mode == 'add' && addLabel(draftLabel).then((label) => labelModalProps.onAddLabel?.(label))
                        .catch((error) => {
                            alert({
                                type: 'error', title: 'Error', message: error.message, useCancel: false,
                                secondaryButton: {text: 'OK', onPress: () => {}},
                                primaryButton: {visible: false},
                            })
                        });

                    mode == 'edit' && updateLabel(draftLabel).then((label) => labelModalProps.onAddLabel?.(label))
                        .catch((error) => {
                            alert({
                                type: 'error', title: 'Error', message: error.message, useCancel: false,
                                secondaryButton: {text: 'OK', onPress: () => {}},
                                primaryButton: {visible: false},
                            })
                        });
                }
            },
            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_LABEL_MODAL.secondaryButton,
                onPress: () => {
                    setVisibleModal('none');
                }
            }
        });
    }, [setVisibleModal, mode, addLabel, labelModalProps, updateLabel]);

    const contextValue = React.useMemo(() => ({visibleModal, showModal, hideModal, setDataModal, updateProps}), [visibleModal, showModal, hideModal, setDataModal, updateProps]);
    return (
        <dataModalContext.Provider value={contextValue}>
            {children}
            <SequentialModals
                currentIndex={ ['note', 'task', 'label'].findIndex( s => s === visibleModal) }
                modals={[
                    <NoteModal
                        {...noteModalProps}
                        ref={noteModalRef}

                        mode={ mode }
                        noteId={ noteId }
                        onCancel={ onCancelNoteModal }
                    />,

                    <TaskModal
                        {...taskModalProps}
                        ref={taskModalRef}

                        mode={ mode }
                        taskId={ taskId }
                        onCancel={onCancelTaskModal}
                    />,

                    <LabelModal
                        {...labelModalProps}
                        ref={labelModalRef}

                        mode={ mode }
                        labelId={ labelId }
                        onCancel={onCancelLabelModal}
                    />
                ]}
            />
        </dataModalContext.Provider>
    )
};

interface useDataModalProps {
    noteModalProps?: Partial<NoteModalProps>,
    taskModalProps?: Partial<TaskModalProps>,
    labelModalProps?: Partial<LabelModalProps>,
}

export const useDataModal = ( props : useDataModalProps ) => {
    const context = React.useContext(dataModalContext);
    if (!context) {
        throw new Error('useDataModal must be used within a DataModalProvider');
    }

    React.useEffect(() => {
        context.updateProps(props);
    }, []);

    // const { updateProps, ...rest } = context;
    return context;
}