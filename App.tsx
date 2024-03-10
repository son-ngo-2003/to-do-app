import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { LabelService } from './src/services';
import StorageService from './src/services/StorageService';

export default function App() {
    async function testLabel() {
        const label: Partial<Label> = {
            name: 'Test Label',
            createdAt: new Date(),
            isDeleted: false,
        };

        const labelAdded : Label = (await LabelService.addLabel(label)).getData();
        const labels : Label[] = (await LabelService.getAllLabels()).getData();
        console.log(labels);
    }

    async function testUpdateLabel() {
        const id = 'ltm267q7t4cdapa';
        const label: Partial<Label> = {
            name: 'Test Label Updated',
            createdAt: new Date(),
            isDeleted: false,
        };
        const labelUpdated : Label = (await LabelService.updateLabelById(id, label)).getData();
        console.log(labelUpdated);
        const labels : Label[] = (await LabelService.getAllLabels()).getData();
        console.log(labels);
    }

    async function testDeleteLabel() {
        const id = 'ltm267q7t4cdapa';
        const labelDeleted : Label = (await LabelService.deleteLabelById(id)).getData();
        console.log(labelDeleted);
        const labels : Label[] = (await LabelService.getAllLabels()).getData();
        console.log(labels);
    }

    async function deleteLabels() {
        await StorageService.clearAllData('label');
    }

    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your!</Text>
            <Pressable onPress={testLabel}>
                <Text>Add Label</Text>
            </Pressable>
            <Pressable onPress={deleteLabels}>
                <Text>Delete All Labels</Text>
            </Pressable>
            <Pressable onPress={testUpdateLabel}>
                <Text>Update Label</Text>
            </Pressable>
            <Pressable onPress={testDeleteLabel}>
                <Text>Delete Label</Text>
            </Pressable>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
