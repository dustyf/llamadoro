/**
 * Ambient module declarations so TypeScript accepts CSS imports.
 *
 * Expo SDK 56's default template uses `global.css` (NativeWind-style)
 * and `*.module.css` for the web target. Without these declarations,
 * `import '@/global.css'` and `import styles from './x.module.css'`
 * fail with TS2307 / TS2882.
 *
 * Native builds strip CSS imports entirely; this only affects the web
 * target's build pipeline.
 */

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
