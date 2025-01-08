import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';
import {DrawerScreenProps} from "@react-navigation/drawer";
import type {RootStackParamList} from "../../navigation";
import {useFocusEffect, useTheme} from "@react-navigation/native";
import {useLabelsData, useTasksData} from "../../controllers";
import {LIMIT_FETCH_TASK, UNLABELED_KEY} from "../../constant";
import {useDataModal} from "../../contexts/DataModalContext";
import {Colors, Layouts, Typography} from "../../styles";
import {
    AddLabelCard,
    AddTaskCard,
    Icon,
    TASK_PROGRESS_CARD_HEIGHT, TASK_PROGRESS_CARD_WIDTH,
    TaskProgressCard,
    TaskTree
} from "../../components";

type Props = DrawerScreenProps<RootStackParamList, 'Tasks'>;

const TasksScreen : React.FC<Props> = ({navigation, route}) => {
    const { colors } = useTheme();

    const { getAllLabels, getStatusOfLabel, addLabel, error: errorLabel } = useLabelsData();
    const { getAllTasksGroupByLabels, addTask, error: errorTask } = useTasksData(false);

    const [ tasksByLabel, setTaskByLabel ] = React.useState<Record<Label['_id'], (Task | null)[]>>({});
    const [ allLabels, setAllLabels ] = React.useState<Label[]>([]);
    const [ labelProgress, setLabelProgress ] = React.useState<Record<Label['_id'], {taskTotal: number, taskCompleted: number, noteTotal: number}>>({});

    const updateData = React.useCallback(() => {
        Promise.all([
            getAllTasksGroupByLabels({date: new Date(), limit: LIMIT_FETCH_TASK + 1, withTasksNoLabel: true, sortBy: 'start', sortOrder: 'desc'}),
            getAllLabels()
        ]).then(([tasksByLabel, labels]) => {
            setTaskByLabel(tasksByLabel);
            const _labelProgress : typeof labelProgress = {}
            Promise.all( labels.map(label => getStatusOfLabel(label)) ).then((progress) => {
                labels.forEach((label, index) => {
                    _labelProgress[label._id] = progress[index];
                });
                setAllLabels(labels);
                setLabelProgress(_labelProgress);
            });
        });
    }, [getAllTasksGroupByLabels, getAllLabels, setTaskByLabel, setAllLabels, setLabelProgress, labelProgress, getStatusOfLabel]);

    React.useEffect(() => {
        updateData();
    }, []);

    const { showModal, setDataModal, updateProps } = useDataModal({});

    const onPressNoteInTask = React.useCallback((note: Note) => { //TODO: text this function
        setDataModal('note', note._id, 'edit');
        showModal('note');
    }, [setDataModal, showModal]);

    const onPressAddTask = React.useCallback(() => {
        setDataModal('task', undefined, 'add');
        showModal('task');
    }, [setDataModal, showModal]);

    const onPressAddLabel = React.useCallback(() => {
        setDataModal('label', undefined, 'add');
        showModal('label');
    }, [setDataModal, showModal]);

    const onAddedUpdatedTask = React.useCallback((task: Task) => {
        updateData();
    }, [updateData]);

    const onAddedUpdatedLabel = React.useCallback((label: Label) => {
        updateData();
    }, [updateData]);

    useFocusEffect(React.useCallback(() => {
        updateProps({
            taskModalProps: {
                onAddTask: onAddedUpdatedTask,
                onUpdateTask: onAddedUpdatedTask,
                onPressNote: onPressNoteInTask
            },
            labelModalProps: {
                onAddLabel: onAddedUpdatedLabel,
                onUpdateLabel: onAddedUpdatedLabel
            }
        })
    }, [])
    );

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <ScrollView style={[ Layouts.mainContainer ]} showsVerticalScrollIndicator={false}>
                {/* Openning Titre */}
                <View style={[ Layouts.sectionContainer, styles.headerSection ]}>
                    <Icon name={'checkbox-multiple-marked-outline'} size={30} color={colors.text} library={'MaterialCommunityIcons'}/>
                    <Text style={[ Typography.header.x60, {color: colors.text} ]}>Tasks</Text>
                </View>

                {/* Label task progress */}
                <View style={[Layouts.sectionContainer]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, {color: colors.text}, { textTransform: 'uppercase' } ]}>PROGRESS</Text>
                        {/*<TouchableOpacity onPress={() => navigation.navigate('Tasks')}>*/}
                        {/*    <Text style={[Typography.body.x40, {color: colors.text}, { opacity: 0.6, }]}>Analyse</Text>*/}
                        {/*</TouchableOpacity>*/}
                    </View>

                    <ScrollView style={[styles.labelProgressScroller]} horizontal={true}>
                        <View style={[styles.noteCardsContainer]}>
                            {
                                allLabels.length > 0 && allLabels.map((label: Label, index: number) =>
                                    (<TaskProgressCard
                                        key={index}
                                        label={label}
                                        numberOfCompletedTasks={labelProgress[label._id]?.taskCompleted}
                                        numberOfTasks={labelProgress[label._id]?.taskTotal}
                                        numberOfNotes={labelProgress[label._id]?.noteTotal}
                                        onPress={() => navigation.navigate('Search')}
                                    />)
                                )
                            }
                            <AddLabelCard onPress={onPressAddLabel} type={'medium'}
                                          style={{width: TASK_PROGRESS_CARD_WIDTH, height: TASK_PROGRESS_CARD_HEIGHT}}/>
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
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    labelProgressScroller: {
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

export default TasksScreen;