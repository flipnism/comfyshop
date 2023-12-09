import React, {useEffect, useState} from 'react';
import {Textarea} from '../components';

export type Props = {
  showTextPanel?: boolean;
  disabled?: boolean;
  title: string;
  content: string;
  onChange: (e: string) => void;
};

export const TextPrompt = (props: Props) => {
  const [visible, setVisible] = useState(props?.showTextPanel || false);
  const [currentValue, setCurrentValue] = useState(props?.content);
  useEffect(() => {
    if (currentValue) props?.onChange(currentValue);
  }, [currentValue]);
  return (
    <div className="main-dropdown w-full">
      <div
        className="placeholder flex flex-row justify-between w-full px-2 py-1 cursor-pointer box-bg text-white rounded-xl"
        onClick={() => {
          if (!props?.disabled && !props?.showTextPanel) setVisible(!visible);
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
              if (!props?.showTextPanel) setVisible(!visible);
            }}
            value={currentValue}
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
