import * as React from 'react';
import {SWITCH_MODAL_GAP_TIME} from "../../constant";

export type SequentialModalsProps = {
    currentIndex?: number,
    modals: React.ReactNode[]; // Modal list
}

const SequentialModals: React.FC<SequentialModalsProps> = ({
    currentIndex,
    modals,
}) => {
    const [visibleIndex, setVisibleIndex] = React.useState<number | null | undefined>(null); // undefined: modal is manifesting, number: index of modal is showing, null : no modal is showing
    const toOpenIndex = React.useRef<number | null>(null);

    const openNextModal = React.useCallback(() => {
        setTimeout(() => {
            setVisibleIndex(toOpenIndex.current);
            toOpenIndex.current = null;
        }, visibleIndex === null ? 0 : SWITCH_MODAL_GAP_TIME);
    }, [toOpenIndex.current, setVisibleIndex, visibleIndex]);

    React.useEffect(() => {
        toOpenIndex.current = (currentIndex !== undefined && currentIndex >= 0 && currentIndex < modals.length)
                                ? currentIndex
                                : null;
        if (visibleIndex === null) {
            openNextModal();
            return;
        }
        setVisibleIndex(undefined);

    }, [currentIndex]);

    return (
        <>
            {modals.map((modal, index) => {
                const modalElement = modal as React.ReactElement;
                return React.cloneElement(modalElement, {
                    key: index,
                    visible: index === visibleIndex,
                    onModalHide: () => {
                        modalElement.props?.onModalHide && modalElement.props.onModalHide();
                        openNextModal();
                    },
                });
            })}
        </>
    )
}
export default SequentialModals;