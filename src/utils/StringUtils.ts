export function calculateNested(array: string[]) {
  let count = 0;
  array.forEach((e) => {
    count = count + Math.round(e.length / 38);
  });
  return count;
}
