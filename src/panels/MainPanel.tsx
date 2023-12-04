import React, {useEffect, useState, useRef} from 'react';
import {ActionButton, Button, Checkbox, Label, Slider, Textfield} from '../components';
import useWebSocket from 'react-use-websocket';
import {PickFolderFor} from '../utils/Token';
import {SeedWidget} from '../customcomponents/SeedWidget';
import DropDrownPicker from '../customcomponents/DropDownPicker';
import {HeroIcons} from '../interfaces/HeroIcons';
import {croppedSelectedLayer, downloadImage, isValidUrl, placeImageOnCanvas, saveSelectedLayerToImage, saveSelectionToImage} from '../utils/BPUtils';
import MTextArea from '../customcomponents/MTextArea';
import {BOUNDS, GLOBALCONFIG, InlineDialogContent, NODETYPE, STATE, listItems} from '../interfaces/types';
import {
  InterruptServer,
  _arrayBufferToBase64,
  executed,
  executing,
  fetchObjectInfo,
  output_images,
  progress,
  sendWorkflowDataToServer,
  server_type,
  status,
} from '../utils/ServerUtils';

import {action, app, core, imaging} from 'photoshop';
import {v4 as uuidv4} from 'uuid';
import {FloatIntWidget} from '../customcomponents/FloatIntWidget';
import {ActionDescriptor} from 'photoshop/dom/CoreModules';
import {pickBy} from 'lodash';
import WorkflowPicker from '../customcomponents/WorkflowPicker';
const fs = require('uxp').storage.localFileSystem;
const imageloader_node = ['LoadImage', 'Load Image', 'BaseImage', 'LoadResizeImageMask', 'LoadResizeImageMask512', 'LoadImageFace', 'Image'];
export const MainPanel = () => {
  const [previewImage, setPreviewImage] = useState(['./icons/preview.png']);
  const [uuid, setUuid] = useState(uuidv4());
  const WS = (url: string, callback) => {
    return useWebSocket(url, {
      share: true,
      onOpen: () => callback(true),
      onClose: () => callback(false),
      shouldReconnect: (closeEvent) => {
        return true;
      },
    });
  };
  const [baseImage, setBaseImage] = useState(null);
  const [WF, setWF] = useState<any>();
  const [cardInfo, setCardInfo] = useState({});
  const [showcard, setShowCard] = useState({});
  const [instaGenerate, setInstaGenerate] = useState({is_instant: false, node_title: null, keyname: null});
  const [globalConfig, setGlobalConfig] = useState<GLOBALCONFIG>(null);

  const [hideallCard, setHideAllCard] = useState({});
  const [btnState, setBtnState] = useState<STATE>(STATE.disable);
  const [items, setItems] = useState<listItems[]>([]);
  const SeedWidgetRef = useRef(null);
  const [bounds, setBounds] = useState<BOUNDS>({left: 0, top: 0, right: 0, bottom: 0});
  const [selectedLayerBounds, setselectedLayerBounds] = useState<BOUNDS>({left: 0, top: 0, right: 0, bottom: 0});
  const [showUILoader, setShowUILoader] = useState(false);
  const [loadingContent, setLoadingContent] = useState<InlineDialogContent>({
    show: false,
    title: 'some title',
    message: 'this is the default message that will show when you make the loading screen appears. cheers!!!',
  });

  const [currentWFFile, setCurrentWFFile] = useState(null);

  //server stuff
  const [logs, setLogs] = useState('');
  const [status, setStatus] = useState(false);
  const [queue, setQueue] = useState(0);
  const [process, setProcess] = useState(0);
  const [whichImageCard, setWhichImageCard] = useState({title: '', filename: ''});

  const TEMPLATE = 'TEMPLATE_FOLDER';
  const [rootFolder, setRootFolder] = useState(null);
  const [ioFolder, setIOFolder] = useState(null);
  const [workflows, setWorkflows] = useState(null);
  const [workflowFiles, setWorkflowFiles] = useState([]);

  const comfyui_server = WS('ws://127.0.0.1:8188/ws?clientId=' + uuid, (result) => {
    //setSOpen(result);
  });

  useEffect(() => {
    const _bounds = bounds.left == 0 && bounds.right == 0 ? {left: 0, top: 0, right: app?.activeDocument?.width, bottom: app?.activeDocument?.height} : bounds;
    if (!comfyui_server.lastJsonMessage) return;
    const obj: any = comfyui_server.lastJsonMessage;
    if (Object.keys(obj).length <= 0) return;

    try {
      const type = obj['type'];
      const data = obj['data'];

      setStatus(type === 'progress' || obj['data']?.status?.exec_info?.queue_remaining > 0 ? true : false);

      switch (true) {
        case type === server_type.status:
          const _status: status = obj;
          const queue = _status.data.status.exec_info.queue_remaining;
          setQueue(queue != null ? queue : 0);
          break;
        case type === server_type.progress:
          setStatus(true);
          const _obj: progress = obj;
          const progression = (_obj?.data?.value / _obj?.data?.max) * 100;
          setProcess(progression);
          break;
        case type === server_type.execution_start:
          setStatus(true);
          setLogs(type);
          break;
        case type === server_type.execution_cached:
          break;
        case type === server_type.executing:
          const _exeing: executing = obj;
          if (_exeing.data.node != null) {
            setLogs(type);
            setStatus(true);
          } else {
            setProcess(0);
            setStatus(false);
          }

          break;
        case type === server_type.executed:
          setLogs('Done!');
          setStatus(false);
          setProcess(0);
          if (previewImage.length > 1) {
            setPreviewImage(previewImage.slice(-1));
          }
          const _done: executed = obj;
          const all_files: output_images[] = _done?.data?.output?.images;
          for (const files of all_files) {
            placeImageOnCanvas(files?.filename, ioFolder, _bounds, false);
          }

          break;
      }
    } catch (error) {
      console.log(error);
    }
  }, [comfyui_server.lastJsonMessage]);

  useEffect(() => {
    if (!comfyui_server.lastMessage) return;
    if (typeof comfyui_server.lastMessage.data === 'object') {
      _arrayBufferToBase64(comfyui_server.lastMessage.data.slice(8)).then((base64String) => {
        const to_src = `data:image/jpeg;base64, ${base64String}`;
        setPreviewImage((p) => [...p, to_src]);
      });
    }
  }, [comfyui_server.lastMessage]);
  useEffect(() => {
    if (!rootFolder) return;

    rootFolder.getEntry('ComfyUI').then(async (comfyui_root) => {
    
      const input = await comfyui_root?.getEntry('input');
      const output = await comfyui_root?.getEntry('output');

      setIOFolder({input: input, output: output});
    });
    rootFolder.getEntry('config.json').then(async (config_file) => {
      setGlobalConfig(JSON.parse(await config_file.read()));
    });
    rootFolder.getEntry('workflows').then((workflow_folder) => {
      setWorkflows(workflow_folder);
      workflow_folder.getEntries().then((r) => {
        setWorkflowFiles(Object.values(r).filter((e: any) => e.isFile));
      });
    });
  }, [rootFolder]);
  useEffect(() => {
    if (WF) {
      if (currentWFFile) {
        currentWFFile
          .write(JSON.stringify(WF, null, 2))
          .then(() => {})
          .catch((e) => console.log(e));
      }
    }
  }, [WF]);
  async function selectionCheck(event: string, descriptor: ActionDescriptor) {
    if (event == 'select') {
      // IsApplied(descriptor.layerID[0]).then((result: any[]) => {});
      await core
        .executeAsModal(
          async () => {
            const _img = await imaging.getSelection({documentID: app.activeDocument.id});
            setBounds(_img.sourceBounds);
          },
          {commandName: 'selection '}
        )
        .catch((e) => console.log(e));
    }
    if (event == 'set') {
   

      // IsApplied(descriptor.layerID[0]).then((result: any[]) => {});

      if (descriptor?.to?._obj) {
        const o = descriptor?.to;
        const b: BOUNDS = {top: o.top._value, left: o.left._value, right: o.right._value, bottom: o.bottom._value};

        setBounds(b);
      } else {
        setBounds({top: 0, left: 0, right: 0, bottom: 0});
      }
    }
  }
  function photoshopActionListener(event: string, descriptor: ActionDescriptor) {
    if (event == 'set' || event == 'select') {
      selectionCheck(event, descriptor);
    }
  }
  useEffect(() => {
    fs.getEntryForPersistentToken(localStorage.getItem(TEMPLATE))
      .then((result) => {
        setRootFolder(result);
      })
      .catch(() => {
        PickFolderFor(TEMPLATE).then((result) => {
          setRootFolder(result);
        });
      });
    action.addNotificationListener(['set', 'select'], photoshopActionListener);

    return () => {
      action.removeNotificationListener(['set', 'select'], photoshopActionListener);
    };
  }, []);
  useEffect(() => {
    const newcard = Object.fromEntries(Object.keys(showcard).map((key) => [key, false]));
    setHideAllCard(newcard);
  }, [showcard]);
  useEffect(() => {}, [hideallCard]);
  async function HandleUIDialog(content: InlineDialogContent, doThis?: () => Promise<any>) {
    setShowUILoader(true);
    setLoadingContent(() => content);
    if (doThis) {
      doThis().then(() => {
        setShowUILoader(false);
      });
    }
  }

  /**
   * show ui dialog
   *
   * @param {string} title
   * @param {string} content
   * @return {*}
   */
  async function showDialog(title: string, content: string) {
    return new Promise(async (resolve, reject) => {
      HandleUIDialog({
        show: true,
        title: title,
        message: content,
        onOk: async () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
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
        const result = await ioFolder?.input?.getEntry(card_item_content);
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
    return globalConfig.imageloader_node.includes(card_title);
  }

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

  function executeInstantGenerate(card_title) {
    if (card_title == instaGenerate.node_title && instaGenerate.is_instant) {
      setTimeout(() => {
        handleGenerateClick(this);
      }, 1000);
    }
  }
  const renderCard = () => {
    return Object.keys(WF).map((keyname, index) => {
      const card_title = WF[keyname].class_type;
      const showNode = WF[keyname]?.show;
      const title = WF[keyname].title;

      const card_element = findNode(card_title, cardInfo);
      const obb = Object.keys(WF[keyname].inputs).filter((_v, _i) => typeof WF[keyname].inputs[_v] !== 'object');
      if (obb.length <= 0) return null;
      if (!showNode) return null;
      return (
        <div className="w-full overflow-x-auto" key={index}>
          {
            <div className="box-bg p-1">
              {/* this is parent. do something */}
              <div className="w-full  text-white acc-title-comfy text-xxs cursor-pointer flex flex-row content-between">
                <div
                  className="grow"
                  onClick={(e) => {
                    setShowCard((prevSC: any) => ({
                      ...prevSC,
                      [keyname]: !showcard[keyname],
                    }));
                  }}
                >
                  {(title ? title : card_title).toUpperCase()}
                </div>
              </div>

              {/** this is content 
     
              
              */}
              <div className={`${showcard[keyname] || showcard[keyname] == null ? 'block' : 'hidden'}`}>
                {Object.keys(WF[keyname].inputs).map((value, child_index) => {
                  const card_item_name = value;
                  const card_item_content = WF[keyname].inputs[value];
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
                                      showDialog('Download Image', 'download image from clipboard').then(async (ok) => {
                                        console.log(ok);
                                        if (ok) {
                                          const r = await fetch(url);
                                          console.log(r);
                                          if (r.ok) {
                                            await downloadImage(ioFolder, await r.arrayBuffer(), r.headers.get('content-type'), title).then((result) => {
                                              if (result) {
                                                setTimeout(() => {
                                                  card_item_object[0].push(result);
                                                  changeValueDropDown(index, child_index, result, card_item_object[0]);
                                                  handleInputChange(keyname, value, result);
                                                  setWhichImageCard({title: title, filename: result});
                                                }, 300);
                                              }
                                            });
                                          }
                                        }
                                      });
                                    }}
                                  />
                                  <HeroIcons
                                    className="mr-2"
                                    which="person"
                                    onClick={(e) => {
                                      saveSelectedLayerToImage(ioFolder, title, true).then((result) => {
                                        if (result) {
                                          setTimeout(() => {
                                            card_item_object[0].push(result);
                                            changeValueDropDown(index, child_index, result, card_item_object[0]);
                                            handleInputChange(keyname, value, result);
                                            setWhichImageCard({title: title, filename: result});
                                          }, 300);
                                        }
                                      });
                                    }}
                                  />
                                  <HeroIcons
                                    className="mr-2"
                                    which="loadimage"
                                    onClick={(e) => {
                                      saveSelectedLayerToImage(ioFolder, title).then((result) => {
                                        if (result) {
                                          setTimeout(() => {
                                            card_item_object[0].push(result);
                                            changeValueDropDown(index, child_index, result, card_item_object[0]);
                                            handleInputChange(keyname, value, result);
                                            setWhichImageCard({title: title, filename: result});
                                          }, 300);
                                        }
                                      });
                                    }}
                                  />
                                  <HeroIcons
                                    disable={bounds?.left == 0 && bounds?.right == 0 ? true : false}
                                    which="selection"
                                    onClick={(e) => {
                                      saveSelectionToImage(bounds, ioFolder, title).then((result) => {
                                        if (result) {
                                          setTimeout(() => {
                                            card_item_object[0].push(result);
                                            changeValueDropDown(index, child_index, result, card_item_object[0]);
                                            handleInputChange(keyname, value, result);
                                            setWhichImageCard({title: title, filename: result});
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
  const handleInputChange = (keyname: string, subkey: string, newValue: string | number | boolean, title?: string) => {
    if (WF) {
      setWF((prevWf: any) => ({
        ...prevWf,
        [keyname]: {
          ...prevWf[keyname],
          inputs: {
            ...prevWf[keyname].inputs,
            [subkey]: newValue,
          },
        },
      }));
    }
  };
  useEffect(() => {
    if (whichImageCard && whichImageCard.filename != '' && whichImageCard.title != '') {
      executeInstantGenerate(whichImageCard.title);
    }
  }, [whichImageCard]);
  function handleOnClick(item) {
    workflows.getEntry(item.name).then(async (file) => {
      //!RESET ALL
      setShowCard([]);
      setHideAllCard([]);
      setItems([]);
      setCardInfo(null);
      setWF(null);
      setCurrentWFFile(file);
      const content = await file.read();
      const _WF = JSON.parse(content);
      setWF(_WF);
      setInstaGenerate({is_instant: false, node_title: null, keyname: null});
      const promises = Object.keys(_WF).map(async (v, idx) => {
        const _class_type = _WF?.[v]?.class_type;
        const _instant_generate = _WF?.[v]?.instant_generate;
        if (_instant_generate) {
          setInstaGenerate({is_instant: true, node_title: _WF?.[v]?.title, keyname: v});
        }

        const result = await fetchObjectInfo(_class_type);
        let contents = result[_class_type]['input']['required'];
        const optional = result[_class_type]['input']['optional'];
        if (optional !== undefined) {
          contents = {...contents, ...optional};
        }
        return {key: _class_type, value: contents};
      });

      const infoArray = await Promise.all(promises);
      const infoObject = infoArray.reduce((acc, {key, value}) => {
        acc[key] = value;
        return acc;
      }, {});

      setCardInfo(infoObject);
      setBtnState(STATE.enable);
    });
  }
  function handleGenerateClick(e: globalThis.Event) {
    if (status) {
      InterruptServer();
      return;
    }

    setShowCard(hideallCard);

    setPreviewImage(['./icons/preview.png']);

    sendWorkflowDataToServer(WF, uuid);
    SeedWidgetRef?.current?.updateSeed();
  }
  return (
    <>
      <div className={`${showUILoader ? '' : 'hidden'}`}>
        <div className="w-full flex flex-col p-4">
          <div className="acc-title text-white text-lg uppercase mb-2 mt-8">{loadingContent.title}</div>
          <div className="text-white">{loadingContent.message}</div>
        </div>
        {loadingContent.isloading === false ||
          (loadingContent.isloading === undefined && (
            <div className="flex flex-row justify-end">
              <Button
                variant="secondary"
                className="rounded-sm mr-2"
                onClick={() => {
                  loadingContent.onOk('do ok');
                  setShowUILoader(false);
                }}
              >
                Ok
              </Button>
              <Button
                variant="warning"
                className="rounded-sm"
                onClick={() => {
                  loadingContent.onCancel('do cancel');
                  setShowUILoader(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ))}
      </div>
      <div className={`${showUILoader ? 'hidden' : ''}`}>
        <div className="flex flex-row flex-wrap tab-main">
          {workflowFiles && (
            <WorkflowPicker
              workflowFiles={workflowFiles}
              onSelectionChange={(e) => {
                handleOnClick(e);
              }}
            />
          )}
        </div>

        <div className="content-card overflow-y-auto h-full">{WF && cardInfo && !status && renderCard()}</div>

        <Button variant={`${status ? 'warning' : 'cta'}`} disabled={btnState == STATE.disable} className="rounded-md mt-2 w-full" onClick={handleGenerateClick}>
          {`${status ? 'Cancel' : 'Generate'}`}
        </Button>

        <div style={{width: `${process}%`}} className="loading bg-red-600 h-2 my-2 w-full"></div>
        {status && (
          <div className="flex flex-col">
            <div className={`relative`}>
              {previewImage.map((value, idx) => {
                return <img key={idx} src={value} alt="" className="object-cover h-auto w-full absolute" />;
              })}
            </div>
          </div>
        )}
        <div
          className={`absolute bottom-0 text-gray-400 text-sm`}
          onClick={() => {
            setselectedLayerBounds(app.activeDocument.activeLayers[0].bounds);
          }}
        >
          {JSON.stringify(selectedLayerBounds)}
        </div>
      </div>
    </>
  );
};
