/// <reference path="./global.d.ts"/>





let i = 0;
let selected_layer = await doc.activeLayers[0];
let texitem = selected_layer.textItem;

async function doStuff() {

  const all_texts = texitem.contents.split("\r");

  for await (const text of all_texts) {
    await executeAsModal(async () => {
      const newlayer = await selected_layer.duplicate();
      const newselectedlayer = newlayer.textItem;
      newselectedlayer.contents = text;
      newlayer.name = "dcsmstext_tamper";
      let height = newlayer.boundsNoEffects.bottom - newlayer.boundsNoEffects.top;

      console.log(height * i);
      await newlayer.translate(0, height * i);
      i++;

    }, { "commandName": "split text" })
  }

}
await doStuff();
await executeAsModal(
  async (_executionContext, descriptor) => {

    let hostControl = _executionContext.hostControl;
    let documentID = app.activeDocument.id;
    let suspensionID = await hostControl.suspendHistory({
      documentID: documentID,
      name: 'split',
    });
    await selected_layer.delete();

    await hostControl.resumeHistory(suspensionID, true);


  },
  { commandName: 'split text()' }
);


