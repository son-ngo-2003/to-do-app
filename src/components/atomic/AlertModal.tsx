import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {Pressable, View, StyleSheet, Text, ActivityIndicator, Modal} from 'react-native';
import {Typography, Outlines, Layouts, Bases, Colors} from '../../styles';
// import BaseModal from "./BaseModal";

//components
import { Icon, Overlay } from '../atomic';
import { AlertType } from "../../hooks";

const PRIMARY_BUTTON_TEXT = { //TODO: move to constant
    confirm: 'Confirm',
    warning: 'Continue',
    error: 'Try Again',
    info: 'OK',
    pending: undefined,
}

const SECONDARY_BUTTON_TEXT = { //TODO: move to constant
    confirm: 'Cancel',
    warning: 'Cancel',
    error: 'Close',
    info: undefined,
    pending: undefined,
}

const PRIMARY_BUTTON_COLOR = { //TODO: move to constant
    confirm: Colors.success.s400,
    warning: Colors.warning.s400,
    error: Colors.danger.s400,
    info: Colors.info.s400,
    pending: undefined,
}

const ICON = {
    confirm: { name: 'circle-check', library: 'FontAwesome6' },
    warning: { name: 'circle-exclamation', library: 'FontAwesome6' },
    error: { name: 'times-circle', library: 'FontAwesome5' },
    info: { name: 'circle-info', library: 'FontAwesome6' },
}

export type AlertButtonConfig = {
    text?: string,
    onPress?: () => void,
    color?: string,
}

export type AlertModalProps = {
    type : AlertType,
    visible?: boolean,

    title: string,
    message: string,

    showButtons?: boolean,
    primaryButton?: AlertButtonConfig,
    secondaryButton?: AlertButtonConfig,

    useCancel?: boolean, // If true, pressing X or outside of modal will close modal and call onPressCancel
    onPressCancel?: () => void, //In case useCancel: Call onPressCancel when user close by pressing X or outside of modal, if not provided, onSecondaryPress will be called instead

    onModalHide?: () => void,
    onModalWillHide?: () => void,
    onModalShow?: () => void,
    onModalWillShow?: () => void,
}

const sizeButton : number = 25;

const AlertModal: React.FC<AlertModalProps> = ({
    type,
    visible = true,

    title,
    message,

    showButtons = true,
    primaryButton,
    secondaryButton,

    useCancel = true ,
    onPressCancel,

    onModalHide,
    onModalWillHide,
    onModalShow,
    onModalWillShow,
}) => {
    const { colors } = useTheme();

    const buttonInfo = React.useMemo(() => ({
        title,
        message,

        primaryText: primaryButton?.text || PRIMARY_BUTTON_TEXT[type],
        secondaryText: secondaryButton?.text || SECONDARY_BUTTON_TEXT[type],

        primaryColor: primaryButton?.color || PRIMARY_BUTTON_COLOR[type],
        secondaryColor: secondaryButton?.color || colors.border,
    }), [title, message, type, colors.border, primaryButton?.text, secondaryButton?.text, primaryButton?.color, secondaryButton?.color]);

    const buttonsDirection = React.useMemo( () => (
        buttonInfo.secondaryText && buttonInfo.primaryText && buttonInfo.primaryText.length < 15 && buttonInfo.secondaryText.length < 15) ? 'row' : 'column'
    , [buttonInfo.secondaryText, buttonInfo.primaryText]);

    return (
        // <BaseModal isVisible={visible} hasBackdrop={true} avoidKeyboard={true}
        //            animationIn={'fadeInUpBig'} animationInTiming={500} animationOut={'fadeOutDownBig'} animationOutTiming={500}
        //            onModalHide={onModalHide} onModalWillHide={onModalWillHide} onModalShow={onModalShow} onModalWillShow={onModalWillShow}
        //
        //            customBackdrop={<Overlay onPress={useCancel ? (onPressCancel ?? secondaryButton?.onPress ) : undefined} background={'highOpacity'}/>}
        // >
        <Modal visible={visible} animationType={'fade'} transparent={true} onRequestClose={onPressCancel ?? secondaryButton?.onPress}>
            <Overlay onPress={useCancel ? (onPressCancel ?? secondaryButton?.onPress ) : undefined} background={'highOpacity'}/>

            <View style={[styles.container]}>

                {/* Modal parts */}
                <View style={[styles.modalContainer, {backgroundColor: colors.card}]}>

                    {/* Close Buttons */}
                    {
                        useCancel &&
                        <View style={[styles.headerContainer]}>
                            <Pressable  onPress={onPressCancel ?? secondaryButton?.onPress} hitSlop={6}>
                                <Icon name="window-close" size={sizeButton} color={colors.text} library='MaterialCommunityIcons'/>
                            </Pressable>
                        </View>
                    }

                    {/* Icon */}
                    <View style={[styles.iconContainer]}>
                        {
                            type === 'pending'
                                ? <ActivityIndicator size={'small'} color={Colors.info.s400}/>
                                : <Icon name={ICON[type].name} size={sizeButton} color={PRIMARY_BUTTON_COLOR[type]} library={ICON[type].library}/>
                        }
                    </View>

                    {/* Title  */}
                    <Text style={[styles.title, {color: colors.text}]}>{buttonInfo.title}</Text>

                    {/* Message */}
                    <Text style={[styles.message, {color: colors.text}]}>{buttonInfo.message}</Text>

                    {/* Buttons */}
                    { showButtons &&
                        <View style={[styles.buttonsContainer, {
                            flexDirection: buttonsDirection,
                        }]}>
                            {   secondaryButton &&
                                <Pressable style={[styles.button, {backgroundColor: buttonInfo.secondaryColor, flex: buttonsDirection === 'row' ? 1 : 0}]}
                                           onPress={ ()=>{
                                               secondaryButton?.onPress?.()
                                           } }>
                                    <Text style={[styles.buttonText, {color: colors.text}]}>{buttonInfo.secondaryText}</Text>
                                </Pressable>
                            }

                            {
                                primaryButton &&
                                <Pressable style={[styles.button, {backgroundColor: buttonInfo.primaryColor, flex: buttonsDirection === 'row' ? 1 : 0}]}
                                           onPress={primaryButton?.onPress}>
                                    <Text style={[styles.buttonText, {color: colors.text}]}>{buttonInfo.primaryText}</Text>
                                </Pressable>
                            }
                        </View>

                    }

                </View>
            </View>
        </Modal>
    )
}
export default AlertModal;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.all,
        ...Layouts.screen,
    },

    modalContainer: {
        width: '75%',
        alignSelf: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: Outlines.borderRadius.large,
        overflow: 'hidden',
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent:'flex-end',
        position: 'absolute',
        top: 20,
        right: 20,
    },

    iconContainer: {
        ...Bases.centerItem.all,
        marginVertical: 10,
    },

    title: {
        ...Typography.subheader.x50,
        textAlign: 'center',
    },

    message: {
        ...Typography.body.x30,
        textAlign: 'center',
    },

    buttonsContainer: {
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 20,
    },

    button: {
        ...Bases.centerItem.all,
        paddingVertical: 10,
        borderRadius: Outlines.borderRadius.large,
    },

    buttonText: {
        ...Typography.body.x40,
    },
});