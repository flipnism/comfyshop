import React, {useEffect, useState} from 'react';
import {ActionButton, Button, Label, Textarea} from '../components';
import {HeroIcons} from '../interfaces/HeroIcons';
import {PickFolderFor} from '../utils/Token';
import {CUSTOMSCRIPT} from '../interfaces/types';
import {executeCustomScripts, placeImageOnCanvas} from '../utils/BPUtils';
import Sval from 'sval';
import {generateImage, inpaintCUrrentSelectedLayer} from '../utils/QuickPanelHelper';
const fs = require('uxp').storage.localFileSystem;
import {v4 as uuidv4} from 'uuid';
import useWebSocket from 'react-use-websocket';
import {executed, executing, output_images, progress, server_type, status} from '../utils/ServerUtils';
import {DropdownStyleChooser, STYLE} from '../customcomponents/DropdownStyleChooser';
import {DDItems, DropdownPickerv2} from '../customcomponents/DropdownPickerv2';
import {TextAreav2} from '../customcomponents/TextAreav2';
import {NodeComponent} from '../customcomponents/NodeComponent';

export const QuickPanel = () => {
  const TEMPLATE = 'TEMPLATE_FOLDER';
  const [uuid, setUuid] = useState(uuidv4());

  const [customScripts, setCustomScripts] = useState<CUSTOMSCRIPT[]>(null);
  const [customScriptsFolder, setCustomScriptsFolder] = useState(null);
  const [customScriptTooltip, setCustomScriptTooltip] = useState('');
  const [method, setMethod] = useState('Generate');
  const [ioFolder, setIoFolder] = useState(null);
  const [imageSize, setImageSize] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [curStatus, setStatus] = useState(false);
  const [process, setProcess] = useState(0);
  const [stylesFolder, setStylesFolder] = useState(null);
  const [imgSize, setImgSize] = useState([[512, 512]]);
  const [promptStyle, setPromptStyle] = useState<STYLE>(null);
  const interpreter: Sval = new Sval({
    ecmaVer: 9,
    sandBox: true,
  });
  interpreter.import({
    uxp: require('uxp'),
    os: require('os'),
    photoshop: require('photoshop'),
    app: require('photoshop').app,
    doc: require('photoshop').app.activeDocument,
    batchPlay: require('photoshop').action.batchPlay,
    executeAsModal: require('photoshop').core.executeAsModal,
    // logme: log,
    // showDialog: showDialog,
    // aio_server: aio_server,
  });

  const {lastJsonMessage, lastMessage} = useWebSocket('ws://127.0.0.1:8188/ws?clientId=' + uuid, {
    share: true,
    shouldReconnect: (closeEvent) => {
      return true;
    },
  });

  useEffect(() => {
    if (!lastJsonMessage) return;
    const obj: any = lastJsonMessage;
    if (Object.keys(obj).length <= 0) return;

    try {
      const type = obj['type'];
      const data = obj['data'];

      switch (true) {
        case type === server_type.status:
          const _status: status = obj;
          const queue = _status.data.status.exec_info.queue_remaining;

          break;
        case type === server_type.progress:
          setStatus(true);
          const _obj: progress = obj;
          const progression = (_obj?.data?.value / _obj?.data?.max) * 100;
          setProcess(progression);
          break;
        case type === server_type.execution_start:
          setStatus(true);

          break;
        case type === server_type.execution_cached:
          break;
        case type === server_type.executing:
          const _exeing: executing = obj;
          if (_exeing.data.node != null) {
            setStatus(true);
          } else {
            setStatus(false);
          }

          break;
        case type === server_type.executed:
          const _done: executed = obj;
          setStatus(false);
          setProcess(0);
          const all_files: output_images[] = _done?.data?.output?.images;
          for (const files of all_files) {
            setTimeout(() => {
              placeImageOnCanvas(files?.filename, ioFolder, null, false);
            }, 500);
          }

          break;
      }
    } catch (error) {
      console.log(error);
    }
  }, [lastJsonMessage]);

  async function loadCustomScripts(script_parent, script_names) {
    let all_scripts = [];
    for await (const script of script_names) {
      const file = await script_parent.getEntry(script);
      all_scripts.push(JSON.parse(await file.read()));
    }

    return all_scripts;
  }

  async function fetchRootFolder(rootfolder) {
    const customscript_folder = await rootfolder.getEntry('customscript');
    const config_file = await rootfolder.getEntry('config.json');
    const comfyui_root = await rootfolder.getEntry('ComfyUI');
    const styles = await rootfolder.getEntry('styles');
    const input = await comfyui_root?.getEntry('input');
    const output = await comfyui_root?.getEntry('output');
    setStylesFolder(styles);
    setIoFolder({input: input, output: output});
    setCustomScriptsFolder(customscript_folder);
    const allscripts = await customscript_folder?.getEntries();
    if (!allscripts) return;

    const scrpts = await loadCustomScripts(
      customscript_folder,
      allscripts
        .reduce((accumulator, ext) => {
          if (ext.name.includes('.json')) {
            accumulator.push(ext);
          }
          return accumulator;
        }, [])
        .map((e) => e.name)
      // scripts.map((e) => {
      //   if (e.name.substring(e.name.lastIndexOf('.')) === '.json') return e.name;
      // })
    );
    setCustomScripts(scrpts);
    const config = JSON.parse(await config_file.read());
    setImgSize(config.quickpanel_size);
  }

  async function init() {
    fs.getEntryForPersistentToken(localStorage.getItem(TEMPLATE))
      .then((result) => {
        fetchRootFolder(result);
      })
      .catch(() => {
        PickFolderFor(TEMPLATE).then((result: any) => {
          fetchRootFolder(result);
        });
      });
  }

  useEffect(() => {
    init();
  }, []);

  function HandleGenerate() {
    generateImage(promptStyle, promptText, imgSize[imageSize], uuid);
  }
  function HandleInpainting() {
    inpaintCUrrentSelectedLayer(ioFolder, promptText, uuid);
  }
  return (
    <div className="flex flex-col w-full h-full">
      <div style={{width: `${process}%`}} className="loading bg-black h-full bg-opacity-50 absolute top-0 w-full"></div>

      {curStatus && <div className="acc-title text-lg text-white w-full text-center">Generating...</div>}
      <div className={`main-content-panel ${curStatus ? 'hidden' : 'flex flex-row w-full grow'}`}>
        <TextAreav2
          disabled={curStatus}
          onChange={(value) => {
            setPromptText(value);
          }}
          title={'type your prompt here'}
          content={''}
        />

        <div className="flex flex-row flex-wrap content-start ml-2 w-2/5">
          <DropdownStyleChooser
            className={`w-full`}
            styleFolder={stylesFolder}
            onStyleChoosen={(style) => {
              setPromptStyle(style);
            }}
          />
          <DropdownPickerv2
            className="w-1/2"
            title="method"
            selectedIndex={0}
            disabled={curStatus}
            items={['Generate', 'Inpainting', 'Outpainting']}
            onItemChoosed={(e) => {
              setMethod(e.value);
            }}
          />
          <DropdownPickerv2
            className="w-1/2"
            title="image size"
            selectedIndex={0}
            disabled={curStatus}
            items={imgSize?.map((v) => {
              return v[0] + 'x' + v[1];
            })}
            onItemChoosed={(e: DDItems) => {
              setImageSize(e.selectedIndex);
            }}
          />

          <div className="flex flex-row w-full">
            <div
              className={`my-1 py-1 btn-text w-full text-center ${curStatus ? 'disabled' : 'enabled'}`}
              onClick={() => {
                switch (method) {
                  case 'Generate':
                    HandleGenerate();
                    break;
                  case 'Inpainting':
                    HandleInpainting();
                    break;
                }
              }}
            >
              G E N E R A T E
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col absolute bottom-8 bg-box-main-bg">
        {customScriptTooltip && customScriptTooltip !== '' && (
          <Label slot="label" className={`bg-blue-600 text-white py-1 px-2 left-2 cursor-pointer whitespace-pre-wrap`}>
            {customScriptTooltip}
          </Label>
        )}
      </div>
      <div className="button-grid flex flex-row absolute bottom-0">
        {customScripts &&
          customScripts.map((value, index) => {
            return (
              <HeroIcons
                parentClassName="px-1 py-2"
                key={index}
                label={value.name}
                setLabel={(e) => {
                  if (e === '') setCustomScriptTooltip((x) => e);
                  else setCustomScriptTooltip((x) => value.name + ' -> ' + value.desc);
                }}
                which="custom"
                customPath={value.icon_path}
                onClick={async (e) => {
                  await executeCustomScripts(value, customScriptsFolder, interpreter);
                }}
              />
            );
          })}
      </div>
    </div>
  );
};
