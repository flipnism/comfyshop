import React, { useEffect, useRef } from 'react';

namespace Spectrum {
  export interface MenuItemEvent extends globalThis.Event {
    readonly target: (EventTarget & { selected: boolean }) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onClick?: (e: Spectrum.MenuItemEvent) => void;
  className?: string;
  size?: string;
  disabled?: boolean;
  selected?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-menu-item': {
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        size?: string;
        disabled?: boolean;
        selected?: boolean;
      };
    }
  }
}

/**
 * Renders a menu item, with an optional checkmark indicating selection.
 *
 * @example
 * ```jsx
 * <Spectrum.Menu>
 *   <Spectrum.MenuItem disabled>California</Spectrum.MenuItem>
 *   <Spectrum.MenuItem>Phoenix</Spectrum.MenuItem>
 *   <Spectrum.MenuItem selected>Portland</Spectrum.MenuItem>
 * </Spectrum.Menu>
 * ```
 */
export default function MenuItem(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchClick = (e: Event) => props.onClick?.(e as Spectrum.MenuItemEvent);

    ref.current?.addEventListener('click', dispatchClick);
    return () => {
      ref.current?.removeEventListener('click', dispatchClick);
    };
  }, [props.onClick]);

  return (
    <sp-menu-item
      ref={ref}
      size={props?.size}
      class={props.className}
      disabled={props.disabled || undefined}
      selected={props.selected || undefined}
    >
      {props.children}
    </sp-menu-item>
  );
}
