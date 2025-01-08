import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';

//components
import { NoteCard, TaskTree, AddNoteCard } from '../../components/';
import { Colors, Typography, Layouts } from '../../styles';
import { type RootStackParamList } from "../../navigation";

//Services
import {LIMIT_FETCH_NOTE, LIMIT_FETCH_TASK, UNLABELED_KEY} from "../../constant";
import {AddTaskCard} from "../../components";
import {useNotesData, useLabelsData, useTasksData} from "../../controllers";
import StorageService from "../../services/DAO/StorageService";
import {useDataModal} from "../../contexts/DataModalContext";

type Props = DrawerScreenProps<RootStackParamList, 'Home'>;

const HomeScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();

    const { getAllLabels, addLabel, error: errorLabel } = useLabelsData();
    const { getAllNotes, addNote, error: errorNote  } = useNotesData();
    const { getAllTasksGroupByLabels, addTask, error: errorTask } = useTasksData(false);

    const [ tasksByLabel, setTaskByLabel ] = React.useState<Record<Label['_id'], (Task | null)[]>>({});
    const [ allNotes, setAllNotes ] = React.useState<Note[]>([]);
    const [ allLabels, setAllLabels ] = React.useState<Label[]>([]);

    React.useEffect(() => {
        //TODO: delete a repeated Task also delete its instances
        //TODO: make notification for tasks

        StorageService.clearAllData('label');
        StorageService.clearAllData('note');
        StorageService.clearAllData('task');

        Promise.all([
            getAllNotes({limit: LIMIT_FETCH_NOTE}),
            getAllTasksGroupByLabels({date: new Date(), limit: LIMIT_FETCH_TASK + 1, withTasksNoLabel: true, sortBy: 'start', sortOrder: 'desc'}),
            getAllLabels()
        ]).then(([notes, tasksByLabel, labels]) => {
            setAllNotes(notes);
            setTaskByLabel(tasksByLabel);
            setAllLabels(labels);
        });
    }, []);

    const { showModal, setDataModal, updateProps } = useDataModal({});

    const onPressNoteInTask = React.useCallback((note: Note) => { //TODO: text this function
        setDataModal('note', note._id, 'edit');
        showModal('note');
    }, [setDataModal, showModal]);

    const onPressAddNote = React.useCallback(() => {
        setDataModal('note', undefined, 'add');
        showModal('note');
    }, [setDataModal, showModal]);

    const onPressAddTask = React.useCallback(() => {
        setDataModal('task', undefined, 'add');
        showModal('task');
    }, [setDataModal, showModal]);

    const onAddedUpdatedNote = React.useCallback((note: Note) => {
        getAllNotes({limit: LIMIT_FETCH_NOTE, sortBy: 'createdAt', sortOrder: 'desc'}).then(setAllNotes);
        showModal('none');
    }, [getAllNotes, setAllNotes, showModal]);

    const onAddedUpdatedTask = React.useCallback((task: Task) => {
        Promise.all([
            getAllTasksGroupByLabels({date: new Date(), limit: LIMIT_FETCH_TASK + 1, withTasksNoLabel: true, sortBy: 'start', sortOrder: 'desc'}),
            getAllLabels()
        ]).then(([tasksByLabel, labels]) => {
            setAllLabels(labels);

            const _tasksByLabel : Record<Label['_id'], (Task | null)[]> = {...tasksByLabel};
            for (let key in _tasksByLabel) {
                if (_tasksByLabel[key].length > LIMIT_FETCH_TASK) {
                    _tasksByLabel[key].pop();
                    _tasksByLabel[key].push(null); // Add a null task to show the "Show More" button
                }
            }
            setTaskByLabel(_tasksByLabel);
            showModal('none');
        });
    }, [getAllTasksGroupByLabels, setTaskByLabel, getAllLabels, setAllLabels, showModal]);


    useFocusEffect(React.useCallback(() => {
        updateProps({
            noteModalProps: {
                onAddNote: onAddedUpdatedNote,
                onUpdateNote: onAddedUpdatedNote
            },
            taskModalProps: {
                onAddTask: onAddedUpdatedTask,
                onUpdateTask: onAddedUpdatedTask,
                onPressNote: onPressNoteInTask
            }
        })
        }, [])
    );

    return (
        <SafeAreaView style={{position: 'relative'}}>
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
                                allNotes.length > 0 && allNotes.map((note: Note, index: number) => (
                                    <NoteCard key={index} note={note} orientation={'landscape'} showLabels
                                              onPress={(note) => {setDataModal('note', note._id, 'edit'); showModal('note')}}
                                    />)
                                    )
                            }
                            <AddNoteCard orientation={'landscape'} onPress={onPressAddNote} heightSameAsCardWithLabel={true}/>
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

                    <View style={[Layouts.fullWidthContainer, styles.tasksContainer]}>
                        {
                            (allLabels.length > 0 || tasksByLabel[UNLABELED_KEY]?.length > 0) &&
                            <View style={{marginBottom: 10}}>
                                {allLabels.map((label: Label, index: number) => (
                                <View key={index}>
                                    <Text style={[ Typography.header.x40, { textTransform: 'uppercase', color: label.color } ]}>{label.name}</Text>
                                    <TaskTree
                                        tasks={ tasksByLabel[label._id] ?? [] }
                                        onPressTask = { (task) => {setDataModal('task', task._id, 'edit'); showModal('task')} }

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
                                        onPressTask = { (task) => {setDataModal('task', task._id, 'edit'); showModal('task')} }

                                        showShowMoreButton={ true }
                                        onPressShowMore={ () => console.log('Task Tree (Home): Show More Tasks') }

                                        colorTree={ Colors.primary.teal }
                                        showLabel={false}
                                    />
                                </View>
                                }
                            </View>
                        }
                        <AddTaskCard onPress={onPressAddTask}/>
                    </View>

                </View>
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
    tasksContainer: {
        paddingHorizontal: Layouts.MARGIN_HORIZONTAL,
        marginTop: 10,
    },
});

export default HomeScreen;