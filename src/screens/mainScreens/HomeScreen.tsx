import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {DrawerScreenProps} from '@react-navigation/drawer';

//components
import {AddNoteCard, NoteCard, TaskTree} from '../../components/';
import {Layouts, Typography} from '../../styles';
import {type RootStackParamList} from "../../navigation";

//Services
import {LIMIT_FETCH_NOTE, LIMIT_FETCH_TASK, UNLABELED_KEY} from "../../constant";
import {AddTaskCard} from "../../components";
import {useLabelsData, useNotesData, useTasksData} from "../../controllers";
import {useDataModal} from "../../contexts/DataModalContext";
import {useGroupDataState} from "../../hooks";
import StorageService from "../../services/DAO/StorageService";

type Props = DrawerScreenProps<RootStackParamList, 'Home'>;

const HomeScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();
    const isScreenFocused = useIsFocused();

    React.useEffect(() => {
        StorageService.clearAllData('label');
        StorageService.clearAllData('note');
        StorageService.clearAllData('task');
    }, [])

    const { getAllLabels, error: errorLabel } = useLabelsData();
    const { getAllNotes, error: errorNote  } = useNotesData();
    const { getTasksByLabel, getTasksWithoutLabel, error: errorTask } = useTasksData(false);

    const [ allNotes, setAllNotes ] = React.useState<Note[]>([]);
    const [ allLabels, setAllLabels ] = React.useState<(Label | typeof UNLABELED_KEY)[]>([UNLABELED_KEY]);
    const { updateGroup, getHasMore, getData, refreshData } = useGroupDataState({
        keys: allLabels,
        keyExtractor: (label) => label === UNLABELED_KEY ? UNLABELED_KEY : label._id,
        fetcher: (label, limit, offset) =>
            label === UNLABELED_KEY
                ? getTasksWithoutLabel({isCompleted: false, limit, offset, sortBy: 'start', sortOrder: 'desc'})
                : getTasksByLabel(label, {isCompleted: false, limit, offset, sortBy: 'start', sortOrder: 'desc'}),
        limitFetch: LIMIT_FETCH_TASK,
    })

    const { showModal, hideModal, setDataModal, updateProps } = useDataModal({});

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

    const onAddedUpdatedNote = React.useCallback((_note: Note) => {
        getAllNotes({limit: LIMIT_FETCH_NOTE, sortBy: 'createdAt', sortOrder: 'desc'}).then(setAllNotes);
        hideModal();
    }, [getAllNotes, setAllNotes, hideModal]);

    const onAddedUpdatedTask = React.useCallback((_task: Task) => {
        getAllLabels().then((labels) => {
            setAllLabels([...labels, UNLABELED_KEY]);
            refreshData();
            hideModal();
        }).catch((error) => {
            console.error('Error on Add/Update Task', error);
        });
    }, [getAllLabels, setAllLabels, hideModal, refreshData]);

    React.useEffect(() => {
        if(!isScreenFocused) return;

        Promise.all([
            getAllNotes({limit: LIMIT_FETCH_NOTE}),
            getAllLabels()
        ]).then(([notes, labels]) => {
            setAllNotes(notes);
            setAllLabels([...labels, UNLABELED_KEY]);
        });
        refreshData();
    }, [isScreenFocused]);

    React.useEffect(() => {
        if (!isScreenFocused) return;

        updateProps({
            noteModalProps: {
                onAddNote: onAddedUpdatedNote,
                onUpdateNote: onAddedUpdatedNote,
            },
            taskModalProps: {
                onAddTask: onAddedUpdatedTask,
                onUpdateTask: onAddedUpdatedTask,
                onPressNote: onPressNoteInTask
            }
        });
    }, [onAddedUpdatedNote, onAddedUpdatedTask, onPressNoteInTask, isScreenFocused, updateProps]);

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <ScrollView style={[ Layouts.mainContainer ]} showsVerticalScrollIndicator={false}>
                {/* Opening Titre */}
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
                            (allLabels.length > 0) && //|| tasksByLabel[UNLABELED_KEY]?.length > 0) &&
                            <View style={{marginBottom: 10}}>
                                {allLabels.map((label: Label | typeof UNLABELED_KEY, index: number) => (
                                    !!getData(label)?.length &&
                                    <TaskTree
                                        key={index}

                                        tasks={ getData(label) ?? [] }
                                        label={label}

                                        onPressTask = { (task) => {setDataModal('task', task._id, 'edit'); showModal('task')} }
                                        onPressDeleteTask={ () => refreshData() }

                                        showShowMoreButton={ getHasMore(label) }
                                        onPressShowMore={ () => updateGroup(label) }

                                        showLabel={false}
                                    />
                                ))}
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