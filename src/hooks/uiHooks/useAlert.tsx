import React, {useCallback} from "react";
import AlertModal, {AlertModalProps} from "../../components/atomic/AlertModal";
import {primary} from "../../styles/colors";

type AlertType = 'confirm' | 'error' | 'warning' | 'info' | 'pending';

type AlertContextProps = {
    alert: (props: AlertModalProps) => Promise<boolean>,
    alertModalVisible: boolean
};
const alertContext = React.createContext< AlertContextProps | undefined >(undefined);

type AlertFunctionType = (props: AlertModalProps) => Promise<any>;
//return a promise that resolve to true if user press primary button, false if user press secondary button and undefined if close by pressing X or outside of modal
//in case hidePopUp is called, the promise will resolve to the value passed to hidePopUp

interface AlertProviderProps {
    children: React.ReactNode;
}

const useAlertProvider = () => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [alertProps, setAlertProps] = React.useState<AlertModalProps>();
    const resolveCallback = React.useRef<(result: any) => void>();

    const hidePopUp = (
        result?: any //result will be passed to the resolve of the promise returned by alert function
    ) => {
        setModalVisible(false);
        resolveCallback.current?.(result);
        resolveCallback.current = undefined; // Clear after resolving
    }

    const onPrimaryPress = (props : AlertModalProps) => {
        hidePopUp(true);
        props?.primaryButton?.onPress?.();
    }

    const onSecondaryPress = (props : AlertModalProps) => {
        hidePopUp(false);
        props?.secondaryButton?.onPress?.();
    }

    const onPressCancel = (props : AlertModalProps) => {
        hidePopUp(undefined);
        props?.onPressCancel?.();
    }

    const alert : AlertFunctionType = (props: AlertModalProps) => {
        setAlertProps({
            ...props,
            primaryButton: { ...props.primaryButton, onPress: () => onPrimaryPress(props) },
            secondaryButton: { ...props.secondaryButton, onPress: () => onSecondaryPress(props) },
            onPressCancel: props?.onPressCancel ? () => onPressCancel(props) : undefined,
            visible: modalVisible,
        });
        setModalVisible(true);
        return new Promise<any>((resolve) => {
            resolveCallback.current = resolve;
        });
    }

    return {
        alert,
        modalVisible,
        alertProps,
        hidePopUp,
    }
};

const AlertProvider : React.FC<AlertProviderProps>  = ({ children }) => {
    const {
        alert,
        modalVisible, alertProps,
    } = useAlertProvider();

    return (
        <alertContext.Provider value={{alert, alertModalVisible: modalVisible}}>
            {children}
            {
                alertProps &&
                <AlertModal
                    {...alertProps}
                    visible={modalVisible}
                />
            }
        </alertContext.Provider>
    );
};

const useAlert = () => {
    const context = React.useContext(alertContext);
    if (!context) {
        throw new Error("useAlert must be used within a AlertProvider");
    }
    return context;
}

export {
    AlertType,
    AlertFunctionType,
    useAlertProvider,
    AlertProvider,
    useAlert,
}

