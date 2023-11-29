import React, { useEffect, useRef } from 'react';

namespace Spectrum {
  export interface CheckboxEvent extends globalThis.Event {
    readonly target: (EventTarget & { checked: boolean; value: string }) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onChange?: (e: Spectrum.CheckboxEvent) => void;
  onInput?: (e: Spectrum.CheckboxEvent) => void;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-checkbox': {
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        size?: string;
        checked?: boolean;
        disabled?: boolean;
        indeterminate?: boolean;
        invalid?: boolean;
      };
    }
  }
}

/**
 * Renders a checkbox with associated label.
 *
 * @example
 * ```jsx
 * <Spectrum.Checkbox checked>Checked</Spectrum.Checkbox>
 * ```
 */
export default function Checkbox(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchChange = (e: Event) => props.onChange?.(e as Spectrum.CheckboxEvent);

    ref.current?.addEventListener('change', dispatchChange);
    return () => {
      ref.current?.removeEventListener('change', dispatchChange);
    };
  }, [props.onChange]);

  useEffect(() => {
    const dispatchInput = (e: Event) => props.onInput?.(e as Spectrum.CheckboxEvent);

    ref.current?.addEventListener('input', dispatchInput);
    return () => {
      ref.current?.removeEventListener('input', dispatchInput);
    };
  }, [props.onInput]);

  return (
    <sp-checkbox
      ref={ref}
      class={props?.className}
      size="s"
      checked={props?.checked || undefined}
      disabled={props?.disabled || undefined}
      indeterminate={props?.indeterminate || undefined}
      invalid={props.invalid || undefined}
    >
      {props?.children}
    </sp-checkbox>
  );
}
