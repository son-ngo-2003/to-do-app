import Modal, {type ModalProps } from "react-native-modal";
import React from "react";

export interface BaseModalProps extends Partial<ModalProps> {
    children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = (props) => {
    return (
        <Modal {...props}/>
    );
}

export default BaseModal;

export const MODAL_MARGIN = 20;