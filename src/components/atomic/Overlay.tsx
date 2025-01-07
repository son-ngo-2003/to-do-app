import { BlurView } from "expo-blur";
import * as React from "react";
import { Pressable, StyleSheet, Keyboard } from "react-native";
import { Layouts } from "../../styles";
import Animated, {FadeIn, FadeOut} from "react-native-reanimated";

type OverlayProps = {
    background: "transparent" | "lowOpacity" | "highOpacity",
    isBlur?: boolean,
    onPress?: () => void,
}

const Overlay: React.FC<OverlayProps> = ({ background, onPress, isBlur = false }) => {
    const [ isKeyBoardOpen, setIsKeyBoardOpen ] = React.useState<boolean>( Keyboard.isVisible() );

    React.useEffect(() => {
        Keyboard.addListener('keyboardDidShow', () => setIsKeyBoardOpen(true));
        Keyboard.addListener('keyboardDidHide', () => setIsKeyBoardOpen(false));
    }, []);

    const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

    return (
        <AnimatedBlurView  style={[styles.overlay,
                          background === "transparent" ?  {} 
                        : background === "lowOpacity"  ? styles.lowOpacity :
                                                         styles.highOpacity]}
                        tint={'dark'} intensity={isBlur ? 20 : 0}
                           entering={FadeIn} exiting={FadeOut}
                        >
            {   !isKeyBoardOpen && //the properties keyboardShouldPersistTaps of ScrollView doesn't close Keyboard when
                                    //touching Pressable, so we need to hide Pressable to make this function works
                <Pressable style={styles.overlay} onPress={onPress}></Pressable>}
        </AnimatedBlurView>
    );
}

export default Overlay;

const styles = StyleSheet.create({
    overlay: {
        ...Layouts.screen,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    highOpacity: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    lowOpacity: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }
});