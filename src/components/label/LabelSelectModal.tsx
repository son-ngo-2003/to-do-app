import React from 'react';
import { StyleSheet, ViewStyle, View, Pressable } from 'react-native';

//components & styles
import {
    ListModal, Icon,
    type ListModalDataType, SequentialModals
} from '../atomic';
import LabelModal from "./LabelModal";
import LabelSelectItem from "./LabelSelectItem";

//services
import { useTheme } from '@react-navigation/native';
import {useAlertProvider, useLabelsData} from "../../hooks";
import AlertModal from "../atomic/AlertModal";


type LabelSelectModalProps = {
    visible?: boolean,
    onPressOnLabel: (label: Label, isSelected: boolean) => void,
    chosenLabelsList: Label[],
    style: ViewStyle,
    onPressCancel: () => void,
}

const LabelSelectModal : React.FC<LabelSelectModalProps> = ({
    visible = true,
    onPressOnLabel,
    chosenLabelsList,
    style,
    onPressCancel,
}) => {
    const { data: allLabels, loading, error } = useLabelsData();
    const [ modalShow, setModalShow ] = React.useState<'listLabel' | 'addLabel' | 'none'>(visible ? 'listLabel' : 'none');
    const { colors } = useTheme();
    // const {
    //     alert, alertProps,
    //     hidePopUp, modalVisible
    // } = useAlertProvider();

    const dataList : ListModalDataType[] = React.useMemo (() =>
        allLabels.map((label: Label, index) => (
            () =>
                <View style={styles.itemStyle} key={index}>
                    <LabelSelectItem
                        label={label}
                        onPress={onPressOnLabel}
                        isSelected={chosenLabelsList.findIndex((l) => l._id === label._id) !== -1}
                    ></LabelSelectItem>
                </View>
        ))
    , [allLabels, onPressOnLabel, chosenLabelsList]);

    const onAddLabel = React.useCallback( (newLabel: Label) => {
        allLabels.unshift(newLabel);
        onPressOnLabel(newLabel, false);
        setModalShow('listLabel');
    }, [allLabels, onPressOnLabel, setModalShow]);

    const Header : React.FC = () => {
        return (
            <View style={styles.header}>
                <Pressable  onPress={() => setModalShow('addLabel')} hitSlop={6}>
                    <Icon name="plus-circle" size={20} color={colors.text} library='FontAwesome5'/>
                </Pressable>

                <Pressable  onPress={onPressCancel} hitSlop={6}>
                            <Icon name="window-close" size={26} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>
    )};

    React.useEffect(() => {
        //TODO: add alert for loading and error
    }, [loading, error]);

    const getIndexOfModal = (modal: 'listLabel' | 'addLabel' | 'none') => {
        switch (modal) {
            case 'listLabel':
                return 0;
            case 'addLabel':
                return 1;
            case 'none':
                return -1;
            default:
                return 0;
        }
    }

    React.useEffect(() => {
        if (!visible) {
            setModalShow('none');
        } else {
            setModalShow('listLabel');
        }
    }, [visible]);

    return (
        <View>
            <SequentialModals
                currentIndex={getIndexOfModal(modalShow)}
                modals={[
                    <ListModal
                        dataList={dataList}
                        containerStyle={{
                            ...style,
                            ...StyleSheet.flatten(styles.container),
                        }}
                        typeOverlay='highOpacity'
                        onPressOverlay={onPressCancel}
                        headerComponent={() => <Header/>}
                    />,

                    <LabelModal
                        mode='add'
                        onAddLabel={onAddLabel}
                        onCancel={() => {setModalShow('listLabel'); return Promise.resolve();}}
                    />
                ]}
            />


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

