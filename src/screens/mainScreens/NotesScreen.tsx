import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';
import {Layouts, Typography} from "../../styles";
import {AddNoteCard, AddTaskCard, Icon, NoteCard, NotesGroup, TaskTree} from "../../components";
import {LIMIT_FETCH_NOTE, LIMIT_FETCH_TASK, UNLABELED_KEY} from "../../constant";
import {useIsFocused, useTheme} from "@react-navigation/native";
import {useLabelsData, useNotesData} from "../../controllers";
import {useGroupDataState} from "../../hooks";
import {useDataModal} from "../../contexts/DataModalContext";
import {DrawerScreenProps} from "@react-navigation/drawer";
import type {RootStackParamList} from "../../navigation";

type Props = DrawerScreenProps<RootStackParamList, 'Notes'>;

const NotesScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();
    const isScreenFocused = useIsFocused();
    const { showModal, hideModal, setDataModal, updateProps } = useDataModal({});

    const { getAllLabels, error: errorLabel } = useLabelsData();
    const { getAllNotes, getNotesByLabel, getNotesWithoutLabel, error: errorNote  } = useNotesData();

    const [ allNotes, setAllNotes ] = React.useState<Note[]>([]);
    const [ allLabels, setAllLabels ] = React.useState<(Label | typeof UNLABELED_KEY)[]>([UNLABELED_KEY]);
    const { data, updateGroup, getHasMore, getData, refreshData } = useGroupDataState({
        keys: allLabels,
        keyExtractor: (label) => label === UNLABELED_KEY ? UNLABELED_KEY : label._id,
        fetcher: (label, limit, offset) =>
            label === UNLABELED_KEY
                ? getNotesWithoutLabel({limit, offset, sortBy: 'createdAt', sortOrder: 'desc'})
                : getNotesByLabel(label, {limit, offset, sortBy: 'createdAt', sortOrder: 'desc'}),
        limitFetch: LIMIT_FETCH_NOTE,
    })

    const updateData = React.useCallback(() => {
        getAllLabels().then(labels => {
            setAllLabels([...labels, UNLABELED_KEY]);
            refreshData();
        });
        getAllNotes({limit: LIMIT_FETCH_NOTE, sortBy: 'createdAt', sortOrder: 'desc'}).then(setAllNotes);
    }, [getAllLabels, setAllLabels, getAllNotes, setAllNotes, refreshData]);

    const onPressAddNote = React.useCallback(() => {
        setDataModal('note', undefined, 'add');
        showModal('note');
    }, [setDataModal, showModal]);

    const onAddedUpdatedNote = React.useCallback((_note: Note) => {
        updateData();
        hideModal();
    }, [hideModal, updateData]);

    React.useEffect(() => {
        if(!isScreenFocused) return;
        updateData();
    }, [isScreenFocused]);

    React.useEffect(() => {
        if(!isScreenFocused) return;
        updateProps({
            noteModalProps: {
                onAddNote: onAddedUpdatedNote,
                onUpdateNote: onAddedUpdatedNote,
            }
        });
    }, [isScreenFocused, onAddedUpdatedNote, updateProps]);

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <ScrollView style={[ Layouts.mainContainer ]} showsVerticalScrollIndicator={false}>
                {/* Opening Titre */}
                <View style={[ Layouts.sectionContainer, styles.headerSection ]}>
                    <Icon name={'sticker-text-outline'} size={30} color={colors.text} library={'MaterialCommunityIcons'}/>
                    <Text style={[ Typography.header.x60, {color: colors.text} ]}>Tasks</Text>
                </View>

                {/* Recent Notes */}
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

                {/* Notes by Labels */}
                <View style={[Layouts.sectionContainer]}>
                    <View style={[styles.sectionTitleContainer]}>
                        <Text style={[ Typography.subheader.x40, {color: colors.text}, { textTransform: 'uppercase' } ]}>Notes by labels</Text>
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
                                    <NotesGroup
                                        key={index}
                                        notes={getData(label) || []}
                                        label={label}

                                        onPressNote={(note) => {setDataModal('note', note._id, 'edit'); showModal('note')}}
                                        onPressDeleteNote={ () => updateData() }

                                        showShowMoreButton={getHasMore(label)}
                                        onPressShowMore={() => updateGroup(label)}
                                        // onPressNote={}
                                        style={{marginBottom: 12}}
                                    />
                                ))}
                            </View>
                        }
                        {/*<AddTaskCard onPress={onPressAddTask}/>*/}
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
export default NotesScreen;