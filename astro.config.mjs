import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import UnoCSS from "@unocss/astro";
import {
    presetAttributify,
    presetWind3,
    transformerCompileClass,
    transformerDirectives,
    transformerVariantGroup,
} from "unocss";
import presetWebFonts from "@unocss/preset-web-fonts";
import { createLocalFontProcessor } from "@unocss/preset-web-fonts/local";

import solidJs from "@astrojs/solid-js";

// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference
// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.
// @ts-check

// font util functions
const i = (name, ...weights) => ({ name, italic: true, weights: [...new Set([...weights, 400])] });
const fallback = (name) => ({ name, provider: "none" });

// https://astro.build/config
export default defineConfig(
    /** @type {import('astro').AstroUserConfig} */
    {
        // Comment out "renderers: []" to enable Astro's default component support.
        //renderers: [],
        markdown: {
            syntaxHighlight: "shiki",
            shikiConfig: {
                theme: "one-dark-pro",
                wrap: false,
            },
        },
        integrations: [mdx(), UnoCSS({
            theme: {
                colors: {
                    text: {
                        DEFAULT: "#212121",
                        dark: "#dedede"
                    },
                    link: "#296abb",
                },
            },
            presets: [
                presetWind3(),
                presetAttributify(),
                presetWebFonts({
                    provider: "google",
                    fonts: {
                        prose: [i("IBM Plex Serif", 600), i("Noto Serif JP"), fallback("serif")],
                        heading: ["Roboto Mono:300,100", "IBM Plex Sans JP:300", fallback("monospace")],
                        code: ["Jetbrains Mono", "Roboto Mono", fallback("monospace")],
                        plexmono: ["IBM Plex Mono:300", fallback("monospace")]
                    },
                }),
            ],
            transformers: [
                transformerVariantGroup(),
                transformerDirectives(),
                transformerCompileClass(),
            ],
        }), solidJs()],
    },
);