import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        marginHorizontal: 12,
        marginVertical: 2,
        overflow: 'hidden',
    },
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingStart: 16,
        paddingEnd: 24,
    },
    label: {
        marginEnd: 12,
        marginVertical: 4,
        flex: 1,
    },
    labelText: {
        lineHeight: 24,
        textAlignVertical: 'center',
    },
});