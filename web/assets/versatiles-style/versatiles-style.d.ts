import { SpriteSpecification, StyleSpecification } from '@maplibre/maplibre-gl-style-spec';

declare class RGB extends Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a?: number);
    clone(): RGB;
    asArray(): [number, number, number, number];
    round(): RGB;
    asString(): string;
    asHex(): string;
    asHSL(): HSL;
    asHSV(): HSV;
    asRGB(): RGB;
    toRGB(): RGB;
    static parse(input: string | Color): RGB;
    gamma(value: number): RGB;
    invert(): RGB;
    contrast(value: number): RGB;
    brightness(value: number): RGB;
    tint(value: number, tintColor: Color): RGB;
    blend(value: number, blendColor: Color): RGB;
    lighten(ratio: number): RGB;
    darken(ratio: number): RGB;
    fade(value: number): RGB;
}

declare class HSV extends Color {
    readonly h: number;
    readonly s: number;
    readonly v: number;
    readonly a: number;
    constructor(h: number, s: number, v: number, a?: number);
    asArray(): [number, number, number, number];
    round(): HSV;
    asString(): string;
    clone(): HSV;
    asHSL(): HSL;
    asHSV(): HSV;
    toHSV(): HSV;
    asRGB(): RGB;
    fade(value: number): HSV;
    setHue(value: number): HSV;
}

declare class HSL extends Color {
    readonly h: number;
    readonly s: number;
    readonly l: number;
    readonly a: number;
    constructor(h: number, s: number, l: number, a?: number);
    asArray(): [number, number, number, number];
    round(): HSL;
    clone(): HSL;
    asString(): string;
    asHSL(): HSL;
    toHSL(): HSL;
    asHSV(): HSV;
    asRGB(): RGB;
    static parse(input: string | Color): HSL;
    invertLuminosity(): HSL;
    rotateHue(offset: number): HSL;
    saturate(ratio: number): HSL;
    fade(value: number): HSL;
}

interface RandomColorOptions {
    seed?: string;
    hue?: number | string;
    opacity?: number;
    luminosity?: number | string;
    saturation?: number | string;
}

declare abstract class Color {
    static parse: (input: Color | string) => Color;
    static HSL: typeof HSL;
    static HSV: typeof HSV;
    static RGB: typeof RGB;
    static random: (options?: RandomColorOptions) => HSV;
    abstract clone(): Color;
    asHex(): string;
    abstract asString(): string;
    abstract round(): Color;
    abstract asArray(): number[];
    abstract asHSL(): HSL;
    abstract asHSV(): HSV;
    abstract asRGB(): RGB;
    toHSL(): HSL;
    toHSV(): HSV;
    toRGB(): RGB;
    invertLuminosity(): HSL;
    rotateHue(offset: number): HSL;
    saturate(ratio: number): HSL;
    gamma(value: number): RGB;
    invert(): RGB;
    contrast(value: number): RGB;
    brightness(value: number): RGB;
    lighten(value: number): RGB;
    darken(value: number): RGB;
    tint(value: number, tintColor: Color): RGB;
    blend(value: number, blendColor: Color): RGB;
    setHue(value: number): HSV;
    abstract fade(value: number): Color;
}

/**
 * Module for applying various color transformations such as hue rotation, saturation, contrast, brightness,
 * tinting, and blending. These transformations are defined through the `RecolorOptions` interface.
 */

/**
 * Configuration options for recoloring all map colors.
 *
 * The transformations (if specified) are done in the following order:
 * 1. [Invert brightness](#invertbrightness)
 * 2. [Rotate hue](#rotate)
 * 3. [Saturate](#saturate)
 * 4. [Gamma correction](#gamma)
 * 5. [Contrast adjustment](#contrast)
 * 6. [Brightness adjustment](#brightness)
 * 7. [Tinting](#tint)
 * 8. [Blending](#blend)
 *
 * Usage Examples
 *
 * ```typescript
 * const style = VersaTilesStyle.colorful({
 *    recolor: {
 *       rotate: 180,
 *       saturate: 0.5,
 *       brightness: 0.2,
 *    }
 * };
 * ```
 *
 * If you want do make you map simply brighter or darker, you can use the `blend` option:
 * ```typescript
 * const style = VersaTilesStyle.colorful({
 *    recolor: {
 *       blend: 0.5,
 *       blendColor: '#000000', // to blend all colors with black
 *       // or blendColor: '#FFFFFF', // to blend all colors with white
 *    }
 * };
 * ```
 *
 */
interface RecolorOptions {
    /**
     * If true, inverts all colors' brightness.
     * See also {@link HSL.invertLuminosity}
    */
    invertBrightness?: boolean;
    /**
     * Rotate the hue of all colors in degrees (0-360).
     * See also {@link HSL.rotateHue}
     */
    rotate?: number;
    /**
     * Adjust the saturation level. Positive values increase, negative values decrease saturation.
     * |value|effect           |
     * |----:|-----------------|
     * |   -1|grayscale        |
     * |    0|no effect        |
     * |    1|double saturation|
     *
     * See also {@link HSL.saturate}
     */
    saturate?: number;
    /**
     * Adjust the gamma (non-linear brightness adjustment).
     * Defaults to 1.
     * See also {@link RGB.gamma}
     */
    gamma?: number;
    /**
     * Adjust the contrast level.
     * Values > 1 increase contrast, values < 1 decrease it.
     * Defaults to 1.
     * See also {@link RGB.contrast}
     */
    contrast?: number;
    /**
     * Adjust the brightness level.
     * Positive values make it brighter, negative values make it darker.
     * Defaults to 0.
     *	See also {@link RGB.brightness}
     */
    brightness?: number;
    /**
     * Intensity of the tinting effect (0 = none, 1 = full effect).
     * See also {@link RGB.tint}
     */
    tint?: number;
    /**
     * The tinting color in hex format (default: '#FF0000').
     * See also {@link RGB.tint}
     */
    tintColor?: string;
    /**
     * Intensity of the blending effect (0 = none, 1 = full effect).
     * See also {@link RGB.blend}
     */
    blend?: number;
    /**
     * The blending color in hex format (default: '#000000').
     *	See also {@link RGB.blend}
     */
    blendColor?: string;
}

/** Represents language suffixes used in map styles. */
type Language = 'de' | 'en' | null;
/** Options for configuring a style builder. */
interface StyleBuilderOptions {
    /**
     * The base URL for loading external resources like tiles, sprites, and fonts.
     * Default: document.location.origin (in the browser), or 'https://tiles.versatiles.org'
     */
    baseUrl?: string;
    /**
     * The bounding box for the map, formatted as [sw.lng, sw.lat, ne.lng, ne.lat].
     * Default: [-180, -85.0511287798066, 180, 85.0511287798066]
     */
    bounds?: [number, number, number, number];
    /**
     * The URL template for loading font glyphs, formatted with '{fontstack}' and '{range}' placeholders.
     * Default: '/assets/glyphs/{fontstack}/{range}.pbf'
     */
    glyphs?: string;
    /**
     * The URL for loading sprite images and metadata.
     * Default: [{ id: 'basics', url: '/assets/sprites/basics/sprites' }]
     */
    sprite?: SpriteSpecification;
    /**
     * An array of URL templates for loading map tiles, using '{z}', '{x}', and '{y}' placeholders.
     * Default: ['/tiles/osm/{z}/{x}/{y}']
     */
    tiles?: string[];
    /**
     * If set to true, hides all map labels.
     * Default: false
     */
    hideLabels?: boolean;
    /**
     * Set the language ('en', 'de') of all map labels.
     * A null value means that the language of the country in which the label is drawn will be used.
     * Default: null
     */
    language?: Language;
    /**
     * An object specifying overrides for default color values, keyed by the color names.
     */
    colors?: Partial<StyleBuilderColors>;
    /**
     * An object specifying overrides for default font names, keyed by the font names.
     */
    fonts?: Partial<StyleBuilderFonts>;
    /**
     * Options for color adjustments and transformations applied to the entire style.
     */
    recolor?: RecolorOptions;
}
/** Records string values for color properties in a style builder. */
interface StyleBuilderColors {
    agriculture: Color | string;
    boundary: Color | string;
    building: Color | string;
    buildingbg: Color | string;
    burial: Color | string;
    commercial: Color | string;
    construction: Color | string;
    cycle: Color | string;
    danger: Color | string;
    disputed: Color | string;
    education: Color | string;
    foot: Color | string;
    glacier: Color | string;
    grass: Color | string;
    hospital: Color | string;
    industrial: Color | string;
    label: Color | string;
    labelHalo: Color | string;
    land: Color | string;
    leisure: Color | string;
    motorway: Color | string;
    motorwaybg: Color | string;
    park: Color | string;
    parking: Color | string;
    poi: Color | string;
    prison: Color | string;
    rail: Color | string;
    residential: Color | string;
    rock: Color | string;
    sand: Color | string;
    shield: Color | string;
    street: Color | string;
    streetbg: Color | string;
    subway: Color | string;
    symbol: Color | string;
    trunk: Color | string;
    trunkbg: Color | string;
    waste: Color | string;
    water: Color | string;
    wetland: Color | string;
    wood: Color | string;
}
type StyleBuilderColorsEnsured = Record<keyof StyleBuilderColors, Color>;
/** Records string values for font properties in a style builder. */
type StyleBuilderFonts = {
    regular: string;
    bold: string;
};

interface StyleBuilderFunction {
    (options?: StyleBuilderOptions): StyleSpecification;
    getOptions(): StyleBuilderOptions;
}
declare const colorful: StyleBuilderFunction;
declare const eclipse: StyleBuilderFunction;
declare const graybeard: StyleBuilderFunction;
declare const neutrino: StyleBuilderFunction;

/** Represents the structure of a vector layer in a TileJSON specification. */
interface VectorLayer {
    id: string;
    fields: Record<string, 'Boolean' | 'Number' | 'String'>;
    description?: string;
    minzoom?: number;
    maxzoom?: number;
}

/** Basic structure for TileJSON specification, applicable to both raster and vector types. */
interface TileJSONSpecificationRaster {
    tilejson?: '3.0.0';
    tiles: string[];
    attribution?: string;
    bounds?: [number, number, number, number];
    center?: [number, number];
    data?: string[];
    description?: string;
    fillzoom?: number;
    grids?: string[];
    legend?: string;
    maxzoom?: number;
    minzoom?: number;
    name?: string;
    scheme?: 'tms' | 'xyz';
    template?: string;
    version?: string;
}
/** Structure for TileJSON specification of vector type, specifying vector-specific properties. */
interface TileJSONSpecificationVector extends TileJSONSpecificationRaster {
    vector_layers: VectorLayer[];
}
/** Represents a TileJSON specification, which can be either raster or vector. */
type TileJSONSpecification = TileJSONSpecificationRaster | TileJSONSpecificationVector;

interface GuessStyleOptions {
    baseUrl?: string;
    glyphs?: string;
    sprite?: SpriteSpecification;
}
declare function guessStyle(tileJSON: TileJSONSpecification, options?: GuessStyleOptions): StyleSpecification;

declare const styles: {
    colorful: StyleBuilderFunction;
    eclipse: StyleBuilderFunction;
    graybeard: StyleBuilderFunction;
    neutrino: StyleBuilderFunction;
};

export { Color, type GuessStyleOptions, HSL, HSV, type Language, RGB, type RandomColorOptions, type RecolorOptions, type StyleBuilderColors, type StyleBuilderColorsEnsured, type StyleBuilderFonts, type StyleBuilderFunction, type StyleBuilderOptions, type TileJSONSpecification, type TileJSONSpecificationRaster, type TileJSONSpecificationVector, type VectorLayer, colorful, eclipse, graybeard, guessStyle, neutrino, styles };
