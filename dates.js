const array = [
  { start: '2021-05-15', end: '2021-05-29' },
  { start: '2021-05-02', end: '' },
  { start: '2021-05-10', end: '2021-05-12' },
  { start: '2021-05-15', end: '2021-05-30' },
  { start: '2021-04-28', end: '' },
];

const sortedArray = array.sort((a, b) => new Date(a.start) - new Date(b.start));

const pairs = [];
console.log(sortedArray)
const nextYear = new Date(new Date().setFullYear(2022));

const mapped = sortedArray.map((obj) => {
  obj.start = new Date(obj.start);
  obj.end = obj.end ? new Date(obj.end) : nextYear;
  return obj;
})

for(let i = 0; i < mapped.length - 1; i++) {
  const current = mapped[i];
  const next = mapped[i + 1];

  if (current.end < next.start) {
    newEntry = {
      start : current.start,
      end   : next.end,
    };
    mapped[i] = newEntry;
    mapped.splice(i + 1, 1); // delete coalesced entry
  }
}

console.log(mapped);