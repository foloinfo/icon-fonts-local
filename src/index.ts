import * as fs from "fs-extra";
import * as path from "path";

import * as webfont from "webfont";
import * as css from 'css';
import * as util from 'util';

const inputDir = "./svgs"; // input directory containing SVG files
const outputDir = "./output"; // output directory for TTF file and config.json
const fontName = "myfont"; // desired font name

async function generateFont(): Promise<void> {
  // Read svgs
  const svgs = (await fs.readdir(inputDir)).filter((file) => file.endsWith('.svg'));

  // Create webfont
  const result = await webfont.webfont({
    files: svgs.map((svg) => path.join(inputDir, svg)),
    formats: ['ttf'],
    template: 'css',
  });

  // Parse css to extract glyph metadata
  const parsedCss = css.parse(result.template as string, { source: 'generated' });
  const glyphsRules = (parsedCss.stylesheet!.rules as any[]).filter((rule) => rule.selectors && rule.selectors[0].endsWith("::before"));
  const glyphsMetadata: any[] = [];

  glyphsRules.forEach((rule: any, index: number) => {
    if (rule.type === 'rule') {
      const selectors = rule.selectors;
      const nameMatch = /(?:\.)webfont-(\w+)/.exec(selectors![0]);

      if (nameMatch) {
        const cssName = nameMatch[1];
        const declaration = (rule.declarations as css.Declaration[])[0];
        const unicodeMatch = /"\\(\w+)"/.exec(declaration.value!);

        if (unicodeMatch) {
          const unicodeStr = unicodeMatch[1].toLowerCase();
          const unicodeNum = parseInt(unicodeStr, 16);
          const name = svgs[index].replace('.svg', '');

          glyphsMetadata.push({
            uid: unicodeStr,
            css: name,
            code: unicodeNum,
            search: [name],
          });
        }
      }
    }
  });

  const ttfFont = result.ttf;
  if (ttfFont) {
    await fs.writeFile(path.resolve(outputDir, `${fontName}.ttf`), ttfFont);
  } else {
    throw new Error("TTF font not generated");
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
      };
    }),
  };

  await fs.writeJSON(path.resolve(outputDir, "config.json"), config, {
    spaces: 2,
  });
}

console.log("Generating font...");
generateFont()
  .then(() => console.log("TTF font and config.json generated successfully."))
  .catch((error) => console.error("Error generating font:", error));
