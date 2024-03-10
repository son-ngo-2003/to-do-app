
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from './models'

interface StorageServiceType {
    addData:                    <T extends { _id: string, isDeleted: boolean }>  (data: T, type: ModelType, index: number) => Promise<Message<T>>,
    getAllDataByType:           <T extends { isDeleted: boolean }>               (type: ModelType) => Promise<Message<T[]>>,
    getDataByTypeAndId:         <T extends { _id: string, isDeleted: boolean }>  (type: ModelType, _id: string) => Promise<Message<T>>,
    updateDataByTypeAndId:      <T extends { _id: string, isDeleted: boolean }>  (type: ModelType, _id: string, newData: Partial<T>) => Promise<Message<T>>,
    deleteSoftDataByTypeAndId:  <T extends { _id: string, isDeleted: boolean }>  (type: ModelType, _id: string) => Promise<Message<T>>,
    deleteForceDataByTypeAndId: <T extends { _id: string }>                      (type: ModelType, _id: string) => Promise<Message<T>>,
    clearAllData:               (type: ModelType) => Promise<Message<string>>,
}

const StorageService : StorageServiceType = (() => {
    let numberOfDocuments: number = 0;
    const limitDocument: number = 2000;

    async function addData<T extends {_id: string}>
        (data: T, type: ModelType): Promise<Message<T>> {
            try {
                numberOfDocuments++;

                if (numberOfDocuments >= limitDocument) {
                    throw new Error(`Storage service has reached the limit of ${limitDocument} documents`);
                }

                const jsonValue = JSON.stringify(data);
                await AsyncStorage.setItem(`@${type}:${data._id}`, jsonValue);
                return Message.success<T>(data);
            }
            catch (error) {
                numberOfDocuments--;
                return Message.failure<T>(error);
            }
    }

    async function getAllDataByType<T extends {isDeleted : boolean}>
        ( type: ModelType ): Promise<Message<T[]>> {
            try {
                const keys: string[] = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(`@${type}`));

                const dataJSONValue = await AsyncStorage.multiGet(keys);
                if (!dataJSONValue || dataJSONValue.length === 0) return Message.success([]);

                const listData: T[] = dataJSONValue
                    .map(([_, value]) => {
                        if (value === null) return;
                        const data: T = JSON.parse(value);
                        return data;
                    })
                    .filter((data) => data && !data.isDeleted) as T[];

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

                const data: T = JSON.parse(value);
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

                const existingData: T = JSON.parse(value);
                if (!existingData || existingData.isDeleted) return Message.failure('Data not found!');

                const updatedData: T = { ...existingData, ...newData };

                const jsonValue = JSON.stringify(updatedData);
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
                const data: T = JSON.parse(value);
                
                data.isDeleted = true;
                const jsonValue = JSON.stringify(data);
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
                numberOfDocuments--;

                const key: string = `@${type}:${id}`;
                const value: string | null = await AsyncStorage.getItem(key);
                if (!value) return Message.failure('Data not found!');

                await AsyncStorage.removeItem(key);
                return Message.success(JSON.parse(value));
            }
            catch (error) {
                numberOfDocuments++;
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