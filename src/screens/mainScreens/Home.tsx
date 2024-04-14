import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';

//components
import { LabelSelectItem, AddLabelCard, LabelModal, 
        NoteCard, NoteModal, TaskItem,
        NoteInTaskItem, AddNoteInTask, TaskProgressCard,
        CalendarListHeader, Calendar, CalendarProvider, CalendarList,
        TimeLine
} from '../../components/';


//Services
import { LabelService, NoteService, TaskService } from '../../services';
import StorageService from '../../services/StorageService'
import { Message } from '../../services/models';

import { Colors, Bases, Typography, Layouts } from '../../styles';
import moment from 'moment';
import { MarkedObject } from '../../components/calendar/calendar/DateItem';
import { CALENDAR_BODY_HEIGHT } from '../../components/calendar/constants';
import { TaskTimeLine } from '../../components/calendar/timeline/TimeLineColumn';

const HomeScreen : React.FC = () => {
    const [ isOpenModal, setIsOpenModal ] = React.useState<boolean>(false);
    // const { colors } = useTheme();
    // const [newLabel, setNewLabel] = React.useState<Label>();
    // const [newLabel2, setNewLabel2] = React.useState<Label>();
    // const [newNote, setNewNote] = React.useState<Note>();
    // const [ newTask, setNewTask ] = React.useState<Task>();


    const markedDate : Record<string, MarkedObject[]> = {
        '2024-04-03' : [{key: 'Working', color: 'red'},
                        {key: 'Study', color: 'green'},
                        {key: 'Project', color: 'pink'},
                        {key: 'Groceries', color: 'purple'}],
        '2024-04-06' : [{key: 'Working', color: 'red'},
                        {key: 'Study', color: 'green'}]
    }

    const taskList : TaskTimeLine[] = [
        {
            id: 1,
            start: moment({hour: 8, minute: 15}),
            end: moment({hour: 12, minute: 0}),
            isAllDay: false,
    
            title: 'Title 1',
            description: 'Description 1',
            color: 'purple',
        },
        {
            id: 2,
            start: moment({hour: 11, minute: 0}),
            end: moment({hour: 12, minute: 0}),
            isAllDay: false,
    
            title: 'Title 2',
            description: 'Description 2',
            color: 'blue',
        },
        {
            id: 3,
            start: moment({hour: 9, minute: 0}),
            end: moment({hour: 14, minute: 0}),
            isAllDay: false,
    
            title: 'Title 3',
            description: 'Description 3',
            color: 'green',
        },
        {
            id: 4,
            start: moment({hour: 10, minute: 0}),
            end: moment({hour: 12, minute: 0}),
            isAllDay: false,
    
            title: 'Title 4',
            description: 'Description 4',
            color: 'pink',
        },
        {
            id: 5,
            start: moment({hour: 9, minute: 15}),
            end: moment({hour: 11, minute: 30}),
            isAllDay: true,
    
            title: 'Title 4',
            description: 'Description 4',
            color: 'green',
        }
        
    ]

    // React.useEffect(() => {
    //     StorageService.clearAllData('label');


    //     const pro1 = LabelService.addLabel({name: "WORKING", color: Colors.primary.orange, numberOfTasks: 4, numberOfCompletedTasks: 3})
    //     const pro2 = LabelService.addLabel({name: "STUDY", color: Colors.primary.teal});
    //     const pro3 = LabelService.addLabel({name: "FREE TIME", color: Colors.primary.red});

    //     Promise.all([pro1, pro2, pro3]).then((messages: Message<Label>[]) => {
    //         const l1: Label = messages[0].getData();
    //         const l2: Label = messages[1].getData();
    //         const l3: Label = messages[2].getData();

    //         setNewLabel(l1);
    //         setNewLabel2(l2);

    //         NoteService.addNote({
    //             title: "New Note",
    //             content: "Lorem ipsum dolor sit amet, consecte adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Et netus et malesuada fames ac turpis egestas maecenas. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Felis bibendum ut tristique et egestas quis ipsum. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam. Auctor neque vitae tempus quam pellentesque nec nam.",
    //             labels: [l1, l2, l3],
    //         }).then((message: Message<Note>) => {
    //             setNewNote(message.getData());
    //         });

    //         TaskService.addTask({
    //             title: "New Task, ah, it i",
    //             labels: [l1, l2],
    //             start: new Date(),
    //             end: new Date(),
    //             repeat: 'none',
    //             isAnnouncement: false,
    //             isCompleted: false,
    //         }).then((message: Message<Task>) => {
    //             setNewTask(message.getData());
    //         });
    //     });
    // },[]);

    return (
        <View style={styles.container}>
    
            {/* <Text style={[styles.title]}>Welcome to the Home Screen!</Text>
            <View style={{width: '45%'}}>
                {newLabel && <LabelSelectItem label={newLabel} onPress={()=>{setIsOpenModal(true)}} isSelectedAtFirst/>}
                {newLabel && <TaskProgressCard label={newLabel} onPress={()=>{}}/>}

            </View> 
            {   isOpenModal &&
                <NoteModal
                    mode="edit"
                    setIsOpenModal={setIsOpenModal}
                    note={newNote}
                    onAddNote={()=>{}}
                ></NoteModal>
            }
            {//newNote && <NoteCard note={newNote} orientation='portrait' showLabels={true}/>
            }
            {newNote && <NoteInTaskItem note={newNote}
                                onPressDelete={() => {}}
                                onPressItem={() => {}}
                        />}

            <View style={{width: '70%', marginTop: 20}}>
                {newTask && <TaskItem task={newTask} 
                                        onChangeCompletedStatus={(task: Task, isCompleted: boolean) => {
                                            console.log(isCompleted)
                                        }}
                                        onPressDelete={() => {}}
                                        showLabel={false}
                />}
                <AddNoteInTask
                    onAddNote={() => {}}
                />
            </View> */}
            {/* <CalendarProvider> */}
                {/* <CalendarList
                    showOneWeek={isOpenModal}
                    onPressDate={(date: moment.Moment) => {}}
                    markedDate={markedDate}
                    minMonth={3}
                    maxMonth={3}
                    width={Layouts.screen.width - 40}
                    onPressCalendarList={(e) =>{ e.stopPropagation(); setIsOpenModal(false)}}
                /> */}
            {/* </CalendarProvider> */}
            {/* <Pressable onPress={(e) => {e.stopPropagation(); setIsOpenModal(!isOpenModal)}}>
                <View>
                    <Text>Press here!</Text>
                </View>
            </Pressable> */}
            <TimeLine
                height={CALENDAR_BODY_HEIGHT}
                numberOfDate={7}
                taskList={taskList}

                onPressTask={(id) => {console.log(id)}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default HomeScreen;