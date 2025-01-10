import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';
import {DrawerScreenProps} from "@react-navigation/drawer";
import type {RootStackParamList} from "../../navigation";
import {useIsFocused, useTheme} from "@react-navigation/native";
import {useLabelsData, useTasksData} from "../../controllers";
import {LIMIT_FETCH_TASK, UNLABELED_KEY} from "../../constant";
import {useDataModal} from "../../contexts/DataModalContext";
import {Layouts, Typography} from "../../styles";
import {
    AddLabelCard,
    AddTaskCard,
    Icon,
    TASK_PROGRESS_CARD_HEIGHT, TASK_PROGRESS_CARD_WIDTH,
    TaskProgressCard,
    TaskTree
} from "../../components";
import {useGroupDataState} from "../../hooks";
import dayjs from "dayjs";

type Props = DrawerScreenProps<RootStackParamList, 'Tasks'>;

const FORMAT_DATE_STRING = 'DD-MM-YYYY';

const TasksScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();
    const isScreenFocused = useIsFocused();

    const { getAllLabels, getStatusOfLabel, addLabel, error: errorLabel } = useLabelsData();
    const { getTasksByLabel, getTasksWithoutLabel, error: errorTask } = useTasksData(false);

    const [ allLabels, setAllLabels ] = React.useState<(Label | typeof UNLABELED_KEY)[]>([UNLABELED_KEY]);
    const [ labelProgress, setLabelProgress ] = React.useState<Record<Label['_id'], {taskTotal: number, taskCompleted: number, noteTotal: number}>>({});
    const [ dateShowTasks, setDateShowTasks ] = React.useState<string>( dayjs().format(FORMAT_DATE_STRING) ) //format string to optimize render of component

    const { showModal, setDataModal, updateProps, hideModal } = useDataModal({});
    const { updateGroup, getHasMore, getData, refreshData, resetData } = useGroupDataState({
        keys: allLabels,
        keyExtractor: (label) => label === UNLABELED_KEY ? UNLABELED_KEY : label._id,
        fetcher: (label, limit, offset) =>
            label === UNLABELED_KEY
                ? getTasksWithoutLabel({isCompleted: false, limit, offset, sortBy: 'start', sortOrder: 'desc', date: dayjs(dateShowTasks, FORMAT_DATE_STRING).toDate()})
                : getTasksByLabel(label, {isCompleted: false, limit, offset, sortBy: 'start', sortOrder: 'desc', date: dayjs(dateShowTasks, FORMAT_DATE_STRING).toDate()}),
        limitFetch: LIMIT_FETCH_TASK,
    })

    const updateData = React.useCallback(() => {
        getAllLabels().then((labels) => {
            const _allLabels : (Label | typeof UNLABELED_KEY)[] = [...labels, UNLABELED_KEY];
            const _labelProgress : typeof labelProgress = {}
            Promise.all( _allLabels.map(label => getStatusOfLabel(label)) ).then((progress) => {
                _allLabels.forEach((label, index) => {
                    _labelProgress[label === UNLABELED_KEY ? UNLABELED_KEY : label._id] = progress[index];
                });
                setAllLabels([...labels, UNLABELED_KEY]);
                setLabelProgress(_labelProgress);
                refreshData();
            });
        });
    }, [getAllLabels, setAllLabels, setLabelProgress, labelProgress, getStatusOfLabel, refreshData]);

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

    const onAddedUpdatedTask = React.useCallback((_task: Task) => {
        try {
            updateData();
            hideModal();
        } catch (error) {
            console.error('Error on Add/Update Task', error);
        }
    }, [updateData, hideModal]);

    const onAddedUpdatedLabel = React.useCallback((_label: Label) => {
        updateData();
    }, [updateData]);

    const getDateString = React.useCallback((date: string) => {
        if (date === dayjs().format(FORMAT_DATE_STRING)) return 'Today';
        if (date === dayjs().add(1, 'day').format(FORMAT_DATE_STRING)) return 'Tomorrow';
        if (date === dayjs().subtract(1, 'day').format(FORMAT_DATE_STRING)) return 'Yesterday';
        return date;
    }, []);

    const onPressLeft = React.useCallback(() => {
        const newDate = dayjs(dateShowTasks, FORMAT_DATE_STRING, true).subtract(1, 'day');
        setDateShowTasks(newDate.format(FORMAT_DATE_STRING));
    }, [dateShowTasks, setDateShowTasks]);

    const onPressRight = React.useCallback(() => {
        const newDate = dayjs(dateShowTasks, FORMAT_DATE_STRING, true).add(1, 'day');
        setDateShowTasks(newDate.format(FORMAT_DATE_STRING));
    }, [dateShowTasks, setDateShowTasks]);

    React.useEffect(() => {
        resetData();
    }, [dateShowTasks]);

    React.useEffect(() => {
        if (!isScreenFocused) return;

        const currentTime = dayjs();
        const defaultStartDateTask = dayjs(dateShowTasks, FORMAT_DATE_STRING)
            .hour(currentTime.hour())
            .minute(currentTime.minute())
            .second(currentTime.second())
            .toDate();

        updateProps({
            taskModalProps: {
                defaultTask: {start: defaultStartDateTask},
                onAddTask: onAddedUpdatedTask,
                onUpdateTask: onAddedUpdatedTask,
                onPressNote: onPressNoteInTask
            },
            labelModalProps: {
                onAddLabel: onAddedUpdatedLabel,
                onUpdateLabel: onAddedUpdatedLabel
            }
        });
    }, [updateProps, onAddedUpdatedTask, onPressNoteInTask, onAddedUpdatedLabel, updateData, isScreenFocused, dateShowTasks]);

    React.useEffect(() => {
        if (!isScreenFocused) return;
        updateData();
    }, [isScreenFocused])

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <ScrollView style={[ Layouts.mainContainer ]} showsVerticalScrollIndicator={false}>
                {/* Opening Titre */}
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
                                allLabels.length > 0 && allLabels.map((label: Label | typeof UNLABELED_KEY, index: number) =>
                                    label !== UNLABELED_KEY
                                    ? (<TaskProgressCard
                                        key={index}
                                        label={label}
                                        numberOfCompletedTasks={labelProgress[label._id]?.taskCompleted}
                                        numberOfTasks={labelProgress[label._id]?.taskTotal}
                                        numberOfNotes={labelProgress[label._id]?.noteTotal}
                                        onPress={() => navigation.navigate('Search')} //TODO: add params to search screen
                                    />)
                                    : (<TaskProgressCard
                                        key={index}
                                        label={label}
                                        numberOfCompletedTasks={labelProgress[UNLABELED_KEY]?.taskCompleted}
                                        numberOfTasks={labelProgress[UNLABELED_KEY]?.taskTotal}
                                        numberOfNotes={labelProgress[UNLABELED_KEY]?.noteTotal}
                                        onPress={() => navigation.navigate('Search')} //TODO: add params to search screen
                                    />)
                                )
                            }
                            <AddLabelCard onPress={onPressAddLabel} type={'medium'}
                                          style={{width: TASK_PROGRESS_CARD_WIDTH, height: TASK_PROGRESS_CARD_HEIGHT}}/>
                        </View>
                    </ScrollView>
                </View>

                {/* Date's Tasks */}
                <View style={[Layouts.sectionContainer]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, {color: colors.text}, { textTransform: 'uppercase' } ]}>{getDateString(dateShowTasks)} 's Tasks</Text>
                        <View style={[styles.buttonsChangeDateContainer]}>
                            <TouchableOpacity onPress={onPressLeft}>
                                <Icon name="chevron-left" size={20} color={colors.text} library='FontAwesome5'/>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onPressRight}>
                                <Icon name="chevron-right" size={20} color={colors.text} library='FontAwesome5'/>
                            </TouchableOpacity>
                        </View>
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
                                        onChangeCompletedStatusTask={ () => refreshData() }

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
    buttonsChangeDateContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

export default TasksScreen;