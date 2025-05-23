import React, { useContext, useEffect, useRef, useState } from "react"
import { Animated, ScrollView, ScrollViewProps } from "react-native"
import { SyncedScrollViewContext } from "../../contexts/SyncedScrollViewContext"
// import {useTraceUpdate} from "../../hooks";

// ----------------------------------------------------------------------------

interface SyncedScrollViewProps extends ScrollViewProps {
    _id: number,
    initialOffset?: number,
}

const SyncedScrollView = React.forwardRef<ScrollView, SyncedScrollViewProps>((
    props,
    ref
) => {
    // useTraceUpdate(props)

    const { _id, initialOffset = 0, ...rest } = props;
    const { activeScrollView, offsetPercent } = useContext(SyncedScrollViewContext)

    // Get relevant ScrollView Dimensions --------------------------------------------------

    const [scrollViewLength, setScrollViewLength] = useState(0)
    const [contentLength, setContentLength] = useState(0)

    const [scrollableLength, setScrollableLength] = useState(0)

    // Calculate the scrollable Length everytime the contentLength or scrollViewLength changes
    useEffect(() => {
        // The scrollable length is the difference between the content length and the ScrollView length
        setScrollableLength(contentLength - scrollViewLength)
    }, [scrollViewLength, contentLength])

    const handleLayout = ({ nativeEvent: { layout: { width, height } } }: any) => {
        // The length of the scrollView depends on the orientation we scroll in
        setScrollViewLength(props.horizontal ? width : height)
    }

    const handleContentSizeChange = (width: number, height: number) => {
        // The length of the content inside the scrollView depends on the orientation we scroll in
        setContentLength(props.horizontal ? width : height)
    }

    // handle yPercent change ---------------------------------------------------

    offsetPercent?.addListener(({ value }) => {
        // Only respond to changes of the offsetPercent if this scrollView is NOT the activeScrollView
        // --> The active ScrollView responding to its own changes would cause an infinite loop
        // @ts-ignore
        if (_id !== activeScrollView._value && scrollableLength > 0) {
            // Depending on the orientation we scroll in, we need to use different properties
            scrollViewRef.current && scrollViewRef.current.scrollTo({ [props.horizontal ? 'x' : 'y']: value * scrollableLength, animated: false })
        }
    })

    // handleScroll ---------------------------------------------------------------
    let scrollViewRef = useRef<ScrollView>(null)

    React.useImperativeHandle(ref, () => scrollViewRef.current as ScrollView, [scrollViewRef.current]);

    const offset = new Animated.Value(initialOffset)

    const handleScroll = Animated.event(
        // Depending on the orientation we scroll in, we need to use different properties
        [{ nativeEvent: { contentOffset: { [props.horizontal ? 'x' : 'y']: offset } } }],
        { useNativeDriver: true }
    )

    offset.addListener(({ value }) => {
        // Only change the offsetPercent if the scrollView IS the activeScrollView
        // --> The inactive ScrollViews changing the offsetPercent would cause an infinite loop
        // @ts-ignore
        if (_id === activeScrollView._value && scrollableLength > 0) {
            offsetPercent.setValue(value / scrollableLength)
        }
    })

    // onTouch ----------------------------------------------------------------------------

    // Change this ScrollView to the active ScrollView when it is touched
    const handleTouchStart = () => {
        activeScrollView.setValue(_id)
    }

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({[props.horizontal ? 'x' : 'y']: initialOffset, animated: false})
        }, 0)
    }, []);

    return (
        <Animated.ScrollView
            {...rest}
            ref={ scrollViewRef }
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onTouchStart={handleTouchStart}
            onLayout={handleLayout}
            onContentSizeChange={handleContentSizeChange}
        />
    )
});

export default React.memo( SyncedScrollView );