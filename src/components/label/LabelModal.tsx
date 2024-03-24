import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Pressable, View, TextInput, StyleSheet, Modal, 
         Keyboard } from 'react-native';
import { Colors, Typography, Outlines, Layouts, Bases, Animations as Anim} from '../../styles';
import Animated,
        { useSharedValue, ZoomInEasyDown, useAnimatedStyle
} from 'react-native-reanimated';

//components
import { Icon, Overlay, KeyboardOptimizeView } from '../atomic';
import { ColorSelect } from './atomic/';

type LabelModalProps = {
    mode: 'add' | 'edit',
    label?: Label,
    setIsOpenModal: (isOpen: boolean) => void,
}

const sizeButton : number = 25;

const LabelModal: React.FC<LabelModalProps> = ({ mode, label, setIsOpenModal }) => {
    const [ name, setName ] = React.useState<string>((mode === 'add' || !label) ? '' :  label.name) ;
    const [ indexColorSelected, setIndexColor ] = React.useState<number>(   
                                                        (mode === 'add' || !label)
                                                            ? -1
                                                            : Colors.listColor.findIndex( (color) => label.color === color ) 
                                                    ) ;
    const { colors } = useTheme();

    const onPressAdd = () => {
        if (Keyboard.isVisible()) return;
        console.log('Add');
        setIsOpenModal(false);
    }

    const onPressUpdate = () => {
        if (Keyboard.isVisible()) return;
        console.log('Update');
        setIsOpenModal(false);
    }

    const onPressCancel = () => {
        if (Keyboard.isVisible()) return;
        console.log('Cancel');
        setIsOpenModal(false);
    }

    return (
        <Modal transparent={true} animationType='fade'>
            <KeyboardOptimizeView style={styles.container}>
                <Overlay onPress={onPressCancel} background='highOpacity'/>

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
        paddingVertical: 20,
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
        ...Typography.subheader.x50,
    },
    decorationLine: {
        width: '100%',
        height: 1,
        marginTop: 10,
    },
    colorsContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});