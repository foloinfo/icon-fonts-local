# fontello-local

A cli app to convert your svg files into ttf font file with config.json to use as font icon.

I use this to load a font icon with expo-font with fontello format.
Using the web UI is not really efficient, so use the script to automatically handle the conversion.

## Installation

```
yarn add --dev icon-fonts-local
```

## Usage

1. Put your svg icon files inside a directory.
2. Generate a .ttf file and .json file
3. Setup the font file with expo-font (fontello format)

### Generate font file

```
yarn icon-fonts-local ./path/to/svgs/ ./path/to/fonts/ yourFontName
```

### ExpoFont setup example

```
import { useFonts } from 'expo-font'

const App = ()=> {

  const [fontsLoaded] = useFonts({
    'yourFontName': require('@/assets/fonts/yourFontName.ttf'),
  })

```

Example of FontIcon.tsx

```
import { createIconSetFromFontello } from '@expo/vector-icons'
import config from '@/assets/fonts/yourFontName.json'
import { ViewStyle } from 'react-native'

const NativeFontIcon = createIconSetFromFontello(
  config,
  'yourFontName',
  'yourFontName.ttf'
)

const iconNames = config.glyphs.map(glyph => glyph.css)
const checkName = (name: string) => iconNames.includes(name)

type Props = {
  name: string,
  size?: number,
  color?: string,
  style?: ViewStyle,
}

const FontIcon = ({
  name,
  size,
  color,
  style,
}: Props)=> {

  if(!checkName(name)){
    console.error(`FontIcon: ${name} is not a valid icon name. Valid names are:\n${iconNames.join('\n')}`)
  }

  return (
    <NativeFontIcon
      name={name}
      size={size}
      color={color}
      style={style}
    />
  )
}

export default FontIcon
```
