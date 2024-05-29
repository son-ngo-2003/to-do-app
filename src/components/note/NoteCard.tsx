import * as React from 'react';
import { Text, View, Pressable, StyleSheet, DimensionValue} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Bases, Typography, Outlines } from '../../styles';
import { useTheme } from '@react-navigation/native';

//Components
import { Icon } from '../atomic';
import { LabelTag } from '../label';

type NoteCardProps = {
    note: Note,
    orientation: 'landscape' | 'portrait',
    showLabels?: boolean,
}

const NoteCard: React.FC<NoteCardProps> = ({ note, orientation, showLabels = true }) => {
    const { colors } = useTheme();
    let dimensions : {width: DimensionValue, height: number} = {width: 240, height: 150};
    orientation === 'portrait' && (dimensions.width = '100%', dimensions.height = 200);
    showLabels && (dimensions.height += 40);

    const onPressCard = React.useCallback(() => {
        console.log(note);
    },[]);

    const onPressDeleteButton = React.useCallback(() => {
        console.log("delete note")
    },[]);

    const onPressEditButton = React.useCallback(() => {
        console.log("edit note")
    },[]);

    return (
        <View  //onPress={onPressCard}
                    style={[styles.container, {backgroundColor: colors.card},
                            dimensions,]}>
            <View style={[styles.buttonsContainer]}>
                <Pressable  onPress={onPressEditButton}
                            style={Bases.flip.horizontal}  hitSlop={6}>
                    <Icon name="pencil" size={20} color={colors.text} library='Octicons'/>
                </Pressable>

                <Pressable onPress={onPressDeleteButton} hitSlop={6}>
                    <Icon name="window-close" size={25} color={colors.text} library='MaterialCommunityIcons'/>
                </Pressable>
            </View>

            <Pressable onPress={onPressCard}>
                <Text   numberOfLines={2}
                        style={[Typography.header.x40, styles.heading,
                            {color: colors.text}            
                ]}>{note.title}</Text>

                <Text   numberOfLines={orientation === 'portrait' ? 7 : 4}
                        style={[Typography.body.x20, styles.info, 
                            {color: colors.text}
                ]}>{note.content}</Text>
            </Pressable>

            {
                showLabels &&
                <ScrollView style={[styles.labelsContainer]}
                            contentContainerStyle={styles.labelsContentContainer}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            >
                    {note.labels.map((label: Label, index) => (
                        <LabelTag key={index} text={label.name} color={label.color}/>
                    ))}
                </ScrollView>
            }
        </View>
    )
}
export default NoteCard;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
    },
    heading: {
        ...Typography.lineHeight.x20,
        marginTop: 10,
    },
    info: {
        lineHeight: 15,
        marginTop: 3,
        textAlign: 'justify',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        width: '100%',
    },
    labelsContainer: {
        //alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    labelsContentContainer: {
        alignItems: 'center',
        gap: 10,
    }
});