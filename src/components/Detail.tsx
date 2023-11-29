import React from 'react';

namespace Spectrum {
  export type DetailScript = 'latin' | 'han' | 'arabic' | 'hebrew';
  export type DetailSize = 'S' | 'M' | 'L' | 'XL';
  export type DetailWeight = 'light' | 'default';
}

type Props = {
  children?: React.ReactNode;
  className?: string;
  script?: Spectrum.DetailScript;
  size?: Spectrum.DetailSize;
  weight?: Spectrum.DetailWeight;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-detail': {
        children?: React.ReactNode;
        class?: string;
        script?: Spectrum.DetailScript;
        size?: Spectrum.DetailSize;
        weight?: Spectrum.DetailWeight;
      };
    }
  }
}

/**
 * Renders detail text in a smaller font.
 *
 * @example
 * ```jsx
 * <Spectrum.Detail>The fine details<Spectrum.Detail>
 * ```
 */
export default function Detail(props: Props) {
  return (
    <sp-detail
      class={props?.className}
      script={props?.script}
      size={props?.size}
      weight={props?.weight}
    >
      {props?.children}
    </sp-detail>
  );
}
