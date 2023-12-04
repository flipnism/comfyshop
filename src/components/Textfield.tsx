import React, {useEffect, useRef} from 'react';

namespace Spectrum {
  export type TextfieldType = 'number' | 'password' | 'search';
  export interface TextfieldEvent extends globalThis.Event {
    readonly target: (EventTarget & {value: string}) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onChange?: (e: Spectrum.TextfieldEvent) => void;
  onInput?: (e: Spectrum.TextfieldEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void; // Add this prop
  onMouseLeave?: (e: Spectrum.TextfieldEvent) => void;
  onMouseEnter?: (e: Spectrum.TextfieldEvent) => void;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  quiet?: boolean;
  type?: Spectrum.TextfieldType;
  valid?: boolean;
  value?: any;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-textfield': {
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        disabled?: boolean;
        invalid?: boolean;
        placeholder?: string;
        quiet?: boolean;
        type?: Spectrum.TextfieldType;
        valid?: boolean;
        value?: any;
        size?: string;
      };
    }
  }
}

/**
 * Renders a text field with optional associated {@link Spectrum.Label}.
 * @example
 * ```jsx
 * <Spectrum.Textfield placeholder="Phone Number">
 *   <Spectrum.Label isRequired="true" slot="label">Phone Number</Spectrum.Label>
 * </Spectrum.Textfield>
 * ```
 */
export default function Textfield(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchChange = (e: Event) => props.onChange?.(e as Spectrum.TextfieldEvent);

    ref.current?.addEventListener('change', dispatchChange);
    return () => {
      ref.current?.removeEventListener('change', dispatchChange);
    };
  }, [props.onChange]);
  useEffect(() => {
    const dispatchChange = (e: Event) => props.onMouseLeave?.(e as Spectrum.TextfieldEvent);

    ref.current?.addEventListener('mouseleave', dispatchChange);
    return () => {
      ref.current?.removeEventListener('mouseleave', dispatchChange);
    };
  }, [props.onMouseLeave]);

  useEffect(() => {
    const dispatchInput = (e: Event) => {
      ref.current?.focus();
    };

    ref.current?.addEventListener('mouseenter', dispatchInput);
    return () => {
      ref.current?.removeEventListener('mouseenter', dispatchInput);
    };
  }, [props.onMouseEnter]);

  useEffect(() => {
    const dispatchInput = (e: Event) => props.onInput?.(e as Spectrum.TextfieldEvent);

    ref.current?.addEventListener('input', dispatchInput);
    return () => {
      ref.current?.removeEventListener('input', dispatchInput);
    };
  }, [props.onInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      props.onKeyDown?.(e);
    };

    ref.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [props.onKeyDown]);
  return (
    <sp-textfield
      ref={ref}
      class={props.className}
      disabled={props.disabled || undefined}
      invalid={props.invalid || undefined}
      placeholder={props.placeholder}
      quiet={props.quiet || undefined}
      type={props.type}
      size="S"
      valid={props.valid || undefined}
      value={props.value}
    >
      {props?.children}
    </sp-textfield>
  );
}
