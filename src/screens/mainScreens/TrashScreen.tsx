import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrashScreen : React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Trash Screen!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default TrashScreen;