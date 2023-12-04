import React, {useEffect, useRef, useState} from 'react';
import {Textfield} from '../components';

import {HeroIcons} from '../interfaces/HeroIcons';
export interface DropdownEvent extends globalThis.Event {
  target: (EventTarget & {selectedIndex: number; value: string; className: string}) | null;
}

export type DDItems = {
  selectedIndex: number;
  value: any;
};
export type Props = {
  selectedIndex?: number;
  className?: string;
  filtered?: boolean;
  disabled?: boolean;
  title: string;
  items: string[];
  onItemChoosed: (e: DDItems) => void;
  showSelector?: boolean;
};

export const DropdownPickerv2 = (props: Props) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [filterList, setFilterList] = useState(props?.items);
  const [selectedItem, setSelectedItem] = useState<DDItems>(null);

  useEffect(() => {}, [props?.selectedIndex]);

  useEffect(() => {
    if (!selectedItem) return;
    console.log('selecteditem', selectedItem);
    props?.onItemChoosed(selectedItem);
  }, [selectedItem]);

  useEffect(() => {
    if (!props?.items) return;
    setFilterList(props?.items);
  }, [props?.items]);
  useEffect(() => {
    if (props?.selectedIndex >= 0) {
      setSelectedItem({selectedIndex: props?.selectedIndex, value: props?.items[props?.selectedIndex]});
      console.log('yes');
    }
    const dispatchInput = (e: Event) => {
      setVisible(false);
    };
    ref.current?.addEventListener('mouseleave', dispatchInput);
    return () => {
      ref.current?.removeEventListener('mouseleave', dispatchInput);
    };
  }, []);
  function handleSelectIndex(isLeft: boolean) {
    const itemsLen = props?.items?.length;
    let newSelIndex = selectedItem.selectedIndex;

    if (isLeft) {
      newSelIndex = selectedItem.selectedIndex > 1 ? selectedItem.selectedIndex - 1 : 0;
    } else {
      newSelIndex = itemsLen - 1 > newSelIndex ? newSelIndex + 1 : itemsLen - 1;
    }

    // Update the selected index in the component's state
    setSelectedItem({value: props?.items[newSelIndex], selectedIndex: newSelIndex});

    // if (props.onChange) {
    //   props?.onChange;
    // }
  }
  return (
    <>
      <div className={`main-dropdown relative ${props?.className}`}>
        <div
          className="placeholder flex flex-row justify-between w-full px-2 py-1 cursor-pointer box-bg text-white rounded-xl min-w-0"
          onClick={() => {
            if (!props?.disabled) setVisible(!visible);
          }}
        >
          <p className="text-gray-600 overflow-ellipsis whitespace-nowrap max-w-50">{props?.title}</p>
          <p className="overflow-ellipsis whitespace-nowrap max-w-50">{selectedItem?.value || 'None'}</p>
        </div>
        <div ref={ref} className={`box-bg p-1 w-full text-white absolute z-10 ${visible ? 'block' : 'hidden'}`}>
          {props?.filtered && (
            <Textfield
              className="w-full"
              quiet={true}
              placeholder="Filter"
              onKeyDown={(e) => {}}
              onInput={(e) => {
                const filtered = props?.items.filter((x) => x.toLowerCase().includes(e.target.value.toLowerCase()));
                setFilterList(filtered);
              }}
            />
          )}
          <div className="h-full max-h-36 overflow-y-auto">
            {filterList.map((value, index) => {
              return (
                <div
                  className="px-2 pb-1 overflow-ellipsis whitespace-nowrap cursor-pointer hover:bg-[#2e2e2e] hover:text-yellow-300"
                  key={index}
                  onClick={(e) => {
                    const selectedIndex = props?.items.findIndex((x) => x == value);

                    setVisible(false);
                    setSelectedItem({selectedIndex: selectedIndex, value: props?.items[selectedIndex]});
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {props?.showSelector && (
        <div className="flex self-center">
          <HeroIcons className="imgtool-icon" which="chevron-left" onClick={() => handleSelectIndex(true)} />
          <HeroIcons className="imgtool-icon" which="chevron-right" onClick={() => handleSelectIndex(false)} />
        </div>
      )}
    </>
  );
};
