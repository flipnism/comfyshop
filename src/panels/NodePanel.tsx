import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {fetchObjectInfo} from '../utils/ServerUtils';
import DropDrownPicker from '../customcomponents/DropDownPicker';
import {HeroIcons} from '../interfaces/HeroIcons';
import {isValidUrl, downloadImage, saveSelectedLayerToImage, saveSelectionToImage} from '../utils/BPUtils';
import {Label, Checkbox, Textfield} from '../components';
import {FloatIntWidget} from '../customcomponents/FloatIntWidget';
import MTextArea from '../customcomponents/MTextArea';
import {SeedWidget} from '../customcomponents/SeedWidget';
import {BOUNDS, NODETYPE, listItems} from '../interfaces/types';
import {MAINSTATE} from './MainPanelv2';
import {SeedWidgetv2} from '../customcomponents/SeedWidgetv2';

type Props = {
  state?: MAINSTATE;
  bounds?: BOUNDS;
};
export const NodePanel = forwardRef((props: Props, outerRef) => {
  const [items, setItems] = useState<listItems[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [WF, setWF] = useState(null);
  const SeedWidgetRef = useRef(null);

  useImperativeHandle(outerRef, () => ({prepareWorkflowData, showNodes}));
  function prepareWorkflowData() {
    saveCUrrentWorkflowFile();
    SeedWidgetRef?.current?.updateSeed();
    return WF;
  }
  function saveCUrrentWorkflowFile() {
 
    props?.state?.currentworkflowfile
      ?.write(JSON.stringify(WF, null, 2))
      .then(() => {})
      .catch((e) => {
        console.log(e);
      });
  }

  function showNodes(is_show: boolean) {
    console.log('is_show', is_show);
    setShowPanel(is_show);
  }
  //render node
  function findNode(node_key: string, object: object) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const element = object[key];
        if (key === node_key) {
          return element;
        }
      }
    }
    return null;
  }
  async function loadDefaultValue(index: number, child_index: number, card_item_content: string, _items: string[], isImage: boolean) {
    {
      let content = {};
      if (isImage) {
        const result = await props?.state?.iofolder?.input?.getEntry(card_item_content);
        const path = result?.nativePath?.substring(0, result?.nativePath?.lastIndexOf('\\'));
        content = {
          id: index,
          sub_id: child_index,
          path: path,
          name: card_item_content,
          item_index: _items.findIndex((o) => o == card_item_content),
        };
      } else {
        content = {
          id: index,
          sub_id: child_index,
          path: null,
          name: card_item_content,
          item_index: _items.findIndex((i) => i == card_item_content),
        };
      }

      if (items.findIndex((e) => e.id == index && e.sub_id == child_index) < 0) {
        setItems((p: any) => [...p, content]);
      }
    }
  }
  async function changeValueDropDown(index: number, child_index: number, file_name: string, _items: string[]) {
    const parentdir = items[items.findIndex((e) => e.id == index && e.sub_id == child_index)].path;
    let newData = [...items];
    newData[items.findIndex((i) => i.id == index && i.sub_id == child_index)] = {
      id: index,
      sub_id: child_index,
      path: parentdir,
      name: file_name,
      item_index: _items.findIndex((o) => o == file_name),
    };
    setItems(newData);
  }
  function isImageDropdown(card_title, card_item_object) {
    if (!card_item_object || card_item_object?.length < 2) return false;
    return props?.state?.globalconfig?.imageloader_node.includes(card_title);
  }
  const handleInputChange = (keyname: string, subkey: string, newValue: string | number | boolean, title?: string) => {
    if (WF) {
      setWF((prevWf: any) => ({
        ...prevWf,
        [keyname]: {
          ...prevWf[keyname],
          inputs: {
            ...prevWf[keyname]?.inputs,
            [subkey]: newValue,
          },
        },
      }));
    }
  };
  const otherNode = (card_item_object: any, card_item_name: string, card_item_content: any, keyname: string, value: string) => {
    switch (card_item_object[0]) {
      case 'BOOLEAN':
        const dt_b: NODETYPE.BOOLEAN = card_item_object[1];
        return (
          <div className={`flex flex-row px-2 my-1  w-full}`}>
            <Label className="grow">{card_item_name}</Label>
            <Checkbox
              {...(card_item_content && {checked: true})}
              onChange={(e) => {
                handleInputChange(keyname, value, e.target.checked);
              }}
            ></Checkbox>
          </div>
        );
        break;
      case 'FLOAT':
        const dt_f: NODETYPE.FLOAT = card_item_object[1];
        return (
          <div className={`flex flex-row px-2 my-1  w-full`}>
            <FloatIntWidget
              title={card_item_name}
              value={card_item_content}
              min={dt_f?.min}
              max={dt_f?.max}
              onChange={(e) => {
                handleInputChange(keyname, value, e);
              }}
            />
          </div>
        );

      case 'STRING':
        const dt_str: NODETYPE.STRING = card_item_object[1];
        return (
          <div className={`flex flex-row px-2 my-1  w-full}`}>
            {dt_str?.multiline ? (
              <MTextArea
                type={card_item_name}
                className="w-full mb-2"
                value={card_item_content}
                onChange={(e) => {
                  handleInputChange(keyname, value, e);
                }}
              />
            ) : (
              <>
                <Label className="grow w-1/2">{card_item_name}</Label>
                <Textfield
                  quiet={true}
                  className="w-1/2"
                  value={card_item_content}
                  onChange={(e) => {
                    handleInputChange(keyname, value, e.target.value);
                  }}
                />
              </>
            )}
          </div>
        );

      case 'INT':
        const dt_i: NODETYPE.FLOAT = card_item_object[1];
        return (
          <div className={`flex flex-row px-2 my-1  w-full`}>
            {card_item_name === 'seed' ? (
              <SeedWidget
                ref={SeedWidgetRef}
                title={card_item_name}
                value={card_item_content}
                onChange={(e) => {
                  handleInputChange(keyname, value, e);
                }}
              />
            ) : (
              <FloatIntWidget
                title={card_item_name}
                value={card_item_content}
                min={dt_i?.min}
                max={dt_i?.max}
                onChange={(e) => {
                  handleInputChange(keyname, value, e);
                }}
              />
            )}
          </div>
        );

      default:
        return (
          <div className={`flex flex-row px-2 my-1  w-full}`}>
            <Label className="grow w-1/2">{card_item_name}</Label>
            <Textfield
              quiet={true}
              className="w-1/2"
              value={card_item_content}
              onChange={(e) => {
                handleInputChange(keyname, value, e.target.value);
              }}
            />
          </div>
        );
    }
  };
  useEffect(() => {
    if (!props.state) return;
    if (props?.state?.WF) {
      setWF(props?.state?.WF);
    }
    console.log('prop state change');
  }, [props?.state]);
  const renderCard = () => {
    if (!props?.state?.WF) return;
    return Object.keys(props?.state?.WF).map((keyname, index) => {
      const WF = props?.state?.WF;
      const card_title = WF[keyname]?.class_type;
      const showNode = WF[keyname]?.show;
      const title = WF[keyname]?.title;

      const card_element = findNode(card_title, props?.state?.cardinfo);
      const obb = Object.keys(WF[keyname]?.inputs).filter((_v, _i) => typeof WF[keyname]?.inputs[_v] !== 'object');
      if (obb.length <= 0) return null;
      if (!showNode) return null;

      return (
        <div className="w-full overflow-x-auto" key={index}>
          {
            <div className="box-bg p-1">
              <div className="w-full  text-white acc-title-comfy text-xxs cursor-pointer flex flex-row content-between">
                <div className="grow">{(title ? title : card_title).toUpperCase()}</div>
              </div>
              <div className={`block`}>
                {Object.keys(WF[keyname]?.inputs).map((value, child_index) => {
                  const card_item_name = value;
                  const card_item_content = WF[keyname]?.inputs[value];
                  const card_item_object = findNode(card_item_name, card_element);
                  const is_image_dropdown = isImageDropdown(card_title, card_item_object);

                  if (!card_item_object) return;
                  loadDefaultValue(index, child_index, card_item_content, card_item_object[0], is_image_dropdown);

                  if (typeof card_item_content !== 'object') {
                    const image_path = items[items?.findIndex((e) => e.id == index && e.sub_id == child_index)];

                    return (
                      <div key={child_index}>
                        {Array.isArray(card_item_object[0]) ? (
                          <div className="flex flex-col">
                            {image_path?.path && (
                              <div className="flex flex-col imageview">
                                <div className="my-0 rounded-sm overflow-hidden w-full h-40 align-middle self-center relative">
                                  <img className="object-contain h-48 w-full" src={items && `file:\\\\${image_path?.path}\\${image_path?.name}`} />
                                </div>
                              </div>
                            )}
                            <div className="flex flex-row justify-between flex-nowrap items-end">
                              <DropDrownPicker
                                showSelector={true}
                                horizontalmode={false}
                                selectedIndex={image_path?.item_index || 0}
                                overrideClass="grow"
                                // title={card_item_name}
                                items={card_item_object[0]}
                                onChange={(e) => {
                                  changeValueDropDown(index, child_index, e.target.value, card_item_object[0]);
                                  handleInputChange(keyname, value, e.target.value);
                                }}
                              />
                              {isImageDropdown(card_title, card_item_object) && (
                                <div className="flex">
                                  <HeroIcons
                                    className="mx-2"
                                    which="download"
                                    onClick={async (e) => {
                                      const content = await navigator.clipboard.readText();
                                      const url = content['text/plain'];

                                      if (!isValidUrl(url)) return;
                                      const r = await fetch(url);

                                      if (r.ok) {
                                        await downloadImage(props?.state?.iofolder, await r.arrayBuffer(), r.headers.get('content-type'), title).then((result) => {
                                          if (result) {
                                            setTimeout(() => {
                                              card_item_object[0].push(result);
                                              changeValueDropDown(index, child_index, result, card_item_object[0]);
                                              handleInputChange(keyname, value, result);
                                            }, 300);
                                          }
                                        });
                                      }
                                    }}
                                  />
                                  <HeroIcons
                                    className="mr-2"
                                    which="person"
                                    onClick={(e) => {
                                      saveSelectedLayerToImage(props?.state?.iofolder, title, true).then((result) => {
                                        if (result) {
                                          setTimeout(() => {
                                            card_item_object[0].push(result);
                                            changeValueDropDown(index, child_index, result, card_item_object[0]);
                                            handleInputChange(keyname, value, result);
                                          }, 300);
                                        }
                                      });
                                    }}
                                  />
                                  <HeroIcons
                                    className="mr-2"
                                    which="loadimage"
                                    onClick={(e) => {
                                      saveSelectedLayerToImage(props?.state?.iofolder, title).then((result) => {
                                        if (result) {
                                          setTimeout(() => {
                                            card_item_object[0].push(result);
                                            changeValueDropDown(index, child_index, result, card_item_object[0]);
                                            handleInputChange(keyname, value, result);
                                          }, 300);
                                          props?.state?.iofolder;
                                        }
                                      });
                                    }}
                                  />
                                  <HeroIcons
                                    disable={props?.bounds?.left == 0 && props?.bounds?.right == 0 ? true : false}
                                    which="selection"
                                    onClick={(e) => {
                                      saveSelectionToImage(props?.bounds, props?.state?.iofolder, title).then((result) => {
                                        if (result) {
                                          setTimeout(() => {
                                            card_item_object[0].push(result);
                                            changeValueDropDown(index, child_index, result, card_item_object[0]);
                                            handleInputChange(keyname, value, result);
                                          }, 300);
                                        }
                                      });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          otherNode(card_item_object, card_item_name, card_item_content, keyname, value)
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          }
        </div>
      );
    });
  };

  return <div className={`content-cardv2 overflow-y-auto h-full ${showPanel ? 'block' : 'hidden'}`}>{props?.state && WF && renderCard()}</div>;
});
