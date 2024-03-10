// import AsyncStorage from '@react-native-async-storage/async-storage';
// import LabelService from './LabelService';

// describe('LabelService', () => {
//     beforeEach(() => {
//         // Clear AsyncStorage before each test
//         AsyncStorage.clear();
//     });

//     it('should add a label', async () => {
//         const label = { id: '1', name: 'Label 1' };
//         await LabelService.addLabel(label);

//         const labels = await LabelService.getAllLabels();
//         expect(labels).toHaveLength(1);
//         expect(labels[0]).toEqual(label);
//     });

//     it('should get all labels', async () => {
//         const label1 = { id: '1', name: 'Label 1' };
//         const label2 = { id: '2', name: 'Label 2' };

//         await LabelService.addLabel(label1);
//         await LabelService.addLabel(label2);

//         const labels = await LabelService.getAllLabels();
//         expect(labels).toHaveLength(2);
//         expect(labels).toContainEqual(label1);
//         expect(labels).toContainEqual(label2);
//     });
// });
