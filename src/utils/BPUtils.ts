const fs = require('uxp').storage.localFileSystem;
import {core, app, action, constants, imaging} from 'photoshop';
import {BOUNDS} from '../interfaces/types';

export const saveAsPng = (path: any) => {
  return {
    _obj: 'save',
    as: {
      _obj: 'PNGFormat',
      method: {
        _enum: 'PNGMethod',
        _value: 'moderate',
      },
      embedIccProfileLastState: {
        _enum: 'embedOff',
        _value: 'embedOff',
      },
    },
    in: {
      _path: path,
      _kind: 'local',
    },
    copy: true,
    lowerCase: true,
    embedProfiles: false,
    saveStage: {
      _enum: 'saveStageType',
      _value: 'saveBegin',
    },
  };
};
async function UNDO() {
  return await action.batchPlay(
    [
      {
        _obj: 'select',
        _target: [
          {
            _ref: 'historyState',
            _enum: 'ordinal',
            _value: 'previous',
          },
        ],
      },
    ],
    {}
  );
}

export function generateRandomName(filetype?: string, without_extension?: boolean) {
  if (filetype) return (Math.random() + 1).toString(36).substring(7) + filetype.replace('image/', '.');
  else return (Math.random() + 1).toString(36).substring(7) + (without_extension ? '' : '.png');
}

export const isValidUrl = (urlString) => {
  var res = urlString.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return res !== null;
};
export async function saveSelectionToImage(bounds: BOUNDS, IOFolder: any, node_name?: string) {
  // const notselected = bounds.left == 0 && bounds.right == 0;
  // if (notselected) return null;
  return await core.executeAsModal(
    async (_executionContext, descriptor: object) => {
      await action.batchPlay(
        [
          {
            _obj: 'crop',
            delete: true,
          },
        ],
        {}
      );
      let hostControl = _executionContext.hostControl;
      let documentID = app.activeDocument.id;
      let suspensionID = await hostControl.suspendHistory({
        documentID: documentID,
        name: 'saveSelectionToImage',
      });

      let rand_name = generateRandomName();
      if (node_name) rand_name = node_name + '_' + rand_name;
      const newJPG = await IOFolder?.input?.createFile(rand_name, {overwrite: true});
      const png = await fs.createSessionToken(newJPG);
      const result = await action.batchPlay([saveAsPng(png)], {});

      let new_name = result[0].in._path;
      new_name = new_name.substring(new_name.lastIndexOf('\\') + 1);
      await UNDO();
      await hostControl.resumeHistory(suspensionID, true);

      return new_name;
    },
    {commandName: 'save selection to image file'}
  );
}
export async function downloadImage(IOFolder: any, buffer: any, filetype: string, node_name?: string) {
  return await core
    .executeAsModal(
      async (_executionContext, descriptor: object) => {
        let hostControl = _executionContext.hostControl;
        let documentID = app.activeDocument.id;
        let suspensionID = await hostControl.suspendHistory({
          documentID: documentID,
          name: 'downloadImage',
        });

        let rand_name = generateRandomName(filetype);
        if (node_name) rand_name = node_name + '_' + rand_name;
        const newJPG = await IOFolder?.input?.createFile(rand_name, {overwrite: true});
        await newJPG.write(buffer, {format: require('uxp').storage.formats.binary});
        await hostControl.resumeHistory(suspensionID, true);

        return rand_name;
      },
      {commandName: 'downloading Image from url'}
    )
    .catch((e) => console.log(e));
}
/**
 *
 * @param imagename
 * @param outputFolder
 * @param selectionBounds
 */
export function placeImageOnCanvas(imagename: string, outputFolder: any, selectionBounds: BOUNDS, resizeme?: boolean) {
  core.executeAsModal(
    async () => {
      const outputEntry = await outputFolder?.output?.getEntry(imagename);
      const filepath = await fs.createSessionToken(outputEntry);
      await action
        .batchPlay(
          [
            {
              _obj: 'placeEvent',
              null: {
                _path: filepath,
                _kind: 'local',
              },
              linked: true,
            },
          ],
          {}
        )
        .catch((e) => console.log(e));
      if (imagename.includes('RemBG')) {
        await action
          .batchPlay(
            [
              {
                _obj: 'set',
                _target: [
                  {
                    _ref: 'channel',
                    _property: 'selection',
                  },
                ],
                to: {
                  _ref: 'channel',
                  _enum: 'channel',
                  _value: 'transparencyEnum',
                },
                invert: false,
              },
              {
                _obj: 'delete',
                _target: [
                  {
                    _ref: 'layer',
                    _enum: 'ordinal',
                    _value: 'targetEnum',
                  },
                ],
              },
              {
                _obj: 'make',
                new: {
                  _class: 'channel',
                },
                at: {
                  _ref: 'channel',
                  _enum: 'channel',
                  _value: 'mask',
                },
                using: {
                  _enum: 'userMaskEnabled',
                  _value: 'revealSelection',
                },
              },
            ],
            {}
          )
          .catch((e) => console.log());
      }
      if (!resizeme) {
        const sourcewidth: number = selectionBounds.right - selectionBounds.left;
        const sourceheight = selectionBounds.bottom - selectionBounds.top;
        const layer = app.activeDocument.activeLayers[0].boundsNoEffects;
        const curwidth: number = layer.width;
        const curheight = layer.height;
        //const percentage = (sourcewidth / curwidth) * 100;
        const percentage = (sourceheight / curheight) * 100;
        await app.activeDocument.activeLayers[0].scale(percentage, percentage, constants.AnchorPosition.MIDDLECENTER);
      }
    },
    {commandName: 'place Event'}
  );
}

export async function saveSelectedLayerToImage(IOFolder: any, node_name?: string) {
  // const notselected = bounds.left == 0 && bounds.right == 0;
  // if (notselected) return null;
  return await core.executeAsModal(
    async (_executionContext, descriptor: object) => {
      let hostControl = _executionContext.hostControl;
      let documentID = app.activeDocument.id;
      let suspensionID = await hostControl.suspendHistory({
        documentID: documentID,
        name: 'saveSelectedLayerToImage',
      });
      await croppedSelectedLayer();
      let selectedLayer = app.activeDocument.activeLayers[0];
      selectedLayer;
      let rand_name = generateRandomName(null, true);
      if (node_name) rand_name = node_name + '_' + rand_name;
      console.log(rand_name);
      selectedLayer.name = rand_name;
      await action.batchPlay(
        [
          {
            _obj: 'exportSelectionAsFileTypePressed',
            _target: {_ref: 'layer', _enum: 'ordinal', _value: 'targetEnum'},
            fileType: 'png',
            quality: 32,
            metadata: 0,
            destFolder: IOFolder?.input?.nativePath, //destFolder.nativePath,
            sRGB: true,
            openWindow: false,
            _options: {dialogOptions: 'dontDisplay'},
          },
        ],
        {}
      );
      return rand_name + '.png';
    },
    {commandName: 'save selection to image file'}
  );
}

export async function selectedLayerToBitmap(targetLayer, width, height) {
  const kSRGBProfile = 'sRGB IEC61966-2.1';
  let targetDocument = app.activeDocument;
  if (targetDocument == undefined) {
    throw 'No open document';
  }

  let pixels = await imaging.getPixels({
    documentID: targetDocument.id,
    targetSize: {height: 100, width: width},
    componentSize: 8,
    applyAlpha: true,
    colorProfile: kSRGBProfile,
    layerID: targetLayer.id,
  });
  let jpegData = await imaging.encodeImageData({'imageData': pixels.imageData, 'base64': true});
  let bufferdata = await pixels.imageData.getData({chunky: true});
  //   let dataUrl = 'data:image/jpeg;base64,' + jpegData;
  // Release image data immediately
  pixels.imageData.dispose();
  return bufferdata;
}

export async function croppedSelectedLayer() {
  return await core.executeAsModal(
    async () => {
      const selectedLayer = app.activeDocument.activeLayers[0];
      const clone = await selectedLayer.duplicate();
      await action.batchPlay(
        [
          {
            '_obj': 'make',
            '_target': [
              {
                '_ref': 'contentLayer',
              },
            ],
            'using': {
              '_obj': 'contentLayer',
              'type': {
                '_obj': 'solidColorLayer',
                'color': {
                  '_obj': 'RGBColor',
                  'red': 255,
                  'grain': 255,
                  'blue': 255,
                },
              },
              'shape': {
                '_obj': 'rectangle',
                'unitValueQuadVersion': 1,
                'top': {
                  '_unit': 'pixelsUnit',
                  '_value': 0,
                },
                'left': {
                  '_unit': 'pixelsUnit',
                  '_value': 0,
                },
                'bottom': {
                  '_unit': 'pixelsUnit',
                  '_value': 720,
                },
                'right': {
                  '_unit': 'pixelsUnit',
                  '_value': 1280,
                },
                'topRight': {
                  '_unit': 'pixelsUnit',
                  '_value': 0,
                },
                'topLeft': {
                  '_unit': 'pixelsUnit',
                  '_value': 0,
                },
                'bottomLeft': {
                  '_unit': 'pixelsUnit',
                  '_value': 0,
                },
                'bottomRight': {
                  '_unit': 'pixelsUnit',
                  '_value': 0,
                },
              },
              'strokeStyle': {
                '_obj': 'strokeStyle',
                'strokeStyleVersion': 2,
                'strokeEnabled': true,
                'fillEnabled': false,
                'strokeStyleLineWidth': {
                  '_unit': 'pixelsUnit',
                  '_value': 1,
                },
                'strokeStyleLineDashOffset': {
                  '_unit': 'pointsUnit',
                  '_value': 0,
                },
                'strokeStyleMiterLimit': 100,
                'strokeStyleLineCapType': {
                  '_enum': 'strokeStyleLineCapType',
                  '_value': 'strokeStyleButtCap',
                },
                'strokeStyleLineJoinType': {
                  '_enum': 'strokeStyleLineJoinType',
                  '_value': 'strokeStyleMiterJoin',
                },
                'strokeStyleLineAlignment': {
                  '_enum': 'strokeStyleLineAlignment',
                  '_value': 'strokeStyleAlignCenter',
                },
                'strokeStyleScaleLock': false,
                'strokeStyleStrokeAdjust': false,
                'strokeStyleLineDashSet': [],
                'strokeStyleBlendMode': {
                  '_enum': 'blendMode',
                  '_value': 'normal',
                },
                'strokeStyleOpacity': {
                  '_unit': 'percentUnit',
                  '_value': 1,
                },
                'strokeStyleContent': {
                  '_obj': 'solidColorLayer',
                  'color': {
                    '_obj': 'RGBColor',
                    'red': 0,
                    'grain': 0,
                    'blue': 0,
                  },
                },
                'strokeStyleResolution': 72,
              },
            },
          },
          {
            '_obj': 'rasterizeLayer',
            '_target': [
              {
                '_ref': 'layer',
                '_enum': 'ordinal',
                '_value': 'targetEnum',
              },
            ],
          },
        ],
        {}
      );

      await action.batchPlay(
        [
          {
            '_obj': 'select',
            '_target': [
              {
                _ref: 'layer',
                _id: clone.id,
              },
            ],
            'selectionModifier': {
              '_enum': 'selectionModifierType',
              '_value': 'addToSelectionContinuous',
            },
            'makeVisible': false,
          },
          {
            '_obj': 'mergeLayersNew',
          },
        ],
        {}
      );
    },
    {'commandName': 'crop selected layer'}
  );
}
