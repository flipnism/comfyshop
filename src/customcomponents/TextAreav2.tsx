import React, {useEffect, useState} from 'react';
import {Textarea, Textfield} from '../components';

export type Props = {
  disabled?: boolean;
  title: string;
  content: string;
  onChange: (e: string) => void;
};

export const TextAreav2 = (props: Props) => {
  const [visible, setVisible] = useState(false);
  const [currentValue, setCurrentValue] = useState(props?.content);
  useEffect(() => {
    if (currentValue) props?.onChange(currentValue);
  }, [currentValue]);
  return (
    <div className="main-dropdown grow w-5/6">
      <div
        className="placeholder flex flex-row justify-between w-full px-2 py-1 cursor-pointer box-bg text-white rounded-xl"
        onClick={() => {
          if (!props?.disabled) setVisible(!visible);
        }}
      >
        {!visible && (
          <>
            <p className="text-gray-600">{props?.title}</p>
            <p>{currentValue || 'None'}</p>
          </>
        )}
        <div className={`p-1 w-full text-white ${visible ? 'block' : 'hidden'}`}>
          <Textarea
            onMouseLeave={(e) => {
              setCurrentValue(e.target.value);
              setVisible(!visible);
            }}
            className="w-full"
            quiet={true}
            onInput={(e) => {
              setCurrentValue(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};
