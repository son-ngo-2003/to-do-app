import {
    RecyclerListView, DataProvider, LayoutProvider,
    type RecyclerListViewProps
} from "recyclerlistview";
import * as React from "react";
import {useState} from "react";
import {NativeScrollEvent, NativeSyntheticEvent} from "react-native";

export interface InfinityListProps
    extends Omit<RecyclerListViewProps, 'dataProvider' | 'layoutProvider' | 'rowRenderer' | 'initialRenderIndex' > {

    getData: ( previousData : any[] | null, position?: 'start' | 'end' ) => any[]; //will run when reach end or start of list, previousData = null when first time get data
    rowRenderer: RecyclerListViewProps['rowRenderer'];
    layoutProvider: LayoutProvider;
    rowHasChangedFunc?: (r1: any, r2: any) => boolean;

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
        rowRenderer,
        layoutProvider,

        isHorizontal,
        pagingEnabled= false,

        onScroll,
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

    const dataProvider = React.useMemo( () => new DataProvider(
        rowHasChangedFunc || ( (r1, r2) => r1 != r2 )
    ), [rowHasChangedFunc]);
    const initData = React.useMemo( () => getData(null), [getData]);
    const [dataProviderState, setDataProviderState] = useState( dataProvider.cloneWithRows( initData ) );

    const _initialIndex = React.useMemo( () =>
            initialRenderIndex !== 'center' ? initialRenderIndex : Math.floor(initData.length / 2)
        ,[initialRenderIndex, initData.length])

    const reachThreshold = React.useMemo( () => onEndReachedThreshold || 2, [onEndReachedThreshold] );

    const _onEndReached = React.useCallback( () => {
        setDataProviderState(
            dataProviderState.cloneWithRows( getData( dataProviderState.getAllData(), 'end' ) )
        );
        onEndReached?.();
    }, [dataProviderState, getData, onEndReached] );

    const _onFrontReached = React.useCallback( () => {
        const oldData = dataProviderState.getAllData()
        const newData = getData( oldData , 'start' )
        // @ts-ignore
        listRef.current?.scrollToIndex( newData.length - oldData.length )
        setDataProviderState(
            dataProviderState.cloneWithRows( newData )
        );
    }, [dataProviderState, getData, listRef?.current] );

    const _onMomentumScrollEnd = React.useCallback( (event : NativeSyntheticEvent<NativeScrollEvent>) => {
        const {x, y} = event.nativeEvent.contentOffset
        if ( (isHorizontal && x < reachThreshold)
            || (!isHorizontal && y < reachThreshold)  //for vertical list, check y offset instead of x offset
        ) {
            _onFrontReached();
        }

        onMomentumScrollEnd?.(event)
    }, [isHorizontal, reachThreshold, _onFrontReached, onMomentumScrollEnd] )

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
            onEndReachedThreshold={ reachThreshold }

            isHorizontal={ isHorizontal }
            scrollViewProps={ scrollViewProps }
        />
    );
});

export default React.memo( InfinityList );