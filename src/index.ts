import * as fs from "fs-extra"
import * as path from "path"

import * as webfont from "webfont"
import * as css from 'css'
import * as util from 'util'

async function generateFont(
  inputDir: string,
  outputDir: string,
  fontName: string,
): Promise<void> {
  // Read svgs
  const svgs = (await fs.readdir(inputDir)).filter((file) => file.endsWith('.svg'))

  console.log(`${svgs.length} svgs found`)

  // Create webfont
  const result = await webfont.webfont({
    fontName,
    files: svgs.map((svg) => path.join(inputDir, svg)),
    formats: ['ttf'],
    template: 'css',
  })

  // Parse css to extract glyph metadata
  const parsedCss = css.parse(result.template as string, { source: 'generated' })
  const glyphsRules = (parsedCss.stylesheet!.rules as any[]).filter((rule) => rule.selectors && rule.selectors[0].endsWith("::before"))
  const glyphsMetadata: any[] = []

  glyphsRules.forEach((rule: any, index: number) => {
    if (rule.type === 'rule') {
      const selectors = rule.selectors
      const regex = new RegExp(`(?:\\.)${fontName}-(\\w+)`);
      const nameMatch = regex.exec(selectors[0]);

      if (nameMatch) {
        const cssName = nameMatch[1]
        const declaration = (rule.declarations as css.Declaration[])[0]
        const unicodeMatch = /"\\(\w+)"/.exec(declaration.value!)

        if (unicodeMatch) {
          const unicodeStr = unicodeMatch[1].toLowerCase()
          const unicodeNum = parseInt(unicodeStr, 16)
          const name = svgs[index].replace('.svg', '')

          glyphsMetadata.push({
            uid: unicodeStr,
            css: name,
            code: unicodeNum,
            search: [name],
          })
        }
      }
    }
  })

  const ttfFont = result.ttf
  if (ttfFont) {
    await fs.writeFile(path.resolve(outputDir, `${fontName}.ttf`), ttfFont)
  } else {
    throw new Error("TTF font not generated")
  }

  const config = {
    name: fontName,
    css_prefix_text: "icon-",
    css_use_suffix: false,
    hinting: true,
    units_per_em: 1000,
    ascender: 850,
    descender: -150,
    glyphs: glyphsMetadata.map((metadata) => {
      return {
        uid: metadata.uid,
        css: metadata.css,
        code: metadata.code,
        src: "custom_icons",
        selected: true,
        svg: {
          // Note that we can't extract the path data and width in this method
          path: "",
          width: 1024,
        },
        search: metadata.search,
      }
    }),
  }

  await fs.writeJSON(path.resolve(outputDir, `${fontName}.json`), config, {
    spaces: 2,
  })

  console.log("TTF font and config.json generated successfully.")
}

export default generateFont
