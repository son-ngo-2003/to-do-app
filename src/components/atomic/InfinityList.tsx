import {
    RecyclerListView, DataProvider, LayoutProvider,
    type RecyclerListViewProps
} from "recyclerlistview";
import * as React from "react";
import {useMemo, useState} from "react";
import {NativeScrollEvent, NativeSyntheticEvent} from "react-native";

export interface InfinityListProps
    extends Omit<RecyclerListViewProps, 'dataProvider' | 'layoutProvider' | 'rowRenderer' | 'initialRenderIndex' > {

    getData: ( previousData : any[] | null, position?: 'start' | 'end' ) => any[]; //will run when reach end or start of list, previousData = null when first time get data
    rowRenderer: RecyclerListViewProps['rowRenderer'];
    layoutProvider: LayoutProvider;
    rowHasChangedFunc?: (r1: any, r2: any) => boolean;
    getStableId?: (index: number) => string;

    onFrontReached?: () => void;
    onFrontReachedThreshold?: number;

    onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    pagingEnabled?: boolean;
    initialRenderIndex?: number | 'center';
    showIndicator?: boolean;
}

const InfinityList = React.forwardRef<any, InfinityListProps>( (
    props,
    ref,
) => {
    const {
        getData,
        rowHasChangedFunc,
        getStableId,
        rowRenderer,
        layoutProvider,

        isHorizontal,
        pagingEnabled= false,

        onScroll,
        onFrontReached,
        onFrontReachedThreshold,
        onEndReached,
        onEndReachedThreshold,

        onMomentumScrollEnd,
        onMomentumScrollBegin,

        initialRenderIndex = 'center',
        showIndicator = true,
        ...rest
    } = props;

    const listRef = React.useRef(null)
    React.useImperativeHandle( ref, () => listRef.current, [listRef.current] )

    // Data parts
    const dataProvider = React.useMemo( () => new DataProvider(
        rowHasChangedFunc || ( (r1, r2) => r1 != r2 ),
        getStableId
    ), [rowHasChangedFunc, getStableId]);
    const initData = useMemo( () => getData(null), [getData] );
    const [dataProviderState, setDataProviderState] = useState( dataProvider.cloneWithRows(initData) );
    const [loadingData, setLoadingData] = useState(false);

    const _onEndReached = React.useCallback( () => {
        if (!loadingData) {
            setLoadingData(true);
            const newData = getData( dataProviderState.getAllData(), 'end' );
            setDataProviderState(dataProviderState.cloneWithRows(newData));
            setLoadingData(false);
        }
        onEndReached?.();
    }, [dataProviderState, getData, onEndReached, loadingData] );

    const _onFrontReached = React.useCallback( () => {
        if (!loadingData) {
            setLoadingData(true);
            const oldData = dataProviderState.getAllData();
            const newData = getData( oldData, 'end' );
            setDataProviderState(dataProviderState.cloneWithRows(newData));
            setTimeout(() => {
                // @ts-ignore
                listRef.current?.scrollToIndex(newData.length - oldData.length);
            }, 10); // Ensure that the list has been updated before scrolling
            setLoadingData(false);
        }
        onFrontReached?.();
    }, [dataProviderState, getData, loadingData, onFrontReached, listRef.current] );

    // Layout parts
    const _initialIndex = React.useMemo( () =>
        initialRenderIndex !== 'center' ? initialRenderIndex : Math.floor(initData.length / 2)
    ,[initialRenderIndex, initData.length])

    const _onFrontReachedThreshold = React.useMemo( () => onFrontReachedThreshold || 2, [onFrontReachedThreshold] )

    const _onMomentumScrollEnd = React.useCallback( (event : NativeSyntheticEvent<NativeScrollEvent>) => {
        const {x, y} = event.nativeEvent.contentOffset
        if ( (isHorizontal && x < _onFrontReachedThreshold) || (!isHorizontal && y < _onFrontReachedThreshold)) {
            _onFrontReached();
        }

        onMomentumScrollEnd?.(event)
    }, [isHorizontal, _onFrontReached, onMomentumScrollEnd] )

    const scrollViewProps = React.useMemo( () => ({
        ...rest.scrollViewProps,
        pagingEnabled,
        onMomentumScrollBegin,
        onMomentumScrollEnd: _onMomentumScrollEnd,
        showsHorizontalScrollIndicator: showIndicator,
        showsVerticalScrollIndicator: showIndicator,
    }), [pagingEnabled, rest.scrollViewProps, onMomentumScrollBegin, _onMomentumScrollEnd, showIndicator])

    return (
        <RecyclerListView
            { ...rest }

            ref = { listRef }

            dataProvider={ dataProviderState }
            layoutProvider={ layoutProvider }
            rowRenderer={ rowRenderer }

            initialRenderIndex={ _initialIndex }

            onScroll={onScroll}
            onEndReached={ _onEndReached }
            onEndReachedThreshold={ onFrontReachedThreshold }

            isHorizontal={ isHorizontal }
            scrollViewProps={ scrollViewProps }
        />
    );
});

export default InfinityList;