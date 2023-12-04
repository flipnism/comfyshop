const l = doc.layers[0];
console.log(l);
l.layers.forEach((h) => {
  console.log(h.name);
  if (h.name === 'bawah' || h.name === 'samping') h.visible = !h.visible;
});
