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
    setListLabels?: (newChoseLabels: Label[]) => void,
    choseLabelsList: Label[],
}

const LabelsList : React.FC<LabelsListProps> = ({
    withAddButton,
    withDeleteButton,
    setListLabels = () => {},
    choseLabelsList,
}) => {
    const plusButtonRef = React.useRef<View>(null);
    const [ plusButtonPos, setPlusButtonPos ] = React.useState<{x: number, y: number}>({x: 0, y: 0});
    const { colors } = useTheme();
    const [ isShowModal, setIsShowModal ] = React.useState<boolean>(false);

    const onPressDeleteLabel = (label: Label) => {
        const newListLabels = choseLabelsList.filter((l) => l._id !=  label._id);
        setListLabels(newListLabels);
    }

    const onPressAddLabelTag = (label: Label) => {
        const newListLabels = [...choseLabelsList, label];
        setListLabels(newListLabels);
    }

    const getLayoutPlusButton = (_event: LayoutChangeEvent) => {
        //const {width, height} = event.nativeEvent.layout;
        setTimeout(() => { //wait until finish transition of modal
            plusButtonRef.current?.measureInWindow((pagex, pagey) => {
                setPlusButtonPos({x: pagex, y: pagey});
            });
        }, 300);
    }

    return (
        <View style={[styles.labelsPart]}>
            { choseLabelsList.length 
                ?
                    <ScrollView style={[styles.labelsContainer]}
                                contentContainerStyle={styles.labelsContentContainer}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                >
                        {choseLabelsList.map((label: Label, index) => (
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
                        <Text style={{...Typography.subheader.x30, height: 26}}>
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

            {
                isShowModal &&
                <LabelSelectModal
                    choseLabelsList={choseLabelsList}
                    style = {{top: plusButtonPos.y - 10, right: Layouts.screen.width - plusButtonPos.x - 20, maxHeight: 300}}
                    onPressCancel = {() => {setIsShowModal(false)}}
                    onPressOnLabel = {(label: Label, isSelected: boolean) => {
                        isSelected 
                            ? onPressAddLabelTag(label) 
                            : onPressDeleteLabel(label);
                    }}
                />
            }
        </View>
    )
}

export default LabelsList;

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