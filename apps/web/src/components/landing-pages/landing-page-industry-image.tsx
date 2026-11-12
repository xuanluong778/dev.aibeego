'use client';
import type {LandingPageImageStyle} from '@marketingspa/shared';
import {LpContentImage,type LpContentImageProps} from './landing-page-content-image';
import {lpImgMotionAttr} from './landing-page-content-image-style';

/** Shared media behavior; each industry keeps its own surrounding composition. */
export function LpIndustryImage({imageStyle,canvas,...props}:LpContentImageProps & {imageStyle?:LandingPageImageStyle;canvas?:boolean}) {
  const candidate=imageStyle?.href||'';
  const href=/^(#|https?:\/\/|\/(?!\/)|mailto:|tel:)/i.test(candidate)?candidate:undefined;
  const image=<LpContentImage {...props} alt={imageStyle?.alt||props.alt} data-lp-img-motion={lpImgMotionAttr(imageStyle)}/>;
  return href?<a href={href} data-lp-industry-image-link style={{display:'block'}} onClick={e=>{if(canvas)e.preventDefault();}}>{image}</a>:image;
}
