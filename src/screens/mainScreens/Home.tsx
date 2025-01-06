import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';

//components
import {
    NoteCard, NoteModal,
    TaskModal, TaskTree,
    SequentialModals, AddNoteCard
} from '../../components/';
import { Colors, Typography, Layouts } from '../../styles';
import { type RootStackParamList } from "../../navigation";

//Services
import {AlertFunctionType} from "../../hooks";
import {TaskModalRef} from "../../components/task/TaskModal";
import {
    ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL,
    ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL,
    UNLABELED_KEY
} from "../../constant";
import {AddTaskCard, FloatingActionButton} from "../../components";
import {useNotesData, useLabelsData, useTasksData} from "../../controllers";
import StorageService from "../../services/DAO/StorageService";

type Props = DrawerScreenProps<RootStackParamList, 'Home'>;

const LIMIT_FETCH_NOTE = 8;
const LIMIT_FETCH_TASK = 3;

const HomeScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();

    const { getAllLabels, addLabel, error: errorLabel } = useLabelsData();
    const { getAllNotes, addNote, error: errorNote  } = useNotesData();
    const { getAllTasksGroupByLabels, addTask, error: errorTask } = useTasksData(false);

    const [ tasksByLabel, setTaskByLabel ] = React.useState<Record<Label['_id'], Task[]>>({});
    const [ allNotes, setAllNotes ] = React.useState<Note[]>([]);
    const [ allLabels, setAllLabels ] = React.useState<Label[]>([]);

    React.useEffect(() => {
        StorageService.clearAllData('label');
        StorageService.clearAllData('note');
        StorageService.clearAllData('task');

        Promise.all([
            getAllNotes({limit: LIMIT_FETCH_NOTE}),
            getAllTasksGroupByLabels({date: new Date(), limit: LIMIT_FETCH_TASK, withTasksNoLabel: true}),
            getAllLabels()
        ]).then(([notes, tasksByLabel, labels]) => {
            setAllNotes(notes);
            setTaskByLabel(tasksByLabel);
            setAllLabels(labels);
        });
    }, []);

    const [ modalNoteId, setModalNoteId ] = React.useState<Note['_id']>();
    const [ modalTaskId, setModalTaskId ] = React.useState<Task['_id']>();
    const [ currentModal, setCurrentModal ] = React.useState<'note' | 'task' | 'none'>('none');
    const [ currentMode, setCurrentMode ] = React.useState<'add' | 'edit'>('edit');

    const taskModalRef = React.useRef<TaskModalRef>(null);


    const onPressNoteInTask = React.useCallback((note: Note) => {
        taskModalRef.current?.close().then(( alertButtonResult ) => {
            if (alertButtonResult === undefined) return;
            setModalNoteId(note._id);
            setCurrentModal('note');
            setCurrentMode('edit');
        })
    }, [taskModalRef.current, setCurrentModal, setModalNoteId, setCurrentMode]);

    const onPressAddNote = React.useCallback(() => {
        setModalNoteId(undefined);
        setCurrentModal('note');
        setCurrentMode('add');
    }, [setModalNoteId, setCurrentModal, setCurrentMode]);

    const onPressAddTask = React.useCallback(() => {
        setModalTaskId(undefined);
        setCurrentModal('task');
        setCurrentMode('add');
    }, [setModalTaskId, setCurrentModal, setCurrentMode]);

    const onAddedUpdatedNote = React.useCallback((note: Note) => {
        getAllNotes({limit: LIMIT_FETCH_NOTE, sortBy: 'createdAt', sortOrder: 'desc'}).then(setAllNotes);
        setCurrentModal('none');
    }, [getAllNotes, setAllNotes, setCurrentModal]);

    const onAddedUpdatedTask = React.useCallback((task: Task) => {
        Promise.all([
            getAllTasksGroupByLabels({date: new Date(), limit: LIMIT_FETCH_TASK, withTasksNoLabel: true}),
            getAllLabels()
        ]).then(([tasksByLabel, labels]) => {
            setAllLabels(labels);
            setTaskByLabel(tasksByLabel);
            setCurrentModal('none');
        });
    }, [getAllTasksGroupByLabels, setTaskByLabel, getAllLabels, setAllLabels, setCurrentModal]);

    const onCancelTaskModal = React.useCallback((draftTask: Partial<Task>,  isEdited: boolean,  alert: AlertFunctionType) => {
        if (!isEdited) {
            setCurrentModal('none');
            return Promise.resolve();
        }

        return alert({
            ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL,

            primaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL.primaryButton,
                onPress: () => {
                    addTask(draftTask).then((task) => {
                        onAddedUpdatedTask(task);
                    }).catch((error) => {
                        alert({
                            type: 'error', title: 'Error',
                            message: error.message,
                            secondaryButton: {text: 'OK', onPress: () => {}},
                            primaryButton: {visible: false},
                            useCancel: false,
                        })
                    });
                },
            },

            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL.secondaryButton,
                onPress: () => {
                    setCurrentModal('none')
                },
            },
        });
    }, [setCurrentModal, addTask, onAddedUpdatedTask]);

    const onCancelNoteModal = React.useCallback((draftNote: Partial<Note>, isEdited: boolean, alert: AlertFunctionType) => {
        if (!isEdited) {
            setCurrentModal('none');
            return Promise.resolve();
        }

        return alert({
            ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL,
            primaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL.primaryButton,
                onPress: () => {
                    addNote(draftNote).then((note) => {
                        onAddedUpdatedNote(note);
                    }).catch((error) => {
                        alert({
                            type: 'error', title: 'Error',
                            message: error.message,
                            secondaryButton: {text: 'OK', onPress: () => {}},
                            primaryButton: {visible: false},
                            useCancel: false,
                        })
                    });
                }
            },
            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL.secondaryButton,
                onPress: () => {
                    setCurrentModal('none');
                }
            }
        });
    }, [setCurrentModal, addNote, onAddedUpdatedNote]);

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <FloatingActionButton initialPosition={{x: Layouts.screen.width - 50, y: Layouts.screen.height - 50}}
                subButtons={[
                    {icon: {name: 'sticker-text-outline', library: 'MaterialCommunityIcons'}, onPress: onPressAddNote},
                    {icon: {name: 'checkbox-multiple-marked-outline', library: 'MaterialCommunityIcons'}, onPress: onPressAddTask},
                ]}
            />

            <ScrollView style={[ Layouts.mainContainer ]} showsVerticalScrollIndicator={false}>
                {/* Openning Titre */}
                <View style={[ Layouts.sectionContainer ]}>
                    <Text style={[ Typography.body.x45, {color: colors.text} ]}>Welcome back,</Text>
                    <Text style={[ Typography.header.x60, {color: colors.text} ]}>Let's plan your day!</Text>
                </View>

                {/* Today's Notes */}
                <View style={[Layouts.sectionContainer]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, {color: colors.text}, { textTransform: 'uppercase' } ]}>Recent Notes</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Notes') /*TODO: Press View All will navigate to Notes Screen with ? notes filter*/}>
                            <Text style={[Typography.body.x40, {color: colors.text}, { opacity: 0.6, }]}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={[styles.noteCardsScroller]} horizontal={true}>
                        <View style={[styles.noteCardsContainer]}>
                            {
                                allNotes.length > 0
                                ? allNotes.map((note: Note, index: number) => (
                                    <NoteCard key={index} note={note} orientation={'landscape'} showLabels
                                              onPress={(note) => {setModalNoteId(note._id); setCurrentModal('note'); setCurrentMode('edit')}}
                                    />)
                                    )
                                : <AddNoteCard orientation={'landscape'} onPress={onPressAddNote}/>

                            }
                        </View>
                    </ScrollView>
                </View>

                {/* Today's Tasks */}
                <View style={[Layouts.sectionContainer]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, {color: colors.text}, { textTransform: 'uppercase' } ]}>Today's Tasks</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Tasks') /*TODO: Press View All will navigate to Tasks Screen with today tasks filter*/}>
                            <Text style={[Typography.body.x40, {color: colors.text}, { opacity: 0.6, }]}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[Layouts.fullWidthContainer]}>
                        <View style={[styles.tasksScroller]}>
                            {
                                allLabels.length > 0 || tasksByLabel[UNLABELED_KEY]?.length
                                ? <>
                                    {allLabels.map((label: Label, index: number) => (
                                    <View key={index}>
                                        <Text style={[ Typography.header.x40, { textTransform: 'uppercase', color: label.color } ]}>{label.name}</Text>
                                        <TaskTree
                                            tasks={ tasksByLabel[label._id] ?? [] }
                                            onPressTask = { (task) => {setModalTaskId(task._id); setCurrentModal('task'); setCurrentMode('edit')} }

                                            showShowMoreButton={true}
                                            onPressShowMore={ () => console.log('Task Tree (Home): Show More Tasks') }

                                            colorTree={ label.color }
                                            showLabel={false}
                                        />
                                    </View>)
                                    )}

                                    { tasksByLabel[UNLABELED_KEY] && tasksByLabel[UNLABELED_KEY].length > 0 &&
                                    <View>
                                        <Text style={[ Typography.header.x40, { textTransform: 'uppercase', color: Colors.primary.teal } ]}>Not Labeled</Text>
                                        <TaskTree
                                            tasks={ tasksByLabel[UNLABELED_KEY] }
                                            onPressTask = { (task) => {setModalTaskId(task._id); setCurrentModal('task'); setCurrentMode('edit')} }

                                            showShowMoreButton={ true }
                                            onPressShowMore={ () => console.log('Task Tree (Home): Show More Tasks') }

                                            colorTree={ Colors.primary.teal }
                                            showLabel={false}
                                        />
                                    </View>
                                    }
                                </>
                                : <AddTaskCard onPress={onPressAddTask}/>
                            }
                        </View>
                    </View>

                </View>

                {/*  Modals  */}
                <SequentialModals
                    currentIndex={ currentModal === 'note' ? 0 : currentModal === 'task' ? 1 : undefined }
                    modals={[
                        <NoteModal
                            mode={ currentMode }
                            noteId={ modalNoteId }
                            onCancel={ onCancelNoteModal }
                            onAddNote={ onAddedUpdatedNote }
                            onUpdateNote={ onAddedUpdatedNote}
                        />,

                        <TaskModal
                            ref={taskModalRef}

                            mode={ currentMode }
                            taskId={ modalTaskId }
                            onPressNote={ onPressNoteInTask }
                            onCancel={onCancelTaskModal}
                            onAddTask={onAddedUpdatedTask}
                            onUpdateTask={onAddedUpdatedTask}
                        />
                    ]}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sectionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    noteCardsScroller: {
        paddingVertical: 10,
        overflow: 'visible',
    },
    noteCardsContainer: {
        gap: 20,
        flexDirection: 'row',
    },
    tasksScroller: {
        paddingHorizontal: Layouts.MARGIN_HORIZONTAL,
        marginTop: 10,
    },
});

export default HomeScreen;