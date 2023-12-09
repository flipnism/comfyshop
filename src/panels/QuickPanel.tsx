import React, {useEffect, useState} from 'react';
import {ActionButton, Button, Label, Textarea} from '../components';
import {HeroIcons} from '../interfaces/HeroIcons';
import {PickFolderFor} from '../utils/Token';
import {CUSTOMSCRIPT, GLOBALCONFIG} from '../interfaces/types';
import {executeCustomScripts, placeImageOnCanvas} from '../utils/BPUtils';
import Sval from 'sval';
import {generateImage, inpaintCUrrentSelectedLayer} from '../utils/QuickPanelHelper';
const fs = require('uxp').storage.localFileSystem;
import {v4 as uuidv4} from 'uuid';
import useWebSocket from 'react-use-websocket';
import {_arrayBufferToBase64, executed, executing, output_images, progress, server_type, status} from '../utils/ServerUtils';
import {DropdownStyleChooser, STYLE} from '../customcomponents/DropdownStyleChooser';
import {DDItems, DropdownPickerv2} from '../customcomponents/DropdownPickerv2';
import {TextPrompt} from '../customcomponents/TextPrompt';

export const QuickPanel = () => {
  const TEMPLATE = 'TEMPLATE_FOLDER';
  const [uuid, setUuid] = useState(uuidv4());

  const [method, setMethod] = useState('Generate');
  const [ioFolder, setIoFolder] = useState(null);
  const [imageSize, setImageSize] = useState(0);
  const [promptText, setPromptText] = useState(localStorage.getItem('PROMPT') || '');
  const [curStatus, setStatus] = useState(false);
  const [process, setProcess] = useState(0);
  const [stylesFolder, setStylesFolder] = useState(null);
  const [imgSize, setImgSize] = useState([[512, 512]]);
  const [promptStyle, setPromptStyle] = useState<STYLE>(null);
  const [QPImageGenerator, setQPImageGenerator] = useState(null);
  const [globalConfig, setGlobalConfig] = useState<GLOBALCONFIG>(null);
  const [previewImage, setPreviewImage] = useState(['./icons/preview.png']);
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

  useEffect(() => {
    if (!lastMessage) return;
    if (typeof lastMessage.data === 'object') {
      _arrayBufferToBase64(lastMessage.data.slice(8)).then((base64String) => {
        const to_src = `data:image/jpeg;base64, ${base64String}`;
        setPreviewImage((p) => [...p, to_src]);
      });
    }
  }, [lastMessage]);
  async function fetchRootFolder(rootfolder) {
    const config_file = await rootfolder.getEntry('config.json');
    const qp_image_generator = await rootfolder.getEntry('image_generator.json');
    const comfyui_root = await rootfolder.getEntry('ComfyUI');
    const styles = await rootfolder.getEntry('styles');
    const input = await comfyui_root?.getEntry('input');
    const output = await comfyui_root?.getEntry('output');
    setQPImageGenerator(qp_image_generator);
    setStylesFolder(styles);
    setIoFolder({input: input, output: output});

    const config: GLOBALCONFIG = JSON.parse(await config_file.read());
    setGlobalConfig(config);
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
    generateImage(QPImageGenerator, globalConfig, promptStyle, promptText, imgSize[imageSize], uuid);
  }
  function HandleInpainting() {
    inpaintCUrrentSelectedLayer(ioFolder, promptText, uuid);
  }
  return (
    <div className="flex flex-col w-full h-full">
      <div style={{width: `${process}%`}} className="loading bg-black h-full bg-opacity-50 absolute top-0 w-full"></div>

      {curStatus && (
        <div>
          <div className="acc-title text-lg text-white w-full text-center">Generating...</div>

          <div className="flex flex-col">
            <div className={`relative`}>
              {previewImage.map((value, idx) => {
                return <img key={idx} src={value} alt="" className="object-cover h-auto w-full absolute" />;
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`main-content-panel relative ${curStatus ? 'hidden' : 'flex flex-col w-full h-full'}`}>
        <TextPrompt
          showTextPanel={false}
          disabled={curStatus}
          onChange={(value) => {
            localStorage.setItem('PROMPT', value);
            setPromptText(value);
          }}
          title={'type your prompt here...'}
          content={promptText}
        />

        <div className="flex flex-col flex-wrap content-start w-full">
          <DropdownStyleChooser
            className={`w-full`}
            styleFolder={stylesFolder}
            onStyleChoosen={(style) => {
              setPromptStyle(style);
            }}
          />
          <div className="flex flex-row w-full">
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
          </div>
          <div className="grow"></div>
          <div className="flex flex-row w-full self-end">
            <div
              className={`my-1 py-1 btn-text w-full rounded-sm text-center ${curStatus ? 'disabled' : 'enabled'}`}
              onClick={() => {
                switch (method) {
                  case 'Generate':
                    setPreviewImage(['./icons/preview.png']);
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
    </div>
  );
};
