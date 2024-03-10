import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './storageService';

jest.mock('@react-native-async-storage/async-storage', () => {
    return {
        setItem: jest.fn(),
        getItem: jest.fn(),
        getAllKeys: jest.fn(),
        multiRemove: jest.fn(),
        multiGet: jest.fn(),
    };
});

describe('StorageService', () => {
    beforeEach(() => {
        (AsyncStorage.setItem as jest.Mock).mockClear();
        (AsyncStorage.getItem as jest.Mock).mockClear();
        (AsyncStorage.getAllKeys as jest.Mock).mockClear();
        (AsyncStorage.multiRemove as jest.Mock).mockClear();
    });

    it('should add data to AsyncStorage', async () => {
        const data = { id: 1, name: 'Task 1' };
        const type = 'tasks';
        const index = 0;

        await StorageService.addData(data, type, index);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            `@${type}:${index}`,
            JSON.stringify(data)
        );
    });

    it('should get all data by type from AsyncStorage', async () => {
        const type = 'tasks';
        const numberOfData = 5;

        const mockData = [
            { id: 1, name: 'Task 1' },
            { id: 2, name: 'Task 2' },
            { id: 3, name: 'Task 3' },
            { id: 4, name: 'Task 4' },
            { id: 5, name: 'Task 5' },
        ];

        (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(
            Array.from({ length: numberOfData }, (_, index) => `@${type}:${index}`)
        );

        (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce(
            mockData.map((data) => [null, JSON.stringify(data)])
        );

        const result = await StorageService.getAllDataByType(type, numberOfData);

        expect(AsyncStorage.getAllKeys).toHaveBeenCalledWith();
        expect(AsyncStorage.multiGet).toHaveBeenCalledWith(
            Array.from({ length: numberOfData }, (_, index) => `@${type}:${index}`)
        );
        expect(result).toEqual(mockData);
    });
});
