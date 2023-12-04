import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Checkbox, Textarea, Textfield} from '../components';

export type Props = {
  multiline?: boolean;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
  title: string;
  type: 'string' | 'float' | 'boolean' | 'seed';
  items?: string[];
  selectedItem?: string;

  onChange: (value: number | boolean | string) => void;
};

export const NodeComponent = forwardRef((props: Props, otherRef) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState<number | boolean | string>(null);
  const [minmax, setMinMax] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const dispatchInput = (e: Event) => {
      setVisible(false);
    };
    ref.current?.addEventListener('mouseleave', dispatchInput);
    return () => {
      ref.current?.removeEventListener('mouseleave', dispatchInput);
    };
  }, []);

  useEffect(() => {
    if (value == null || value == undefined) return;
    props?.onChange(value);
  }, [value]);
  useEffect(() => {
    if (!props?.defaultValue) return;
    setValue(props?.defaultValue);
  }, [props?.defaultValue]);

  useEffect(() => {
    setMinMax([props?.min, props?.max]);
  }, [props?.min, props?.max]);
  useEffect(() => {
    if (!props?.selectedItem) return;
    setSelectedItem(props?.selectedItem);
  }, [props?.selectedItem]);

  useImperativeHandle(otherRef, () => ({
    updateSeed,
  }));
  const isDefault = () => {
    return (
      <div className={`main-dropdown relative grow w-full ${props?.className}`}>
        <div
          className="placeholder flex flex-row justify-between w-full px-2 cursor-pointer box-bg text-white rounded-xl min-w-0"
          onClick={() => {
            if (!props?.disabled) setVisible(!visible);
          }}
        >
          {!visible && <p className="leading-6 text-gray-600 overflow-ellipsis whitespace-nowrap max-w-50">{props?.title}</p>}

          {props?.type === 'float' && (
            <Textfield
              className="w-1/6"
              value={1}
              quiet={true}
              type="number"
              onInput={(e) => {
                setValue(e.target.value);
              }}
            />
          )}
          {props?.type === 'string' && !visible && <p className="leading-6 overflow-ellipsis whitespace-nowrap max-w-50">{value || 'None'}</p>}
          {props?.type === 'string' && visible && (
            <div className={`p-1 w-full text-white ${visible ? 'block' : 'hidden'}`}>
              {props?.multiline ? (
                <Textarea
                  onMouseLeave={(e) => {
                    setVisible(!visible);
                  }}
                  className="w-full"
                  quiet={true}
                  onInput={(e) => {
                    setValue(e.target.value);
                  }}
                >
                  {value}
                </Textarea>
              ) : (
                <Textfield
                  className="w-full"
                  value={1}
                  quiet={true}
                  onInput={(e) => {
                    setValue(e.target.value);
                  }}
                />
              )}
            </div>
          )}
          {props?.type === 'boolean' && (
            <Checkbox
              className="justify-end"
              onChange={(e) => {
                setValue(e.target.checked);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  function generateSeed() {
    const curvalue = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    setValue(curvalue);
  }
  function updateSeed() {
   
    switch (selectedItem) {
      case 'fixed':
        break;
      case 'increment':
        setValue((value as number) + 1);
        break;
      case 'random':
        generateSeed();
        break;
    }

    //
  }
  const isSeed = () => {
    return (
      <div className={`main-dropdown relative grow w-full ${props?.className}`}>
        <div className="placeholder flex flex-row justify-between w-full px-2 cursor-pointer box-bg text-white rounded-xl min-w-0" onClick={() => {}}>
          {!visible && (
            <>
              <p
                onClick={() => {
                  if (!props?.disabled) setVisible(!visible);
                }}
                className="leading-6 text-gray-600 overflow-ellipsis whitespace-nowrap max-w-50"
              >
                {props?.title + ' [' + selectedItem + ']'}
              </p>
              <p
                onClick={() => {
                  updateSeed();
                }}
                className="leading-6 overflow-ellipsis whitespace-nowrap max-w-50"
              >
                {value || 'None'}
              </p>
            </>
          )}

          <div className={`p-1 w-full text-white ${visible ? 'block' : 'hidden'}`}>
            {props?.items.map((value, index) => {
              return (
                <div
                  className="px-2 pb-1 cursor-pointer hover:bg-[#2e2e2e] hover:text-yellow-300"
                  key={index}
                  onClick={(e) => {
                    const selectedIndex = props?.items.findIndex((x) => x == value);
                    setSelectedItem(props?.items[selectedIndex]);
                    setVisible(false);
                    // props?.onItemChoosed({selectedIndex: selectedIndex, value: props?.items[selectedIndex]});
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  const isString = () => {
    return (
      <div className={`main-dropdown relative grow w-full ${props?.className}`}>
        <div
          className="placeholder flex flex-row justify-between w-full px-2 cursor-pointer box-bg text-white rounded-xl min-w-0"
          onClick={() => {
            if (!props?.disabled) setVisible(!visible);
          }}
        >
          {!visible && (
            <>
              <p className="leading-6 text-gray-600 overflow-ellipsis whitespace-nowrap max-w-50">{props?.title}</p>
              <p className="leading-6 overflow-ellipsis whitespace-nowrap max-w-50">{value || 'None'}</p>
            </>
          )}

          <div className={`p-1 w-full text-white ${visible ? 'block' : 'hidden'}`}>
            {props?.multiline ? (
              <Textarea
                onMouseLeave={(e) => {
                  setVisible(!visible);
                }}
                className="w-full"
                quiet={true}
                value={value as string}
                onInput={(e) => {
                  setValue(e.target.value);
                }}
              />
            ) : (
              <Textfield
                onMouseLeave={(e) => {
                  setVisible(!visible);
                }}
                className="w-full"
                value={value}
                quiet={true}
                onInput={(e) => {
                  setValue(e.target.value);
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };
  const isFloat = () => {
    return (
      <div className={`main-dropdown relative grow w-full ${props?.className}`}>
        <div
          className="placeholder flex flex-row justify-between w-full px-2 cursor-pointer box-bg text-white rounded-xl min-w-0"
          onClick={() => {
            if (!props?.disabled) setVisible(!visible);
          }}
        >
          <p className="leading-6 text-gray-600 overflow-ellipsis whitespace-nowrap max-w-50">{props?.title}</p>

          {!visible ? (
            <p className="leading-6 overflow-ellipsis whitespace-nowrap max-w-50">{value || 'None'}</p>
          ) : (
            <Textfield
              onMouseLeave={() => {
                setVisible(!visible);
              }}
              className="w-1/6"
              value={value}
              quiet={true}
              type="number"
              onInput={(e) => {
                let return_value = Number(e.target.value);
                if (return_value > minmax[1]) return_value = minmax[1];
                else if (return_value < minmax[0]) return_value = minmax[0];

                setValue(return_value);
              }}
            />
          )}
        </div>
      </div>
    );
  };
  const isBoolean = () => {
    return (
      <div className={`main-dropdown relative grow w-full ${props?.className}`}>
        <div
          className="placeholder flex flex-row justify-between w-full px-2 cursor-pointer box-bg text-white rounded-xl min-w-0"
          onClick={() => {
            if (!props?.disabled) setVisible(!visible);
          }}
        >
          <p className="leading-6 text-gray-600 overflow-ellipsis whitespace-nowrap max-w-50">{props?.title}</p>

          <Checkbox
            checked={props?.defaultValue as boolean}
            className="justify-end"
            onChange={(e) => {
              setValue(e.target.checked ? true : false);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {props?.type === 'boolean' && isBoolean()}
      {props?.type === 'float' && isFloat()}
      {props?.type === 'string' && isString()}
      {props?.type === 'seed' && isSeed()}
    </>
  );
});
