import Image, { type ImageProps } from 'next/image';
import { isOptimizableImage } from '@/lib/utils';

type ProductImageProps = Omit<ImageProps, 'src'> & { src: string };

/** next/image that falls back to an unoptimized image for hosts not allowed in next.config. */
export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  return <Image src={src} alt={alt} unoptimized={!isOptimizableImage(src)} {...props} />;
}
