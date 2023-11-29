import React, { useEffect, useRef } from 'react';

namespace Spectrum {
  export type MenuSlot = 'options';
  export interface MenuEvent extends globalThis.Event {
    readonly target: (EventTarget & { selectedIndex: number }) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onChange?: (e: Spectrum.MenuEvent) => void;
  className?: string;
  slot?: Spectrum.MenuSlot;
  size?: string;
  selectedIndex?: number;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-menu': {
        size?: string;
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        slot?: Spectrum.MenuSlot;
        selectedIndex?: number;
      };
    }
  }
}

/**
 * Renders a menu with menu items. Inside the {@link Spectrum.Menu}, a series of
 * {@link Spectrum.MenuItem} or {@link Spectrum.MenuDivider} elements may exist.
 *
 * @remarks {@link Spectrum.MenuDivider} elements will only render inside an {@link Spectrum.Dropdown}.
 *
 * @example
 * ```jsx
 * <Spectrum.Menu>
 *   <Spectrum.MenuItem>Deselect</Spectrum.MenuItem>
 *   <Spectrum.MenuItem>Select inverse</Spectrum.MenuItem>
 *   <Spectrum.MenuDivider></Spectrum.MenuDivider>
 *   <Spectrum.MenuItem disabled>Make work path</Spectrum.MenuItem>
 * </Spectrum.Menu>
 * ```
 */
export default function Menu(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchChange = (e: Event) => props.onChange?.(e as Spectrum.MenuEvent);

    ref.current?.addEventListener('change', dispatchChange);
    return () => {
      ref.current?.removeEventListener('change', dispatchChange);
    };
  }, [props.onChange]);

  return (
    <sp-menu
      ref={ref}
      size={props?.size}
      class={props.className}
      slot={props.slot === 'options' ? 'options' : undefined}
      selectedIndex={props.selectedIndex}
    >
      {props.children}
    </sp-menu>
  );
}
