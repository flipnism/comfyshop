import React, { useEffect, useRef } from 'react';

namespace Spectrum {
  export type SliderFillOffset = 'left' | 'right';
  export type SliderVariant = 'filled';
  export interface SliderEvent extends globalThis.Event {
    readonly target: (EventTarget & { value: number; dataset: DOMStringMap }) | null;
  }
}

type Props = {
  children?: React.ReactNode;
  onChange?: (e: Spectrum.SliderEvent) => void;
  onInput?: (e: Spectrum.SliderEvent) => void;
  className?: string;
  disabled?: boolean;
  fillOffset?: Spectrum.SliderFillOffset;
  min: number;
  step?: number;
  max: number;
  name?: string;
  showValue?: boolean;
  value: number;
  valueLabel?: string;
  variant?: Spectrum.SliderVariant;
  mode?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'sp-slider': {
        children?: React.ReactNode;
        ref?: React.RefObject<HTMLElement>;
        class?: string;
        disabled?: boolean;
        step?: number;
        size: string;
        'data-name': string;
        'fill-offset'?: Spectrum.SliderFillOffset;
        min: number;
        max: number;
        'show-value'?: boolean;
        value: number;
        'value-label'?: string;
        variant?: Spectrum.SliderVariant;
      };
    }
  }
}

/**
 * Renders a slider with optional associated {@link Spectrum.Label}.
 * @example
 * ```jsx
 * <Spectrum.Slider min="0" max="100" value="50">
 *   <Spectrum.Label slot="label">Slider Label</Spectrum.Label>
 * </Spectrum.Slider>
 * ```
 */
export default function Slider(props: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const dispatchChange = (e: Event) => props.onChange?.(e as Spectrum.SliderEvent);

    ref.current?.addEventListener('change', dispatchChange);
    return () => {
      ref.current?.removeEventListener('change', dispatchChange);
    };
  }, [props.onChange]);

  useEffect(() => {
    const dispatchInput = (e: Event) => props.onInput?.(e as Spectrum.SliderEvent);

    ref.current?.addEventListener('input', dispatchInput);
    return () => {
      ref.current?.removeEventListener('input', dispatchInput);
    };
  }, [props.onInput]);
  function getRBG() {
    switch (props?.mode) {
      case 'r':
        return 'linear-gradient(90deg,cyan,red)';
      case 'g':
        return 'linear-gradient(90deg,magenta,green)';
      case 'b':
        return 'linear-gradient(90deg,yellow,blue)';
      default:
        return 'transparent';
    }
  }

  return (
    <div className={`${props?.className}`}>
      <div className="h-auto w-full relative">
        <sp-slider
          ref={ref}
          size="s"
          class={`w-full cursor-pointer`}
          disabled={props.disabled || undefined}
          fill-offset={props.fillOffset}
          min={props.min}
          max={props.max}
          data-name={props.name}
          show-value={props.showValue === false ? false : undefined}
          value={props.value}
          value-label={props.valueLabel}
          variant={props.variant}
          step={props.step}
        >
          {props?.children}
        </sp-slider>
        <div
          className="w-full h-2 absolute bottom-0"
          {...{
            style: {
              zIndex: '0',
              background: getRBG(),
              backgroundSize: '100% 5px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom',
            },
          }}
        ></div>
      </div>
    </div>
  );
}
