import { type DrawerNavigationOptions, createDrawerNavigator } from '@react-navigation/drawer';
import { RouteName, listIcons } from '../screens';

//screens
import { HomeScreen, LabelsScreen, NotesScreen } from '../screens';

//components
import { DrawerContent, Icon } from '../components';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {

	const getScreenOptions : (name: RouteName) => DrawerNavigationOptions = (name) => ({
		title: name,
		drawerIcon: ({ size, color, focused }) => (
			focused
				? <Icon name={listIcons[name].normal} size={size} color={color} 
						library={listIcons[name].library}/>
				: <Icon name={listIcons[name].focused} size={size} color={color} 
						library={listIcons[name].library}/>
		),
		drawerAllowFontScaling: false,
	})

  	return (
		<Drawer.Navigator initialRouteName='Home' 
						  drawerContent={(props) => <DrawerContent {...props}/>}>
			<Drawer.Screen  name="Home" component={HomeScreen} 
							options={getScreenOptions("Home")}/>
			<Drawer.Screen name="Labels" component={LabelsScreen}
							options={getScreenOptions("Labels")}/>
			<Drawer.Screen name="Notes" component={NotesScreen}
							options={getScreenOptions("Notes")}/>	
		</Drawer.Navigator>
  	);
}

export default DrawerNavigation;