import React, {useEffect, useRef, useState} from 'react';
import {Textfield} from '../components';

export type Props = {
  className?: string;
  styleFolder?: any;
  onStyleChoosen?: (e: STYLE) => void;
};

export type STYLE = {
  name: string;
  prompt: string;
  negative_prompt: string;
};

export const DropdownStyleChooser = (props: Props) => {
  const ref = useRef(null);
  const dummycontent = ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam'];
  const defaultItem = JSON.parse(localStorage.getItem('DEFAULTSTYLE'));
  const [visible, setVisible] = useState(false);
  const [styleTemplate, setStyleTemplate] = useState([]);
  const [filterList, setFilterList] = useState(styleTemplate);
  const [currentTemplate, setCurrentTemplate] = useState<STYLE>(defaultItem || null);
  async function readAllStyles() {
    const allstyles = await props?.styleFolder.getEntries();
    let _tempall = [];

    for (const styles of allstyles) {
      const data = await styles.read();
      const d: STYLE[] = JSON.parse(data);

      _tempall = _tempall.concat(d);
    }
    setStyleTemplate(_tempall);
    setFilterList(_tempall);
  }
  useEffect(() => {
    if (currentTemplate) {
      props?.onStyleChoosen(currentTemplate);
    }
  }, [currentTemplate]);
  useEffect(() => {}, [styleTemplate]);
  useEffect(() => {
    if (props?.styleFolder) {
      readAllStyles();
    }
  }, [props?.styleFolder]);
  useEffect(() => {
    const dispatchInput = (e: Event) => {
      setVisible(false);
    };
    ref.current?.addEventListener('mouseleave', dispatchInput);
    return () => {
      ref.current?.removeEventListener('mouseleave', dispatchInput);
    };
  }, []);
  return (
    <div className={`main-dropdown relative w-full ${props?.className}`}>
      <div className="placeholder flex flex-row justify-between w-full px-2 py-1 cursor-pointer box-bg text-white rounded-xl" onClick={() => setVisible(!visible)}>
        <p className="text-gray-600 max-w-50">Choose style...</p>
        <p className="max-w-50">{currentTemplate?.name || 'None'}</p>
      </div>
      <div ref={ref} className={`box-bg p-1 w-full z-10 text-white fixed top-0 left-0 ${visible ? 'block' : 'hidden'}`}>
        <Textfield
          className="w-full"
          quiet={true}
          placeholder="Filter"
          onInput={(e) => {
            const filtered = styleTemplate.filter((x) => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
            setFilterList(filtered);
          }}
        />
        <div className="dropdown-content">
          {filterList.map((value, index) => {
            return (
              <div
                className="px-2 pb-1 bg-[#202020] rounded-sm cursor-pointer hover:bg-[#2e2e2e] hover:text-yellow-300"
                key={index}
                onClick={(e) => {
                  const selectedIndex = styleTemplate.findIndex((x) => x.name == value.name);
                  setCurrentTemplate(styleTemplate[selectedIndex]);
                  localStorage.setItem('DEFAULTSTYLE', JSON.stringify(styleTemplate[selectedIndex]));
                  setVisible(false);
                }}
              >
                {value.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
