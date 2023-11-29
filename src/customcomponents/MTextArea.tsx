import React, { useEffect, useCallback, useState } from 'react';

import { Textarea } from '../components';
import { debounce } from 'lodash';
import { calculateNested } from '../utils/StringUtils';
type Props = {
  value?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  onChange?: (e: string) => void;
};

export default function MTextArea(props: Props) {
  const [lineCount, setLineCount] = useState(3);

  const def = 16;

  const filterNegative = ['negative', 'Negative', 'neg', 'Neg', 'negative prompt'];
  return (
    <div className={`${props?.className} rounded-md overflow-hidden `}>
      <div className={`p-2 relative flex`}>
        <span
          className={
            `${filterNegative.includes(props?.type) ? 'bg-red-700' : 'bg-blue-700'}` +
            ' text-white right-0 top-0 text-xs px-1 float-right rounded-sm absolute'
          }
        >
          {props?.type || 'what is this?'}
        </span>
      </div>
      <Textarea
        quiet={true}
        onBlur={(e) => {
          const text = e.target.value;
          props?.onChange(text.trim().replaceAll('\r', '\n'));
        }}
        style={{ height: `${lineCount * def + 6}px`, minHeight: '48px' }}
        onInput={(e) => {
          let textLen = e.target.value.split('\r');
          const add = calculateNested(textLen);
          let linecount = textLen.length + add;
          if (linecount < 3) linecount = 3;
          else if (linecount > 10) linecount = 10;
          setLineCount(linecount);
        }}
        value={props?.value}
        className={`w-full text-sm text-white flex}`}
      />
    </div>
  );
}
