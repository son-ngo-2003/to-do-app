import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';

//components
import { LabelSelectItem, AddLabelCard, LabelModal, 
        NoteCard, NoteModal, TaskItem,
        NoteInTaskItem, AddNoteInTask, TaskProgressCard,
        Calendar, CalendarList, Timeline
} from '../../components/';


//Services
import { LabelService, NoteService, TaskService } from '../../services';
import StorageService from '../../services/StorageService'
import { Message } from '../../services/models';

import { Colors, Bases, Typography, Layouts } from '../../styles';
import dayjs from 'dayjs';
import { CALENDAR_BODY_HEIGHT } from '../../components/calendar/constants';
import { TaskTimeline, MarkedObject } from '../../components/calendar/type';

const HomeScreen : React.FC = () => {
    const [ isOpenModal, setIsOpenModal ] = React.useState<boolean>(false);
    // const { colors } = useTheme();
    // const [newLabel, setNewLabel] = React.useState<Label>();
    // const [newLabel2, setNewLabel2] = React.useState<Label>();
    // const [newNote, setNewNote] = React.useState<Note>();
    // const [ newTask, setNewTask ] = React.useState<Task>();


    const markedDate : MarkedObject[] = [
                        {id: 'Working', color: 'red', date: '2024-04-03'},
                        {id: 'Study', color: 'green', date: '2024-04-03'},
                        {id: 'Project', color: 'pink', date: '2024-04-03'},
                        {id: 'Groceries', color: 'purple', date: '2024-04-03'},

                        {id: 'Working', color: 'red', date: '2024-04-06'},
                        {id: 'Study', color: 'green', date: '2024-04-06'},
                    ]
    

    const taskList : TaskTimeline[] = [
        {
            id: 1,
            start: dayjs({hour: 8, minute: 15}).toDate(),
            end: dayjs({hour: 12, minute: 0}).toDate(),
            isAllDay: false,
    
            title: 'Title 1',
            description: 'Description 1',
            color: 'purple',
        },
        {
            id: 2,
            start: dayjs({hour: 11, minute: 0}).toDate(),
            end: dayjs({hour: 12, minute: 0}).toDate(),
            isAllDay: false,
    
            title: 'Title 2',
            description: 'Description 2',
            color: 'blue',
        },
        {
            id: 3,
            start: dayjs({hour: 9, minute: 0}).toDate(),
            end: dayjs({hour: 14, minute: 0}).toDate(),
            isAllDay: false,
    
            title: 'Title 3',
            description: 'Description 3',
            color: 'green',
        },
        {
            id: 4,
            start: dayjs({hour: 10, minute: 0}).toDate(),
            end: dayjs({hour: 12, minute: 0}).toDate(),
            isAllDay: false,
    
            title: 'Title 4',
            description: 'Description 4',
            color: 'pink',
        },
        {
            id: 5,
            start: dayjs({hour: 9, minute: 15}).toDate(),
            end: dayjs({hour: 11, minute: 30}).toDate(),
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
                    onPressDate={(date: dayjs.Dayjs) => {}}
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
            <CalendarList
                taskList={taskList}
                minDate={ '2024-07-07' }
                maxDate={ '2024-09-15' }
                calendarMode='timeline'
                showWeekends={true}

                // markedDate={markedDate}
                // minMonth={ '2024-01-01' }
                // maxMonth={ '2024-09-09' }
                // showOneWeek = {false}
                // width={300}

                // minPeriod={ '2024-01-01' }
                // maxPeriod={ '2024-09-09' }
                // width={300}
                // onPressDate={() => {}}
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