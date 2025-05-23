import React from 'react';
import { StyleSheet, ScrollView, View, Pressable, Text,
        type LayoutChangeEvent } from 'react-native';

//components & styles
import { Icon } from '../atomic';
import LabelSelectModal from './LabelSelectModal';
import LabelTag from './LabelTag';
import { useTheme } from '@react-navigation/native';
import { Layouts, Typography } from '../../styles';

type LabelsListProps = {
    withAddButton: boolean,
    withDeleteButton: boolean,
    onChangeList?: (newChoseLabels: Label[]) => void,
    chosenLabelsList: Label[],
}

const LabelsList : React.FC<LabelsListProps> = ({
    withAddButton,
    withDeleteButton,
    onChangeList,
    chosenLabelsList,
}) => {
    const plusButtonRef = React.useRef<View>(null);
    const [plusButtonPos, setPlusButtonPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const { colors } = useTheme();
    const [isShowModal, setIsShowModal] = React.useState<boolean>(false);

    const onPressDeleteLabel = React.useCallback((label: Label) => {
        const newListLabels = chosenLabelsList.filter((l) => l._id != label._id);
        onChangeList?.(newListLabels);
    }, [chosenLabelsList, onChangeList]);

    const onPressAddLabelTag = React.useCallback((label: Label) => {
        const newListLabels = [...chosenLabelsList, label];
        onChangeList?.(newListLabels);
    }, [chosenLabelsList, onChangeList]);

    const onPressLabelInModal = React.useCallback((label: Label, isSelected: boolean) => {
        isSelected ? onPressDeleteLabel(label) : onPressAddLabelTag(label);
    }, [onPressAddLabelTag, onPressDeleteLabel]);

    const getLayoutPlusButton = React.useCallback((_event: LayoutChangeEvent) => {
        setTimeout(() => {
            plusButtonRef.current?.measureInWindow((pagex, pagey) => {
                setPlusButtonPos({ x: pagex, y: pagey });
            });
        }, 300);
    }, [plusButtonRef.current, setPlusButtonPos]);

    return (
        <View style={[styles.labelsPart]}>
            { chosenLabelsList.length
                ?
                    <ScrollView style={[styles.labelsContainer]}
                                contentContainerStyle={styles.labelsContentContainer}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                >
                        {chosenLabelsList.map((label: Label, index) => (
                            <LabelTag key={index} text={label.name} color={label.color}
                                        onPressDeleteButton={
                                            withDeleteButton
                                            ? () => {onPressDeleteLabel(label)}
                                            : undefined
                                        }/>
                        ))}
                    </ScrollView>
                :
                    <Pressable onPress={ () => setIsShowModal(withAddButton) }
                                style={[ { flex: 1 }]}
                    >
                        <Text style={{...Typography.subheader.x30, height: 26, color: colors.text}}>
                            {
                                withAddButton
                                ? "Add label to your note"
                                : ""
                            }

                        </Text>
                    </Pressable>
            }
            {
                withAddButton &&
                <Pressable onPress={()=>{setIsShowModal(true)}}
                            ref={plusButtonRef}
                            onLayout={getLayoutPlusButton}
                            style = {{ paddingLeft: 6}}
                            hitSlop={20}
                >
                    <Icon name='plus-circle' size={20} color={colors.text} library='FontAwesome5'></Icon>
                </Pressable>
            }

            <LabelSelectModal
                visible={isShowModal}
                chosenLabelsList={chosenLabelsList}
                style = {{top: plusButtonPos.y - 85, right: Layouts.screen.width - plusButtonPos.x - 50, maxHeight: 300}}
                onPressCancel = {() => {setIsShowModal(false)}}
                onPressOnLabel = {onPressLabelInModal}
            />
        </View>
    )
}

export default React.memo(LabelsList);

const styles = StyleSheet.create({
    labelsContainer: {
        //alignItems: 'center',
        width: '100%',
    },
    labelsContentContainer: {
        alignItems: 'center',
        gap: 10,
    },
    labelsPart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
});