
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../models'
import {replacer, reviver} from "../../utils/jsonUtil";
import {BaseFilter} from "../type";
import {generalCompare} from "../../utils/sortUtil";

interface StorageServiceType {
    addData:                    <T extends { _id: string, isDeleted: boolean }>  (data: T, type: ModelType, index: number) => Promise<Message<T>>,
    getAllDataByType:           <T extends { isDeleted: boolean }>               (type: ModelType, filter?: BaseFilter) => Promise<Message<T[]>>,
    getDataByTypeAndId:         <T extends { _id: string, isDeleted: boolean }>  (type: ModelType, _id: string) => Promise<Message<T>>,
    updateDataByTypeAndId:      <T extends { _id: string, isDeleted: boolean }>  (type: ModelType, _id: string, newData: Partial<T>) => Promise<Message<T>>,
    deleteSoftDataByTypeAndId:  <T extends { _id: string, isDeleted: boolean }>  (type: ModelType, _id: string) => Promise<Message<T>>,
    deleteForceDataByTypeAndId: <T extends { _id: string }>                      (type: ModelType, _id: string) => Promise<Message<T>>,
    clearAllData:               (type: ModelType) => Promise<Message<string>>,
}

const StorageService : StorageServiceType = (() => {
    const limitDocument: number = 2000; //TODO: add to constants

    async function addData<T extends {_id: string}>
        (data: T, type: ModelType): Promise<Message<T>> {
            try {
                let numberOfDocuments = (await AsyncStorage.getAllKeys()).length;
                if (numberOfDocuments >= limitDocument) {
                    throw new Error(`Storage service has reached the limit of ${limitDocument} documents`);
                }

                const jsonValue = JSON.stringify(data, replacer);
                await AsyncStorage.setItem(`@${type}:${data._id}`, jsonValue);
                return Message.success<T>(data);
            }
            catch (error) {
                return Message.failure<T>(error);
            }
    }

    async function getAllDataByType<T extends {isDeleted : boolean}>
        ( type: ModelType, filter: BaseFilter = {} ): Promise<Message<T[]>> {
            try {
                const keys: string[] = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(`@${type}`));

                const dataJSONValue = await AsyncStorage.multiGet(keys);
                if (!dataJSONValue || dataJSONValue.length === 0) return Message.success([]);

                console.log(filter);
                const { limit, offset = 0, sortBy, sortOrder } = filter;
                const _sortBy = sortBy as keyof T;

                const listData: T[] = dataJSONValue
                    .map(([_, value]) => {
                        if (value === null) return;
                        const data: T = JSON.parse(value, reviver);
                        return data;
                    })
                    .filter((data) => data && !data.isDeleted)
                    .sort((a, b) => {
                        if (!sortBy) return 0;
                        console.log('compare: ', a?.[_sortBy], b?.[_sortBy], generalCompare(a?.[_sortBy], b?.[_sortBy], sortOrder));
                        return generalCompare(a?.[_sortBy], b?.[_sortBy], sortOrder);
                    })
                    .slice(offset, limit ? offset + limit : undefined) as T[];

                const _offset = filter?.offset || 0;
                if (filter?.limit) {
                    listData.slice(filter?.offset, _offset + filter?.limit);
                }

                return Message.success(listData);
            }
            catch (error) {
                return Message.failure(error);
            }
    }

    async function getDataByTypeAndId<T extends { _id: string, isDeleted: boolean }>
        (type: ModelType, id: string): Promise<Message<T>> {
            try {
                const key: string = `@${type}:${id}`;
                const value: string | null = await AsyncStorage.getItem(key);
                if (!value) return Message.failure('Data not found!');

                const data: T = JSON.parse(value, reviver);
                if (!data || data.isDeleted) return Message.failure('Data not found!');
                return Message.success(data);
            }
            catch (error) {
                return Message.failure(error);
            }
    }

    async function updateDataByTypeAndId<T extends { _id: string, isDeleted: boolean }>
        (type: ModelType, id: string, newData: Partial<T>): Promise<Message<T>> {
            try {
                const key: string = `@${type}:${id}`;
                const value: string | null = await AsyncStorage.getItem(key);
                if (!value) return Message.failure('Data not found!');

                const existingData: T = JSON.parse(value, reviver);
                if (!existingData || existingData.isDeleted) return Message.failure('Data not found!');

                const updatedData: T = { ...existingData, ...newData };

                const jsonValue = JSON.stringify(updatedData, replacer);
                await AsyncStorage.setItem(key, jsonValue);
                return Message.success(updatedData);
            }
            catch (error) {
                return Message.failure(error);
            }
    }

    async function deleteSoftDataByTypeAndId<T extends { _id: string, isDeleted: boolean }>
        (type: ModelType, id: string): Promise<Message<T>> {
            try {
                const key: string = `@${type}:${id}`;
                const value: string | null = await AsyncStorage.getItem(key);
                if (!value) return Message.failure('Data not found!');
                const data: T = JSON.parse(value, reviver);
                
                data.isDeleted = true;
                const jsonValue = JSON.stringify(data, replacer);
                await AsyncStorage.setItem(key, jsonValue);
                return Message.success(data);
            }
            catch (error) {
                return Message.failure(error);
            }
    }

    async function deleteForceDataByTypeAndId<T extends { _id: string }>
        (type: ModelType, id: string): Promise<Message<T>> {
            try {
                const key: string = `@${type}:${id}`;
                const value: string | null = await AsyncStorage.getItem(key);
                if (!value) return Message.failure('Data not found!');

                await AsyncStorage.removeItem(key);
                return Message.success(JSON.parse(value, reviver));
            }
            catch (error) {
                return Message.failure(error);
            }
    }

    async function clearAllData(type: ModelType): Promise<Message<string>> {
        try {
            const keys: string[] = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(`@${type}`));
            await AsyncStorage.multiRemove(keys);
            return Message.success('All data has been deleted!');
        }
        catch (error) {
            return Message.failure(error);
        }
    }

    return {
        addData,
        getAllDataByType,
        getDataByTypeAndId,
        updateDataByTypeAndId,
        deleteSoftDataByTypeAndId,
        deleteForceDataByTypeAndId,
        clearAllData,
    };
})();

export default StorageService;