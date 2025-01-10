import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    ListRenderItem
} from 'react-native';
import {Layouts, Typography} from "../../styles";
import {
    AddLabelCard,
    Icon, LabelCard,
} from "../../components";
import {useIsFocused, useTheme} from "@react-navigation/native";
import {UNLABELED_KEY} from "../../constant";
import {useLabelsData} from "../../controllers";
import {DrawerScreenProps} from "@react-navigation/drawer";
import {RootStackParamList} from "../../navigation";
import {useDataModal} from "../../contexts/DataModalContext";

type Props = DrawerScreenProps<RootStackParamList, 'Labels'>

const LabelsScreen : React.FC<Props> = ({navigation}) => {
    const { colors } = useTheme();
    const isScreenFocused = useIsFocused();
    const { showModal, setDataModal, updateProps, hideModal } = useDataModal({});

    const { getAllLabels, getStatusOfLabel, error: errorLabel } = useLabelsData();

    const [ allLabels, setAllLabels ] = React.useState<(Label | null)[]>([]); //null for adding card
    const [ labelStatus, setLabelStatus ] = React.useState<Record<Label['_id'], {taskTotal: number, taskCompleted: number, noteTotal: number}>>({});

    const updateData = React.useCallback(() => {
        getAllLabels({sortBy: 'createdAt', sortOrder: 'asc'}).then((labels) => {
            setAllLabels([...labels, null]);
            const _labelStatus : typeof labelStatus = {}
            Promise.all( labels.map(label => getStatusOfLabel(label)) ).then((progress) => {
                labels.forEach((label, index) => {
                    _labelStatus[label._id] = progress[index];
                });
                setLabelStatus(_labelStatus);
                hideModal();
            });
        });
    }, [getAllLabels, setAllLabels, labelStatus, getStatusOfLabel, setLabelStatus, hideModal]);

    const onPressAddLabel = React.useCallback(() => {
        setDataModal('label', undefined, 'add');
        showModal('label');
    }, [setDataModal, showModal]);

    const onAddedUpdatedLabel = React.useCallback((_label: Label) => {
        updateData();
    }, [updateData]);

    React.useEffect(() => {
        if (!isScreenFocused) return;
        updateData();
    }, [isScreenFocused])

    React.useEffect(() => {
        if (!isScreenFocused) return;

        updateProps({
            labelModalProps: {
                onAddLabel: onAddedUpdatedLabel,
                onUpdateLabel: onAddedUpdatedLabel,
            }
        })
    }, [updateProps, onAddedUpdatedLabel, isScreenFocused]);

    const renderItem = React.useCallback(({item, index} : {item: Label | null, index: number}) => {
        const isLastAndAlone = index === allLabels.length - 1 && index % 2 === 0;
        const paddingStyle = index % 2 === 0 && !isLastAndAlone ? {paddingRight: 5} : {paddingLeft: 5};
        return (
            <View style={{ flexBasis: '50%', flexGrow: 1, ...paddingStyle}}>
                { item === null
                ? <AddLabelCard type={"medium"} onPress={onPressAddLabel}/>
                : <LabelCard
                    label={item}
                    onPress={() => {navigation.navigate('Search')}} //TODO: navigate to search with label, add params
                    onPressEdit={() => {setDataModal('label', item._id, 'edit'); showModal('label')}}
                    numberOfCompletedTasks={labelStatus[item._id]?.taskCompleted}
                    numberOfTasks={labelStatus[item._id]?.taskTotal}
                    numberOfNotes={labelStatus[item._id]?.noteTotal}
                    style={{ flexBasis: '50%', flexGrow: 1 }}
                />
                }
            </View>
        )
    }, [navigation, labelStatus, onPressAddLabel, allLabels.length, setDataModal, showModal]);

    return (
        <SafeAreaView style={{position: 'relative'}}>
            <FlatList
                // style={[Layouts.mainContainer]}
                style={{marginHorizontal: 15}}
                contentContainerStyle={[Layouts.sectionContainer, {display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}]}
                columnWrapperStyle={{ marginBottom: 10, flexGrow: 1 }}
                ListHeaderComponent={
                    <View style={[ Layouts.sectionContainer, styles.headerSection]}>
                        <Icon name={'tag-outline'} size={30} color={colors.text} library={'MaterialCommunityIcons'}/>
                        <Text style={[ Typography.header.x60, {color: colors.text} ]}>Labels</Text>
                    </View>
                }
                data={allLabels}
                renderItem={renderItem}
                numColumns={2}
                horizontal={false}
                showsVerticalScrollIndicator={false}
            />
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
});

export default LabelsScreen;