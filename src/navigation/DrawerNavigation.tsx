import { createDrawerNavigator } from '@react-navigation/drawer';

import { HomeScreen, LabelsScreen, NotesScreen } from '../screens';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator initialRouteName='Home'>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Labels" component={LabelsScreen} />
        <Drawer.Screen name="Notes" component={NotesScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigation;