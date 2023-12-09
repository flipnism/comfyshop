import React, {useEffect, useState} from 'react';
import {HeroIcons} from '../interfaces/HeroIcons';
import {CUSTOMSCRIPT, GLOBALCONFIG} from '../interfaces/types';
import {executeCustomScripts} from '../utils/BPUtils';
import Sval from 'sval';
import {Label} from '../components';
import {PickFolderFor} from '../utils/Token';
const fs = require('uxp').storage.localFileSystem;

export const CustomScriptPanel = () => {
  const TEMPLATE = 'TEMPLATE_FOLDER';
  const [customScripts, setCustomScripts] = useState<CUSTOMSCRIPT[]>(null);
  const [customScriptsFolder, setCustomScriptsFolder] = useState(null);
  const [customScriptTooltip, setCustomScriptTooltip] = useState('');
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
    );
    setCustomScripts(scrpts);
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
  return (
    <div className="button-grid flex flex-row">
      <div className="flex flex-row w-full flex-wrap">
        {customScripts &&
          customScripts.map((value, index) => {
            return (
              <HeroIcons
                parentClassName="px-1"
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
      <div className="flex flex-col absolute bottom-0 left-0">
        {customScriptTooltip && customScriptTooltip !== '' && (
          <Label slot="label" className={`text-white text-xs left-2 pointer-events-none whitespace-pre-wrap`}>
            {customScriptTooltip}
          </Label>
        )}
      </div>
    </div>
  );
};
