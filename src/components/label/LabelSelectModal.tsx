import React from 'react';
import { StyleSheet, ViewStyle, View, Pressable } from 'react-native';

//components & styles
import { ListModal, Icon,
        type ListModalDataType
    } from '../atomic';
import LabelModal from "./LabelModal";
import LabelSelectItem from "./LabelSelectItem";

//services
import { useTheme } from '@react-navigation/native';
import {useAlertProvider, useLabelsData} from "../../hooks";
import AlertModal from "../atomic/AlertModal";


type LabelSelectModalProps = {
    onPressOnLabel: (label: Label, isSelected: boolean) => void,
    chosenLabelsList: Label[],
    style: ViewStyle,
    onPressCancel: () => void,
}

const LabelSelectModal : React.FC<LabelSelectModalProps> = ({
    onPressOnLabel,
    chosenLabelsList,
    style,
    onPressCancel,
}) => {
    const { data: allLabels, loading, error } = useLabelsData();
    const [ chosenLabels, setChosenLabels ] = React.useState<Label[]>(chosenLabelsList);
    const [ isShowAddLabelModal, setShowAddLabelModal ] = React.useState<boolean>(false);
    const { colors } = useTheme();
    const {
        alert, alertProps,
        hidePopUp, modalVisible
    } = useAlertProvider();

    const dataList : ListModalDataType[] = React.useMemo (() =>
        allLabels.map((label: Label, index) => (
            () =>
                <View style={styles.itemStyle} key={index}>
                    <LabelSelectItem
                        label={label}
                        onPress={onPressOnLabel}
                        isSelected={chosenLabels.findIndex((l) => l._id === label._id) !== -1}
                    ></LabelSelectItem>
                </View>
        ))
    , [allLabels, onPressOnLabel, chosenLabels]);

    const onAddLabel = React.useCallback( (newLabel: Label) => {
        allLabels.unshift(newLabel);
        setChosenLabels([...chosenLabels, newLabel]);
    }, [allLabels, setChosenLabels, chosenLabels]);

    const Header : React.FC = () => {
        return (
            <View style={styles.header}>
                <Pressable  onPress={() => setShowAddLabelModal(true)} hitSlop={6}>
                    <Icon name="plus-circle" size={20} color={colors.text} library='FontAwesome5'/>
                </Pressable>

                <Pressable  onPress={onPressCancel} hitSlop={6}>
                            <Icon name="window-close" size={26} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>
    )};

    React.useEffect(() => {
        if (loading) {
            alert({
                title: 'Loading...',
                message: 'Retrieving data', //move to constant
                type: 'info',
            });
        }
        if (error) {
            alert({
                title: 'An error occurred',
                message: error,
                type: 'error',
                //TODO: cause primaryButton is 'Try again', so adjust on onPressPrimary here
            });
        }
        if (!loading) {
            hidePopUp();
        }
    }, [loading, error]);

    return (
        <View>
            <ListModal
                dataList={dataList}
                containerStyle={{
                    ...style,
                    ...StyleSheet.flatten(styles.container),
                }}
                typeOverlay='lowOpacity'
                onPressOverlay={onPressCancel}
                headerComponent={() => <Header/>}
                visible={!isShowAddLabelModal}
            />
            <LabelModal
                mode='add'
                onAddLabel={onAddLabel}
                visible={isShowAddLabelModal}
            />

            {
                alertProps &&
                <AlertModal
                    {...alertProps}
                    visible={modalVisible}
                />
            }
        </View>
    )
}

export default LabelSelectModal;

const styles = StyleSheet.create({
    container : {
        paddingHorizontal: 12,
        borderWidth: 0,
    },
    itemStyle: {
        marginVertical: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        paddingTop: 5,
    }
});

