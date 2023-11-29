import React, {useEffect, useRef} from 'react';

namespace Spectrum {
  export interface DropdownEvent extends globalThis.Event {
    readonly target: (EventTarget & {selectedIndex: number}) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onChange?: (e: Spectrum.DropdownEvent) => void;
  className?: string;
  disabled?: boolean;
  size?: string;
  invalid?: boolean;
  value?: string;
  quiet?: boolean;
  placeholder?: string;
  selectedIndex?: number;
  onSelectIndex?: (selectedIndex: number) => void;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-picker': {
        size?: string;
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        value?: string;
        disabled?: boolean;
        invalid?: boolean;
        quiet?: boolean;
        placeholder?: string;
        selectedIndex?: number;
      };
    }
  }
}

/**
 * Renders a dropdown with menu items. The dropdown must contain a {@link Spectrum.Menu}
 * with `slot="options"`, and inside the {@link Spectrum.Menu}, a series of {@link Spectrum.MenuItem}
 * or {@link Spectrum.MenuDivider} elements.
 *
 * @example
 * ```jsx
 * <Spectrum.Dropdown>
 *   <Spectrum.Menu slot="options">
 *     <Spectrum.MenuItem>Deselect</Spectrum.MenuItem>
 *     <Spectrum.MenuDivider></Spectrum.MenuDivider>
 *     <Spectrum.MenuItem disabled>Make work path</Spectrum.MenuItem>
 *   </Spectrum.Menu>
 * </Spectrum.Dropdown>
 * ```
 */
export default function Dropdown(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchChange = (e: Event) => {
      const selectedIndex = (e.target as any).selectedIndex;
      props.onSelectIndex?.(selectedIndex);
      props.onChange?.(e as Spectrum.DropdownEvent);
    };

    ref.current?.addEventListener('change', dispatchChange);

    return () => {
      ref.current?.removeEventListener('change', dispatchChange);
    };
  }, [props.onChange, props.onSelectIndex]);

  useEffect(() => {
    if (props.selectedIndex !== undefined) {
      if (ref.current) {
        // Set the selected index by changing the "selectedIndex" property of your custom element
        (ref.current as any).selectedIndex = props.selectedIndex;
      }
    }
  }, [props.selectedIndex]);
  return (
    <sp-picker
      size={props?.size}
      ref={ref}
      class={props.className}
      value={props?.value}
      disabled={props.disabled || undefined}
      invalid={props.invalid || undefined}
      quiet={props.quiet || undefined}
      placeholder={props.placeholder}
      selectedIndex={props.selectedIndex}
    >
      {props?.children}
    </sp-picker>
  );
}
