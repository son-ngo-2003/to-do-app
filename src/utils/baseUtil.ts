import {TextStyle} from "react-native";

function paddedNumber( num: number, pad: number = 2 ): string {
    return num.toString().padStart( pad, '0' );
}

function toPrintAsPlural( num: number, word: string ): string {
    return num > 1 ? `${word}s` : word;
}

function clamp( value: number, min: number, max: number ): number {
    return Math.min( Math.max( value, min ), max );
}

function convertReactNativeStyleToCSS(reactNativeStyles?: TextStyle) : [Record<string, string>, string] {
    function cssObjectToString(cssObject: Record<string, string>): string {
        return Object.entries(cssObject)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n");
    }

    if (!reactNativeStyles) {
        return [{}, ""];
    }

    const mapping = {
        color: "color",
        fontSize: "font-size",
        fontWeight: "font-weight",
        fontStyle: "font-style",
        // fontFamily: "font-family",
        lineHeight: "line-height",
        letterSpacing: "letter-spacing",
        textAlign: "text-align",
        textDecorationLine: "text-decoration",
        textTransform: "text-transform",
        includeFontPadding: null, // No equivalent in CSS
        textAlignVertical: "vertical-align", // Approximation
        writingDirection: "direction"
    };

    const cssStyles: Record<string, string> = {};

    Object.keys(reactNativeStyles).forEach((key) => {
        const cssKey = mapping[key as keyof typeof mapping];
        const value = (reactNativeStyles as any)[key];

        if (cssKey) {
            // Add the style to CSS if a mapping exists
            cssStyles[cssKey] = typeof value === "number" ? `${value}px` : value;
        }
    });

    return [cssStyles, cssObjectToString(cssStyles)];
}


export {
    paddedNumber,
    toPrintAsPlural,
    clamp,
    convertReactNativeStyleToCSS,
}