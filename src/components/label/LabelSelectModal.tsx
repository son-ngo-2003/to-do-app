import React from 'react';
import { StyleSheet, ViewStyle, View, Pressable } from 'react-native';

//components & styles
import { ListModal, Icon,
        type ListModalDataType
    } from '../atomic';
import LabelModal from "./LabelModal";
import LabelSelectItem from "./LabelSelectItem";

//services
import { LabelService } from '../../services';
import { useTheme } from '@react-navigation/native';


type LabelSelectModalProps = {
    onPressOnLabel: (label: Label, isSelected: boolean) => void,
    choseLabelsList: Label[],
    style: ViewStyle,
    onPressCancel: () => void,
}

const LabelSelectModal : React.FC<LabelSelectModalProps> = ({
    onPressOnLabel,
    choseLabelsList,
    style,
    onPressCancel,
}) => {
    const [ allLabels, setAllLabels ] = React.useState<Label[]>([]);
    const [ isShowAddLabelModal, setShowAddLabelModal ] = React.useState<boolean>(false);
    const { colors } = useTheme();

    const dataList : ListModalDataType[] =
        allLabels.map((label : Label, index) => (
            () => 
            <View style={styles.itemStyle} key={index}>
                <LabelSelectItem
                    label={label}
                    onPress={onPressOnLabel}
                    isSelectedAtFirst={ choseLabelsList.findIndex((l) => l._id === label._id) !== -1 }
                ></LabelSelectItem>
            </View>
    ));

    const onAddLabel = (newLabel: Label) => {
        const newAllLabels = [...allLabels, newLabel];
        setAllLabels(newAllLabels);
        //TODO: check if need to do anything else
    }

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
    )}

    React.useEffect(() => {
        LabelService.getAllLabels().then((message) => {
            setAllLabels(message.getData());
        });
    },[]);

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
                setIsOpenModal={setShowAddLabelModal}
                onAddLabel={onAddLabel}
                visible={isShowAddLabelModal}
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

