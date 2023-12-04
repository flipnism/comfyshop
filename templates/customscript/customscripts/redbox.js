const layer = doc.activeLayers[0];
const bounds = layer.boundsNoEffects;
const select = (_id) => {
  return {
    '_obj': 'select',
    '_target': [
      {
        '_ref': 'layer',
        '_id': _id,
      },
    ],
    'selectionModifier': {
      '_enum': 'selectionModifierType',
      '_value': 'addToSelection',
    },
  };
};
const create_rect = (bounds, padding) => {
  return {
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
          'red': 159.0000057220459,
          'grain': 0.0038910505827516317,
          'blue': 0.0038910505827516317,
        },
      },
      'shape': {
        '_obj': 'rectangle',
        'unitValueQuadVersion': 1,
        'top': {
          '_unit': 'pixelsUnit',
          '_value': bounds.top - padding,
        },
        'left': {
          '_unit': 'pixelsUnit',
          '_value': bounds.left - padding,
        },
        'bottom': {
          '_unit': 'pixelsUnit',
          '_value': bounds.bottom + padding,
        },
        'right': {
          '_unit': 'pixelsUnit',
          '_value': bounds.right + padding,
        },
        'topRight': {
          '_unit': 'pixelsUnit',
          '_value': 10,
        },
        'topLeft': {
          '_unit': 'pixelsUnit',
          '_value': 10,
        },
        'bottomLeft': {
          '_unit': 'pixelsUnit',
          '_value': 10,
        },
        'bottomRight': {
          '_unit': 'pixelsUnit',
          '_value': 10,
        },
      },
      'strokeStyle': {
        '_obj': 'strokeStyle',
        'strokeStyleVersion': 2,
        'strokeEnabled': true,
        'fillEnabled': true,
        'strokeStyleLineWidth': {
          '_unit': 'pixelsUnit',
          '_value': 0,
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
          '_value': 100,
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
    'layerID': 785,
    '_isCommand': true,
  };
};

const b = { top: bounds.top, right: bounds.right, left: bounds.left, bottom: bounds.bottom };
await batchPlay([create_rect(b, 10)], {});
await batchPlay(
  [
    {
      '_obj': 'move',
      '_target': [
        {
          '_ref': 'layer',
          '_enum': 'ordinal',
          '_value': 'targetEnum',
        },
      ],
      'to': {
        '_ref': 'layer',
        '_enum': 'ordinal',
        '_value': 'previous',
      },
    },
  ],
  {}
);
await executeAsModal(
  async () => {
    await batchPlay([select(layer.id), select(doc.activeLayers[0].id)], {}).catch((e) => console.log(e));
    await batchPlay(
      [
        {
          '_obj': 'linkSelectedLayers',
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
    ).catch((e) => console(e));
  },
  { commandName: 'select' }
);
