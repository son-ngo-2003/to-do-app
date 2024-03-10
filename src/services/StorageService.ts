
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageServiceType {
    addData: <T>(data: T, type: string, index: number) => Promise<void>,
    getAllDataByType: <T>(type: string, numberOfData: number) => Promise<T[]>,
}

const StorageService : StorageServiceType = (() => {
    let numberOfDocuments: number = 0;

    async function addData<T>(data: T, type: string, index: number): Promise<void> {
        try {
            numberOfDocuments++;
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem(`${type}_${index}`, jsonValue);
        }
        catch (error) {
            console.log(error);
            numberOfDocuments--;
        }
    }

    async function getAllDataByType<T>(type: string, numberOfData: number): Promise<T[]> {
        try {
            const keys: string[] = [];
            for (let i = 1; i <= numberOfData; i++) {
                keys.push(`${type}_${i}`);
            }
            const dataJSONValue = await AsyncStorage.multiGet(keys);

            const listData : T[] = dataJSONValue.map(([ _ , value]) => {
                if (value === null) return;
                const label: T = JSON.parse(value);
                return label;
            }) as T[];

            return listData;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }

    return {
        addData,
        getAllDataByType,
    };
})();

export default StorageService;