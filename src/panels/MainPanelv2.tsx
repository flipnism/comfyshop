import React, {useEffect, useState, useRef, HtmlHTMLAttributes} from 'react';
import {PickFolderFor} from '../utils/Token';
import {action, app, core, imaging} from 'photoshop';
import {ActionDescriptor} from 'photoshop/dom/CoreModules';
import WorkflowPicker from '../customcomponents/WorkflowPicker';
import {NodePanel} from './NodePanel';
import {BOUNDS, STATE, listItems} from '../interfaces/types';
import {
  _arrayBufferToBase64,
  executed,
  executing,
  fetchObjectInfo,
  status,
  output_images,
  progress,
  server_type,
  InterruptServer,
  sendWorkflowDataToServer,
} from '../utils/ServerUtils';
import {Button} from '../components';
import useWebSocket from 'react-use-websocket';
import {v4 as uuidv4} from 'uuid';
import {placeImageOnCanvas} from '../utils/BPUtils';
import {NodePanelv2} from './NodePanelv2';

const fs = require('uxp').storage.localFileSystem;
export type MAINSTATE = {
  rootfolder: any;
  iofolder: any;
  globalconfig: any;
  workflowfolder: any;
  workflowfiles: [];
  currentworkflowfile: any;
  WF: any;
  hideallcard: {};
  cardinfo: {};
  showcard: {};
  items: [];
};

export const MainPanelv2 = () => {
  const TEMPLATE = 'TEMPLATE_FOLDER';
  const [btnState, setBtnState] = useState<STATE>(STATE.disable);
  const [status, setStatus] = useState(false);
  const [logs, setLogs] = useState('');
  const [queue, setQueue] = useState(0);
  const [process, setProcess] = useState(0);
  const [bounds, setBounds] = useState<BOUNDS>({left: 0, top: 0, right: 0, bottom: 0});
  const [previewImage, setPreviewImage] = useState(['./icons/preview.png']);
  const NodePanelRef = useRef(null);
  const [uuid, setUuid] = useState(uuidv4());
  const {lastJsonMessage, lastMessage} = useWebSocket('ws://127.0.0.1:8188/ws?clientId=' + uuid, {
    share: true,
    shouldReconnect: (closeEvent) => {
      return true;
    },
  });

  const [curState, setCurState] = useState<MAINSTATE>({
    rootfolder: null,
    iofolder: null,
    globalconfig: null,
    workflowfolder: null,
    workflowfiles: [],
    currentworkflowfile: null,
    WF: null,
    hideallcard: {},
    cardinfo: {},
    showcard: {},
    items: [],
  });
  useEffect(() => {
    const _bounds = bounds.left == 0 && bounds.right == 0 ? {left: 0, top: 0, right: app?.activeDocument?.width, bottom: app?.activeDocument?.height} : bounds;
    if (!lastJsonMessage) return;
    const obj: any = lastJsonMessage;
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
            NodePanelRef?.current?.showNodes(true);
          }

          break;
        case type === server_type.executed:
          setLogs('Done!');
          setStatus(false);
          NodePanelRef?.current?.showNodes(true);

          setProcess(0);
          if (previewImage.length > 1) {
            setPreviewImage(previewImage.slice(-1));
          }
          const _done: executed = obj;
          const all_files: output_images[] = _done?.data?.output?.images;
          for (const files of all_files) {
            placeImageOnCanvas(files?.filename, curState?.iofolder, _bounds, false);
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
  /**
   * initiating working folder
   * - comfyui folder
   * - workflow folder
   * - config file
   * */
  async function examine_rootfolder(rootfolder) {
    const comfyui_root = await rootfolder.getEntry('ComfyUI');
    const config_file = await rootfolder.getEntry('config.json');
    const workflow_folder = await rootfolder.getEntry('workflows');
    const input = await comfyui_root?.getEntry('input');
    const output = await comfyui_root?.getEntry('output');
    const glob_conf = JSON.parse(await config_file.read());
    const wf_files = Object.values(await workflow_folder.getEntries()).filter((e: any) => e.isFile);
    setCurState((prevState: any) => ({
      ...prevState,
      rootfolder: rootfolder,
      iofolder: {input: input, output: output},
      globalconfig: glob_conf,
      workflowfolder: workflow_folder,
      workflowfiles: wf_files,
    }));
  }

  async function init() {
    fs.getEntryForPersistentToken(localStorage.getItem(TEMPLATE))
      .then((result) => {
        examine_rootfolder(result);
      })
      .catch(() => {
        PickFolderFor(TEMPLATE).then((result: any) => {
          examine_rootfolder(result);
        });
      });
  }
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
    console.log('init');
    init();
    action.addNotificationListener(['set', 'select'], photoshopActionListener);

    return () => {
      action.removeNotificationListener(['set', 'select'], photoshopActionListener);
    };
  }, []);

  function onWorkflowChangeListener(workflow_file) {
    curState.workflowfolder.getEntry(workflow_file.name).then(async (file) => {
      const content = await file.read();
      const _WF = JSON.parse(content);
      const promises = Object.keys(_WF).map(async (v, idx) => {
        const _class_type = _WF?.[v]?.class_type;

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
      setCurState((prevState) => ({...prevState, showcard: [], currentworkflowfile: workflow_file, hideallcard: [], items: [], cardinfo: infoObject, WF: _WF}));
      setBtnState(STATE.enable);
    });
  }

  async function handleGenerateClick() {
    if (status) {
      InterruptServer();
      return;
    }

    setPreviewImage(['./icons/preview.png']);
    NodePanelRef?.current?.showNodes(false);
    const workflows = NodePanelRef?.current?.prepareWorkflowData();
    sendWorkflowDataToServer(workflows, uuid);
  }

  return (
    <React.StrictMode>
      <div className="main">
        {<WorkflowPicker workflowFiles={curState?.workflowfiles} onSelectionChange={onWorkflowChangeListener} />}
        <Button variant={`${status ? 'warning' : 'cta'}`} disabled={btnState == STATE.disable} className="rounded-md mt-2 w-full" onClick={handleGenerateClick}>
          {`${status ? 'Cancel' : 'Generate'}`}
        </Button>
        {status && (
          <div className="flex flex-col">
            <div className={`relative`}>
              {previewImage.map((value, idx) => {
                return <img key={idx} src={value} alt="" className="object-cover h-auto w-full absolute" />;
              })}
            </div>
          </div>
        )}
        <NodePanelv2 ref={NodePanelRef} bounds={bounds} state={curState} />
      </div>
    </React.StrictMode>
  );
};
