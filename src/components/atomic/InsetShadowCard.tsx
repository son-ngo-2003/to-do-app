import LinearGradient from "react-native-linear-gradient";
import * as React from "react";
import {StyleSheet, View, ViewStyle} from "react-native";

type InsetShadowCardProps = {
    offsetPercent?: number,
    shadowColor?: string,
    shadowOpacity?: number,
    style?: ViewStyle,
}

const InsetShadowCard : React.FC<InsetShadowCardProps> = ({
    offsetPercent = 0.1,
    shadowColor = 'black',
    shadowOpacity = 0.5,
    style,
}) => {
    const shadowColorWithAlpha = shadowColor.length > 7 ? shadowColor : shadowColor + Math.floor(shadowOpacity * 255).toString(16);
    const endColor = shadowColorWithAlpha.slice(0, -2) + '00';

    return (
        <View style={[styles.container, style]}>
            {/*Top gradient*/}
            <LinearGradient
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: offsetPercent }}
                colors={[shadowColorWithAlpha, endColor]}
                style={[styles.gradient]}
            />

            {/*Right gradient*/}
            <LinearGradient
                start={{ x: 1, y: 0.5 }}
                end={{ x: 1-offsetPercent, y: 0.5 }}
                colors={[shadowColorWithAlpha, endColor]}
                style={[styles.gradient]}
            />

            {/*Bottom gradient*/}
            <LinearGradient
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 1-offsetPercent }}
                colors={[shadowColorWithAlpha, endColor]}
                style={[styles.gradient]}
            />

            {/*Left gradient*/}
            <LinearGradient
                start={{ x: 0, y: 0.5 }}
                end={{ x: offsetPercent, y: 0.5 }}
                colors={[shadowColorWithAlpha, endColor]}
                style={[styles.gradient]}
            />
        </View>
    )
}

export default InsetShadowCard;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});