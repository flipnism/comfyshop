import React from 'react';

namespace Spectrum {
  export type DividerSize = 'small' | 'medium' | 'large';
}

type Props = {
  className?: string;
  size?: Spectrum.DividerSize;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-divider': {
        children: undefined;
        class?: string;
        size?: Spectrum.DividerSize;
      };
    }
  }
}

/**
 * Renders a divider.
 *
 * @example
 * ```jsx
 * <Spectrum.Divider size="large" />
 * ```
 */
export default function Divider(props: Props) {
  return (
    <sp-divider class={props?.className} size={props?.size}>
      {undefined}
    </sp-divider>
  );
}
