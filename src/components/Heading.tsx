import React from 'react';

namespace Spectrum {
  export type HeadingClassification = 'serif' | 'sans serif';
  export type HeadingScript = 'latin' | 'han' | 'arabic' | 'hebrew';
  export type HeadingSize =
    | 'XXS'
    | 'XS'
    | 'S'
    | 'M'
    | 'L'
    | 'XL'
    | 'XXL'
    | 'XXXL';
  export type HeadingWeight = 'light' | 'default' | 'heavy';
}

type Props = {
  children?: React.ReactNode;
  className?: string;
  classification?: Spectrum.HeadingClassification;
  script?: Spectrum.HeadingScript;
  size?: Spectrum.HeadingSize;
  weight?: Spectrum.HeadingWeight;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-heading': {
        children?: React.ReactNode;
        class?: string;
        classification?: Spectrum.HeadingClassification;
        script?: Spectrum.HeadingScript;
        size?: Spectrum.HeadingSize;
        weight?: Spectrum.HeadingWeight;
      };
    }
  }
}

/**
 * Renders heading text that is theme aware.
 *
 * @example
 * ```jsx
 * <Spectrum.Heading size="XL">Heading XL</Spectrum.Heading>
 * ```
 */
export default function Heading(props: Props) {
  return (
    <sp-heading
      class={props?.className}
      classification={props?.classification}
      script={props?.script}
      size={props?.size}
      weight={props?.weight}
    >
      {props?.children}
    </sp-heading>
  );
}
