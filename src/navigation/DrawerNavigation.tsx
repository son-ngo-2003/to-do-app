import { type DrawerNavigationOptions, createDrawerNavigator } from '@react-navigation/drawer';
import { RouteName, listIcons } from '../screens';
import { NavigationCst } from '../constant';

//screens
import { HomeScreen, 
		LabelsScreen, 
		NotesScreen, 
		CalendarScreen, 
		TasksScreen,
		HistoryScreen,
		TrashScreen ,
} from '../screens';

//components
import { DrawerContent, Icon } from '../components';
import { DimensionValue } from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {

	const getScreenOptions : (name: RouteName) => DrawerNavigationOptions = (name) => ({
		title: name,
		drawerIcon: ({ size, color, focused }) => (
			focused
				? <Icon name={listIcons[name].focused} size={size} color={color} 
						library={listIcons[name].library}/>
				: <Icon name={listIcons[name].normal} size={size} color={color} 
						library={listIcons[name].library}/>
		),
		drawerAllowFontScaling: false,
	})

  	return (
		<Drawer.Navigator 	initialRouteName='Home' 
						  	drawerContent={(props) => <DrawerContent {...props}/>}
						  	screenOptions={{
								drawerStyle: { width: NavigationCst.drawerWidth as DimensionValue },
								drawerType: 'front',
						  	}}>
			<Drawer.Screen  name="Home" component={HomeScreen} 
							options={getScreenOptions("Home")}/>
			<Drawer.Screen  name="Calendar" component={CalendarScreen} 
							options={getScreenOptions("Calendar")}/>
			<Drawer.Screen  name="Tasks" component={TasksScreen} 
							options={getScreenOptions("Tasks")}/>
			<Drawer.Screen name="Notes" component={NotesScreen}
							options={getScreenOptions("Notes")}/>	
			<Drawer.Screen name="Labels" component={LabelsScreen}
							options={getScreenOptions("Labels")}/>

			<Drawer.Screen name="History" component={HistoryScreen}
							options={getScreenOptions("History")}/>
			<Drawer.Screen name="Trash" component={TrashScreen}
							options={getScreenOptions("Trash")}/>
		</Drawer.Navigator>
  	);
}

export default DrawerNavigation;