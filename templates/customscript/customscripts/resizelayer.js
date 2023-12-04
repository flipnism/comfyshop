/// <reference path="./global.d.ts"/>
console.log("resilelayer");
let layer = await doc.activeLayers[0];
let b = layer.boundsNoEffects;
let w = b.right - b.left;
let h = b.bottom - b.top;
const docWidth = app.activeDocument.width;
const docHeight = app.activeDocument.height;
let scale;

if (w < docWidth) {
    scale = docWidth / w * 100;
}
else {
    scale = (docHeight / h) * 100;
}
logme("w docWidth");

const aligncenter = [{
    "_obj": "align",
    "_target": [
        {
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }
    ],
    "using": {
        "_enum": "alignDistributeSelector",
        "_value": "ADSCentersH"
    },
    "alignToCanvas": true,
}, {
    "_obj": "align",
    "_target": [
        {
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }
    ],
    "using": {
        "_enum": "alignDistributeSelector",
        "_value": "ADSCentersV"
    },
    "alignToCanvas": true,
}]
await executeAsModal(
    async () => {
        await batchPlay(aligncenter, {});
        await layer.scale(scale, scale);
    },
    { commandName: 'align center' }
);
