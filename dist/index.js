"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const webfont = __importStar(require("webfont"));
const css = __importStar(require("css"));
function generateFont(inputDir, outputDir, fontName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Read svgs
        const svgs = (yield fs.readdir(inputDir)).filter((file) => file.endsWith('.svg'));
        console.log(`${svgs.length} svgs found`);
        // Create webfont
        const result = yield webfont.webfont({
            fontName,
            files: svgs.map((svg) => path.join(inputDir, svg)),
            formats: ['ttf'],
            template: 'css',
        });
        // Parse css to extract glyph metadata
        const parsedCss = css.parse(result.template, { source: 'generated' });
        const glyphsRules = parsedCss.stylesheet.rules.filter((rule) => rule.selectors && rule.selectors[0].endsWith("::before"));
        const glyphsMetadata = [];
        glyphsRules.forEach((rule, index) => {
            if (rule.type === 'rule') {
                const selectors = rule.selectors;
                const regex = new RegExp(`(?:\\.)${fontName}-(\\w+)`);
                const nameMatch = regex.exec(selectors[0]);
                if (nameMatch) {
                    const cssName = nameMatch[1];
                    const declaration = rule.declarations[0];
                    const unicodeMatch = /"\\(\w+)"/.exec(declaration.value);
                    if (unicodeMatch) {
                        const unicodeStr = unicodeMatch[1].toLowerCase();
                        const unicodeNum = parseInt(unicodeStr, 16);
                        const name = svgs[index].replace('.svg', '');
                        console.log(rule);
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
            yield fs.writeFile(path.resolve(outputDir, `${fontName}.ttf`), ttfFont);
        }
        else {
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
        yield fs.writeJSON(path.resolve(outputDir, `${fontName}.json`), config, {
            spaces: 2,
        });
        console.log("TTF font and config.json generated successfully.");
    });
}
exports.default = generateFont;
