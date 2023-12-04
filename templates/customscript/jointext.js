

const selected_layers = doc.activeLayers;
const reorder = selected_layers.sort((a, b) => a.bounds.top - b.bounds.top);
let new_text = reorder.map(t => t.textItem.contents).join(" ");

for await (const [index, value] of reorder.entries()) {
    if (index == 0) {
        value.textItem.contents = new_text;
    } else {
        await executeAsModal(async () => {
            await value.delete();
        }, { "commandName": "duh" })
    }


}