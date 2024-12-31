import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Pressable, View, TextInput, StyleSheet, Modal, 
         Keyboard } from 'react-native';
import { Colors, Typography, Outlines, Layouts, Bases} from '../../styles';
import Animated, { ZoomInEasyDown } from 'react-native-reanimated';

//components
import { Icon, Overlay, KeyboardOptimizeView } from '../atomic';
import { ColorSelect } from './atomic/';
import {useAlertProvider, useLabelsData} from "../../hooks";
import AlertModal from "../atomic/AlertModal";

type LabelModalProps = {
    mode: 'add' | 'edit',
    label?: Label,

    onAddLabel?: (label: Label) => void,
    onUpdateLabel?: (label: Label) => void,
    onCancel?: (draftLabel: Partial<Label>) => void,

    visible: boolean,
}

const sizeButton : number = 23;

const LabelModal: React.FC<LabelModalProps> = ({ 
    mode, 
    label,

    onAddLabel,
    onUpdateLabel,
    onCancel,

    visible=true,
}) => {
    const { loading, error, addLabel, updateLabel } = useLabelsData(false);
    const [ name, setName ] = React.useState<string>((mode === 'add' || !label) ? '' :  label.name) ;
    const [ indexColorSelected, setIndexColor ] = React.useState<number>(   
                                                        (mode === 'add' || !label)
                                                            ? -1
                                                            : Colors.listColor.findIndex( (color) => label.color === color ) 
                                                    ) ;

    const { colors } = useTheme();
    const {
        alert, alertProps,
        hidePopUp, modalVisible
    } = useAlertProvider();

    const onPressAdd = async () => {
        if (Keyboard.isVisible()) return;
        const newLabel = await addLabel({name, color: Colors.listColor[indexColorSelected]});
        onAddLabel?.(newLabel);
    }

    const onPressUpdate = async () => {
        if (Keyboard.isVisible()) return;
        const newLabel = await updateLabel({name, color: Colors.listColor[indexColorSelected]});
        onUpdateLabel?.(newLabel);
    }

    const onPressCancel = () => {
        if (Keyboard.isVisible()) return;
        onCancel?.({name, color: Colors.listColor[indexColorSelected]});
    }

    React.useEffect(() => {
        if (mode === 'edit' && !label) {
            console.error('LabelModal: label is required when mode is edit');
        }
    }, []);

    React.useEffect(() => {
        if (loading) {
            alert({
                title: 'Loading...',
                message: 'Please wait. We are processing your request.', //move to constant
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
            alert({
                title: 'Success',
                message: 'Your label has been successfully added.', //move to constant
                type: 'confirm',
            })
        }
    }, [loading, error]);

    return (
        <Modal transparent={true} animationType='fade' visible={visible}>
            <KeyboardOptimizeView style={styles.container}>
                <Overlay onPress={onPressCancel} background={'highOpacity'}/>

                {/* Modal parts */}
                <Animated.View style={[styles.modalContainer, {backgroundColor: colors.card}]}
                            entering={ZoomInEasyDown}
                >
                        
                    {/* Add/Edit and Close Buttons */}
                    <View style={[styles.buttonsContainer]}>
                        {
                            mode === 'add'
                            ? 
                                (<Pressable  onPress={onPressAdd} hitSlop={6}>
                                    <Icon name="plus" size={sizeButton} color={colors.text} library='Octicons'/>
                                </Pressable>)
                            :
                                (<Pressable  onPress={onPressUpdate} hitSlop={6}>
                                    <Icon name="cloud-upload" size={sizeButton} color={colors.text} library='SimpleLineIcons'/>
                                </Pressable>)
                        }

                        <Pressable  onPress={onPressCancel} hitSlop={6}>
                            <Icon name="window-close" size={sizeButton} color={colors.text} library='MaterialCommunityIcons'/>
                        </Pressable>
                    </View>

                    {/* Labels Parts  */}
                    <TextInput style={[styles.label, {color: colors.text}]} multiline={true}
                                onChangeText={setName} value={name}/>
                    <View style={[styles.decorationLine, {backgroundColor: colors.border}]}></View>

                    {/* List of colors */}
                    <View style={[styles.colorsContainer]}>
                        {Colors.listColor.map((color, index) => (
                            <ColorSelect key={index} color={color} index={index} 
                                        currentSelectedIndex={indexColorSelected}
                                        onPress={() => setIndexColor(index)}/>
                        ))}
                        <ColorSelect key={-1} color={colors.background} index={-1}
                                    currentSelectedIndex={indexColorSelected}
                                    onPress={() => setIndexColor(-1)}/>
                    </View>
                </Animated.View>

                {
                    alertProps &&
                    <AlertModal
                        {...alertProps}
                        visible={modalVisible}
                    />
                }

            </KeyboardOptimizeView>
        </Modal>
    )
}
export default LabelModal;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.all,
        ...Layouts.screen,
    },
    modalContainer: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: Outlines.borderRadius.large,
        overflow: 'hidden',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'flex-end',
        gap: 20,
    },
    label: {
        ...Typography.subheader.x40,
    },
    decorationLine: {
        width: '100%',
        height: 1,
        marginTop: 8,
    },
    colorsContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});