type FontImports = {
    'Aleo-Back' : any,
    'Aleo-ExtraBold' : any,
    'Aleo-Bold' : any,
    'Aleo-SemiBold' : any,
    'Aleo-Medium' : any,
    'Aleo-Regular' : any,
    'Aleo-Light' : any,
    'Aleo-ExtraLight' : any,
    'Aleo-Thin' : any,
    
    'Aleo-BlackItalic' : any,
    'Aleo-ExtraBoldItalic' : any,
    'Aleo-BoldItalic' : any,
    'Aleo-SemiBoldItalic' : any,
    'Aleo-MediumItalic' : any,
    'Aleo-LightItalic' : any,
    'Aleo-ExtraLightItalic' : any,
    'Aleo-ThinItalic' : any,
    'Aleo-Italic' : any,
}

const fontImports : FontImports = {
    'Aleo-Back' : require('./Aleo-Black.ttf'),
    'Aleo-ExtraBold' : require('./Aleo-ExtraBold.ttf'),
    'Aleo-Bold' : require('./Aleo-Bold.ttf'),
    'Aleo-SemiBold' : require('./Aleo-SemiBold.ttf'),
    'Aleo-Medium' : require('./Aleo-Medium.ttf'),
    'Aleo-Regular' : require('./Aleo-Regular.ttf'),
    'Aleo-Light' : require('./Aleo-Light.ttf'),
    'Aleo-ExtraLight' : require('./Aleo-ExtraLight.ttf'),
    'Aleo-Thin' : require('./Aleo-Thin.ttf'),
    
    'Aleo-BlackItalic' : require('./Aleo-BlackItalic.ttf'),
    'Aleo-ExtraBoldItalic' : require('./Aleo-ExtraBoldItalic.ttf'),
    'Aleo-BoldItalic' : require('./Aleo-BoldItalic.ttf'),
    'Aleo-SemiBoldItalic' : require('./Aleo-SemiBoldItalic.ttf'),
    'Aleo-MediumItalic' : require('./Aleo-MediumItalic.ttf'),
    'Aleo-LightItalic' : require('./Aleo-LightItalic.ttf'),
    'Aleo-ExtraLightItalic' : require('./Aleo-ExtraLightItalic.ttf'),
    'Aleo-ThinItalic' : require('./Aleo-ThinItalic.ttf'),
    'Aleo-Italic' : require('./Aleo-Italic.ttf'),
}

export default fontImports;
export { AleoFont } from './stylesheet' 