import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';

//components
import { LabelSelectItem, AddLabelCard, LabelModal, 
        NoteCard, NoteModal, TaskItem,
        NoteInTaskItem, TaskProgressCard, TaskModal, TaskTree,
        Calendar, CalendarList, Timeline,
        SequentialModals
} from '../../components/';
import { Colors, Typography, Layouts } from '../../styles';
import { type RootStackParamList } from "../../navigation";

//Services
import { NoteService, TaskService, LabelService } from '../../services';
import { Message } from '../../services/models';

import StorageService from "../../services/DAO/StorageService";
import {AlertFunctionType} from "../../hooks";
import {TaskModalRef} from "../../components/task/TaskModal";
import {ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL, ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL} from "../../constant";
import {FloatingActionButton} from "../../components";
import {HEADER_HEIGHT} from "../../constant/navigation";

type Props = DrawerScreenProps<RootStackParamList, 'Home'>;

const HomeScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();

    const textColor = StyleSheet.flatten({
        color: colors.text,
    })

    const [ newNote, setNewNote] = React.useState<Note[]>([]);
    const [ newTask, setNewTask ] = React.useState<Task[]>([]);


    React.useEffect(() => {
        StorageService.clearAllData('label');
        StorageService.clearAllData('note');
        StorageService.clearAllData('task');

        const pro1 = LabelService.addLabel({name: "WORKING", color: Colors.primary.orange})
        const pro2 = LabelService.addLabel({name: "STUDY", color: Colors.primary.teal});
        const pro3 = LabelService.addLabel({name: "FREE TIME", color: Colors.primary.red});

        Promise.all([pro1, pro2, pro3]).then(async (messages: Message<Label>[]) => {
            const l1: Label = messages[0].getData();
            const l2: Label = messages[1].getData();
            const l3: Label = messages[2].getData();

            const noteMsg1 =  await NoteService.addNote({
                title: "Note 1",
                content: "Lorem ipsum dolor sit amet, consecte adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et netus et malesuada fames ac turpis egestas maecenas. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Felis bibendum ut tristique et egestas quis ipsum. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam. Auctor neque vitae tempus quam pellentesque nec nam.",
                labels: [l1, l2, l3],
            });
            const noteMsg2 = await NoteService.addNote({
                title: "Note 2",
                content: "Lorem ipsum dolor sit amet, consecte adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et netus et malesuada fames ac turpis egestas maecenas. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Felis bibendum ut tristique et egestas quis ipsum. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam. Auctor neque vitae tempus quam pellentesque nec nam.",
                labels: [l1],
            });
            let notes = [noteMsg1.getData(), noteMsg2.getData()];
            setNewNote( notes );


            const taskMsg1 = await TaskService.addTask({
                title: "New Task 1, ah, it i",
                note: notes[0],
                labels: [l1, l2],
                start: new Date(),
                end: new Date(),
                isAllDay: false,
                repeat: {value: 5, unit: 'day'},
                isAnnouncement: false,
                isCompleted: false,
            });
            const taskMsg2 = await TaskService.addTask({
                title: "New Task 2, ah, it i",
                note: notes[0],
                labels: [l1],
                start: new Date(),
                end: new Date(),
                isAllDay: false,
                repeat: undefined,
                isAnnouncement: false,
                isCompleted: false,
            });
            const taskMsg3 = await TaskService.addTask({
                title: "New Task 3, ah, it i",
                note: notes[0],
                labels: [l1, l2, l3],
                start: new Date(),
                end: new Date(),
                isAllDay: false,
                repeat: undefined,
                isAnnouncement: false,
                isCompleted: false,
            });

            let newTasks = [taskMsg1.getData(), taskMsg2.getData(), taskMsg3.getData()];
            setNewTask( newTasks );
        });
    },[]);

    const [ tasksByLabel, setTaskByLabel ] = React.useState<Record<Label['_id'], Task[]>>({});
    const [ allLabels, setAllLabels ] = React.useState<Label[]>([]);

    const [ modalNoteId, setModalNoteId ] = React.useState<Note['_id']>();
    const [ modalTaskId, setModalTaskId ] = React.useState<Task['_id']>();
    const [ currentModal, setCurrentModal ] = React.useState<'note' | 'task' | 'none'>('none');
    const [ currentMode, setCurrentMode ] = React.useState<'add' | 'edit'>('edit');

    const taskModalRef = React.useRef<TaskModalRef>(null);

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
                    console.log('Task Modal (Home): Save Task');
                    setCurrentModal('none')
                },
            },

            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_TASK_MODAL.secondaryButton,
                onPress: () => {
                    console.log('Task Modal (Home): Discard Task');
                    setCurrentModal('none')
                },
            },
        });
    }, [setCurrentModal]);

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
                    console.log('Note Modal (Home): Discard Note');
                    setCurrentModal('none')
                }
            },
            secondaryButton: {
                ...ALERT_OPTION_NOT_SAVED_FOR_NOTE_MODAL.secondaryButton,
                onPress: () => {
                    console.log('Note Modal (Home): Cancel Discard Note')
                    setCurrentModal('none');
                }
            }
        });
    }, [setCurrentModal]);

    const onPressNoteInTask = React.useCallback((note: Note) => {
        taskModalRef.current?.close().then(( alertButtonResult ) => {
            if (alertButtonResult === undefined) return;
            setModalNoteId(note._id);
            setCurrentModal('note');
        })
    }, [taskModalRef.current, setCurrentModal, setModalNoteId]);

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

    React.useEffect(() => {
        console.log('Current Modal: ', currentModal);
    }, [currentModal])

    React.useEffect( () => {
        // TODO: get notes
        setTimeout(async () => {
            LabelService.getAllLabels().then( async (msg: Message<Label[]>) => {
                //TODO: home screen show only today 's notes and tasks
                if (msg.getIsSuccess()) {
                    const labels = msg.getData();

                    setAllLabels(labels);

                    Promise.all(labels.map(label => TaskService.getTasksByLabel(label._id, undefined, 3))).then((messages: Message<Task[]>[]) => {
                        const tasksByLabel: Record<Label['_id'], Task[]> = {};
                        messages.forEach((msg, index) => {
                            if (msg.getIsSuccess()) {
                                tasksByLabel[labels[index]['_id']] = msg.getData();
                            }
                        });
                        setTaskByLabel(tasksByLabel);

                    });
                }
            });
        }, 500);
    }, [])

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
                    <Text style={[ Typography.body.x45, textColor ]}>Welcome back,</Text>
                    <Text style={[ Typography.header.x60, textColor ]}>Let's plan your day!</Text>
                </View>

                {/* Today's Notes */}
                <View style={[Layouts.sectionContainer]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, textColor, { textTransform: 'uppercase' } ]}>Recent Notes</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Notes') /*TODO: Press View All will navigate to Notes Screen with ? notes filter*/}>
                            <Text style={[Typography.body.x40, textColor, { opacity: 0.6, }]}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={[styles.noteCardsScroller]} horizontal={true}>
                        <View style={[styles.noteCardsContainer]}>
                            {newNote.map((note: Note, index: number) => (
                                <NoteCard key={index} note={note} orientation={'landscape'} showLabels
                                          onPress={(note) => {setModalNoteId(note._id); setCurrentModal('note');}}
                                />
                            ))}
                        </View>
                    </ScrollView>


                </View>

                {/* Today's Tasks */}
                <View style={[Layouts.sectionContainer, {flex: 1}]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, textColor, { textTransform: 'uppercase' } ]}>Today's Tasks</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Tasks') /*TODO: Press View All will navigate to Tasks Screen with today tasks filter*/}>
                            <Text style={[Typography.body.x40, textColor, { opacity: 0.6, }]}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[Layouts.fullWidthContainer]}>
                        <View style={[styles.tasksScroller]}>
                            {allLabels.map((label: Label, index: number) => (
                                <View key={index}>
                                    <Text style={[ Typography.header.x40, { textTransform: 'uppercase', color: label.color } ]}>{label.name}</Text>
                                    <TaskTree
                                        tasks={ tasksByLabel[label._id] ?? [] }
                                        onPressTask = { (task) => {setModalTaskId(task._id); setCurrentModal('task');} }

                                        showShowMoreButton={true}
                                        onPressShowMore={ () => console.log('Task Tree (Home): Show More Tasks') }

                                        colorTree={ label.color }
                                        showLabel={false}
                                    />
                                </View>
                            ))}
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
                        />,

                        <TaskModal
                            ref={taskModalRef}

                            mode={ currentMode }
                            taskId={ modalTaskId }
                            onPressNote={ onPressNoteInTask }
                            onCancel={onCancelTaskModal}
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
        marginTop: 5,
    },
});

export default HomeScreen;