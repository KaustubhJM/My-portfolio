import { asset } from '../lib/motion';

/* WebP with a JPG fallback. `src` is the JPG under public/; the .webp beside it is used
   unless `srcSet` (already including the asset base) lists other WebP sizes. */
export default function Pic({ src, srcSet, sizes, alt = '', ...img }) {
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet || asset(src.replace(/\.jpe?g$/i, '.webp'))} sizes={sizes} />
      <img src={asset(src)} alt={alt} {...img} />
    </picture>
  );
}
