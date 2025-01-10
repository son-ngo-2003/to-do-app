import React, {useState} from "react";
import _ from "lodash";

type useGroupDataStateProps<T> = {
    keys: any[],
    keyExtractor?: (data: any) => any, //if keyExtractor is not provided, the key will be the data itself
                                        //this also used to compare the key in keys

    fetcher: (key: any, limit: number, offset: number) => Promise<T[]>, //your key, not the extracted key
    limitFetch: number,
}

function useGroupDataState<T> ({
    keys,
    keyExtractor,
    fetcher,
    limitFetch,
} : useGroupDataStateProps<T>) {
    const [ data, setData ] = useState<Record<any, T[]>>({});
    const [ hasMore, setHasMore ] = useState<Record<any, boolean>>({});
    const [ extractedKeys, setExtractedKeys ] = useState<any[]>([]);
    const _keyExtractor = React.useCallback((key: any) => keyExtractor ? keyExtractor(key) : key, [keyExtractor]);

    React.useEffect(() => {
        resetData();
    }, []);

    const updateGroup = React.useCallback((key: any, limit: number = limitFetch) => {
        const usedKey = _keyExtractor(key);
        const oldData = data[usedKey];
        fetcher(key, limit + 1, oldData.length).then((result) => {
            const _data = {...data};
            _data[usedKey] = oldData.concat(result.slice(0, limit));
            setData(_data);
            setHasMore({...hasMore, [usedKey]: result.length > limit});
        });
    }, [data, _keyExtractor, fetcher, limitFetch]);

    const getData = React.useCallback((key: any) => {
        return data[_keyExtractor(key)];
    }, [data])

    const getHasMore = React.useCallback((key: any) => {
        return hasMore[_keyExtractor(key)];
    }, [hasMore, data])

    const refreshData = React.useCallback(() => {
        Promise.all(
            keys.map((key, index) =>{
                return fetcher(key, Math.max(data[ extractedKeys[index] ]?.length || 0, limitFetch) + 1, 0)
            })
        )
            .then((results) => {
                const _data : Record<string, any[]> = {};
                const _hasMore : Record<string, boolean> = {};
                extractedKeys.forEach((extractedKey, index) => {
                    const lengthToFetch = Math.max(data[extractedKey]?.length || 0, limitFetch);
                    _data[extractedKey] = results[index].slice(0, lengthToFetch);
                    _hasMore[extractedKey] = results[index].length > lengthToFetch;
                });
                setData(_data);
                setHasMore(_hasMore);
            });
    }, [keys, extractedKeys, fetcher, data, limitFetch]);

    const resetData = React.useCallback(() => {
        const _extractedKeys = keys.map(_keyExtractor);
        setExtractedKeys(_extractedKeys);

        Promise.all(keys.map(key => fetcher(key, limitFetch + 1, 0))).then((results) => {
            const _data : Record<string, any[]> = {};
            const _hasMore : Record<string, boolean> = {};
            _extractedKeys.forEach((key, index) => {
                _data[key] = results[index].slice(0, limitFetch);
                _hasMore[key] = results[index].length > limitFetch;
            });
            setData(_data);
            setHasMore(_hasMore);
        });
    }, [keys, fetcher, limitFetch, setData, setHasMore]);

    React.useEffect(() => {
        const newExtractedKeys = keys.map(_keyExtractor);
        if (_.isEqual(newExtractedKeys, extractedKeys)) return;

        setExtractedKeys(newExtractedKeys);
        const indexNewAddedKeys = newExtractedKeys.map(key => !extractedKeys.includes(key));
        const wholeNewKeys = indexNewAddedKeys.map((isAdded, index) => isAdded ? keys[index] : undefined).filter(key => key !== undefined);

        Promise.all(wholeNewKeys.map(key => fetcher(key, limitFetch + 1, 0))).then((results) => {
            const _data : Record<string, any[]> = {...data};
            const _hasMore : Record<string, boolean> = {...hasMore};
            wholeNewKeys.forEach((key, index) => {
                const _key = keyExtractor ? keyExtractor(key) : key;
                _data[_key] = results[index].slice(0, limitFetch);
                _hasMore[_key] = results[index].length > limitFetch;
            });

            setData(_data);
            setHasMore(_hasMore);
        });

    }, [keys]);

    return {
        data,
        extractedKeys,
        updateGroup,
        getData,
        getHasMore,
        refreshData,
        resetData,
    }
}

export default useGroupDataState;