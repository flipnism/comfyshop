import React, { useEffect, useRef } from 'react';

export namespace Spectrum {
  export type TextareaType = 'number' | 'password' | 'search';
  export interface TextareaEvent extends globalThis.Event {
    readonly target: (EventTarget & { value: string }) | null;
  }
}

type Props = {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  setFocus?: (e: any) => void;
  onChange?: (e: Spectrum.TextareaEvent) => void;
  onInput?: (e: Spectrum.TextareaEvent) => void;
  onMouseLeave?: (e: Spectrum.TextareaEvent) => void;
  onBlur?: (e: Spectrum.TextareaEvent) => void;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  quiet?: boolean;
  type?: Spectrum.TextareaType;
  valid?: boolean;
  value?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-textarea': {
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        style?: React.CSSProperties;
        disabled?: boolean;
        invalid?: boolean;
        placeholder?: string;
        size?: string;
        quiet?: boolean;
        type?: Spectrum.TextareaType;
        valid?: boolean;
        value?: string;
      };
    }
  }
}

/**
 * Renders a text area with optional associated {@link Spectrum.Label}.
 * @example
 * ```jsx
 * <Spectrum.Textarea placeholder="Enter your name">
 *   <Spectrum.Label slot="label">Name</Spectrum.Label>
 * </Spectrum.Textarea>
 * ```
 */
export default function Textarea(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchChange = (e: Event) => props.onChange?.(e as Spectrum.TextareaEvent);

    ref.current?.addEventListener('change', dispatchChange);
    return () => {
      ref.current?.removeEventListener('change', dispatchChange);
    };
  }, [props.onChange]);

  useEffect(() => {
    const dispatchInput = (e: Event) => props.onInput?.(e as Spectrum.TextareaEvent);

    ref.current?.addEventListener('input', dispatchInput);
    return () => {
      ref.current?.removeEventListener('input', dispatchInput);
    };
  }, [props.onInput]);
  useEffect(() => {
    const dispatchInput = (e: Event) => props.onMouseLeave?.(e as Spectrum.TextareaEvent);

    ref.current?.addEventListener('mouseleave', dispatchInput);
    return () => {
      ref.current?.removeEventListener('mouseleave', dispatchInput);
    };
  }, [props.onMouseLeave]);
  useEffect(() => {
    const dispatchInput = (e: Event) => props.onBlur?.(e as Spectrum.TextareaEvent);

    ref.current?.addEventListener('blur', dispatchInput);
    return () => {
      ref.current?.removeEventListener('blur', dispatchInput);
    };
  }, [props.onBlur]);
  return (
    <sp-textarea
      ref={ref}
      style={props.style || undefined}
      class={`border-red-600 ${props.className}`}
      disabled={props.disabled || undefined}
      invalid={props.invalid || undefined}
      placeholder={props.placeholder}
      quiet={props.quiet || undefined}
      type={props.type}
      valid={props.valid || undefined}
      value={props.value}
      size="s"
    >
      {props?.children}
    </sp-textarea>
  );
}
