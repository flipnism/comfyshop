import React, {forwardRef, useEffect, useState} from 'react';
import {Label, Textfield} from '../components';

type Props = {
  title?: string;
  value?: number;
  min?: number;
  max?: number;
  onChange?: (e: number) => void;
};

export const FloatIntWidget = (props: Props) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!val) return;
    setVal((e) => val);
    props?.onChange(Number(val));
  }, [val]);

  useEffect(() => {
    setVal((val) => props?.value);
  }, [props?.value]);

  return (
    <div className="flex flex-row w-full">
      <Label className="grow" slot="label">
        {props?.title}
      </Label>

      <Textfield
        quiet={true}
        type="number"
        className="w-1/12"
        value={val}
        onChange={(e) => {
          let return_value = Number(e.target.value);
          if (return_value > props?.max) return_value = props?.max;
          else if (return_value < props?.min) return_value = props?.min;
          setVal(return_value);
        }}
      />
    </div>
  );
};
