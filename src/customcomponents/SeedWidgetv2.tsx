import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {ActionButton, Label, Textfield} from '../components';
import DropDrownPicker from './DropDownPicker';
type Props = {
  title?: string;
  value?: string;
  onChange?: (e: number) => void;
};
type MODE = 'random' | 'fixed' | 'increment';
export const SeedWidgetv2 = (props: Props) => {
  function generateSeed() {
    const value = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    setVal((val) => value.toString());
  }

  function updateSeed() {
    switch (mode) {
      case 'fixed':
        break;
      case 'increment':
        setVal((val) => (parseInt(val) + 1).toString());
        break;
      case 'random':
        generateSeed();
        break;
    }

    //
  }
  const [mode, setMode] = useState<MODE>('random');
  const [val, setVal] = useState('0');

  useEffect(() => {
    if (val) {
      props?.onChange(Number(val));
    }
  }, [val]);

  useEffect(() => {
    setVal((val) => props?.value);
  }, [props?.value]);

  return (
    <div className="flex flex-col w-full">
      <Label className="w-fill" slot="label">
        {props?.title}
      </Label>

      <div className="flex flex-row w-full">
        <DropDrownPicker
          overrideClass="w-1/2"
          items={['random', 'fixed', 'increment']}
          selectedIndex={0}
          onChange={(e) => {
            setMode(e.target.value as MODE);
          }}
        />
        <Textfield
          quiet={true}
          className="grow"
          value={val}
          onChange={(e) => {
            props?.onChange(Number(val));
          }}
        />
        <ActionButton size="s" className="shrink" onClick={updateSeed}>
          {'>'}
        </ActionButton>
      </div>
    </div>
  );
};
