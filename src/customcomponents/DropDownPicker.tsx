import React, {useEffect, useRef, useState} from 'react';
import {Dropdown, Label} from '../components';
import Menu from '../components/Menu';
import MenuItem from '../components/MenuItem';
import {HeroIcons} from '../interfaces/HeroIcons';
export interface DropdownEvent extends globalThis.Event {
  readonly target: (EventTarget & {selectedIndex: number; value: string; className: string}) | null;
}
type Props = {
  onChange?: (e: DropdownEvent) => void;
  items?: string[];
  title?: string;
  selectedIndex: number;
  DDWidth?: string;
  overrideClass?: string;
  which?: 'facerestoremodel' | 'upscalemodel' | 'method';
  horizontalmode?: boolean;
  subnode?: boolean;
  showSelector?: boolean;
};

export default function DropDrownPicker(props: Props) {
  const [hastitle, sethastitle] = useState(false);
  const [selIndex, setSelIndex] = useState(0);
  useEffect(() => {
    if (props.title != null) sethastitle(true);
  }, [props.title]);
  useEffect(() => {
    setSelIndex(props?.selectedIndex);
  }, [props?.selectedIndex]);
  function handleSelectIndex(isLeft: boolean) {
    const itemsLen = props?.items?.length;
    let newSelIndex = selIndex;

    if (isLeft) {
      newSelIndex = selIndex > 1 ? selIndex - 1 : 0;
    } else {
      newSelIndex = itemsLen - 1 > newSelIndex ? newSelIndex + 1 : itemsLen - 1;
    }

    // Update the selected index in the component's state
    setSelIndex((e) => newSelIndex);

    if (props.onChange) {
      props?.onChange;
    }
  }
  return (
    <div className={`${props?.overrideClass ? props?.overrideClass : 'w-full'} flex ${props?.horizontalmode ? 'flex-row' : 'flex-col'}`}>
      {hastitle && (
        <Label slot="label" className={`text-xxs text-white ${props?.overrideClass ? '' : 'grow'}`}>
          {props?.title}
        </Label>
      )}
      <div className="flex grow justify-end">
        <Dropdown
          placeholder={props?.items[selIndex]}
          size="S"
          selectedIndex={selIndex}
          className={`${props?.which} ${props?.horizontalmode ? (props?.DDWidth ? props?.DDWidth : 'w-3/4') : 'w-full'}`}
          onChange={props?.onChange}
        >
          <Menu size="S" slot="options">
            {props?.items.length > 0 &&
              props?.items.map((value, index) => {
                return (
                  <MenuItem size="S" key={index} selected={props.selectedIndex == index}>
                    {value}
                  </MenuItem>
                );
              })}
          </Menu>
        </Dropdown>
        {props?.showSelector && (
          <>
            <HeroIcons which="chevron-left" onClick={() => handleSelectIndex(true)} />
            <HeroIcons which="chevron-right" onClick={() => handleSelectIndex(false)} />
          </>
        )}
      </div>
    </div>
  );
}
