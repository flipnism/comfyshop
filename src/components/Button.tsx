import React, { useEffect, useRef } from 'react';

namespace Spectrum {
  export type ButtonVariant = 'cta' | 'primary' | 'secondary' | 'warning' | 'overBackground';
  export interface ButtonEvent extends globalThis.Event {
    readonly target: (EventTarget & unknown) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onClick?: (e: Spectrum.ButtonEvent) => void;
  className?: string;
  disabled?: boolean;
  quiet?: boolean;
  variant?: Spectrum.ButtonVariant;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-button': {
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        disabled?: boolean;
        quiet?: boolean;
        size: string;
        variant?: Spectrum.ButtonVariant;
      };
    }
  }
}

/**
 * Renders a button.
 *
 * @example
 * ```jsx
 * <Spectrum.Button variant="primary">Click</Spectrum.Button>
 * ```
 */
export default function Button(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchClick = (e: Event) => props.onClick?.(e as Spectrum.ButtonEvent);

    ref.current?.addEventListener('click', dispatchClick);
    return () => {
      ref.current?.removeEventListener('click', dispatchClick);
    };
  }, [props.onClick]);

  const variant = props.variant || (props.quiet === true ? 'primary' : 'cta');

  return (
    <sp-button
      ref={ref}
      class={`cursor-pointer ${props.className}`}
      disabled={props.disabled || undefined}
      quiet={props.quiet || undefined}
      variant={variant}
      size="s"
    >
      {props.children}
    </sp-button>
  );
}
