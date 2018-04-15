import {
  range,
  partition,
  contains,
  subtract,
}                                    from 'ramda';


export const expandIndicesKeySet = (keySet) => (
  keySet.reduce((indexList, key) => {
    if (typeof key === 'object') {
      indexList.push(...range(key.from || 0, key.to + 1));
      return indexList;
    }

    indexList.push(key);
    return indexList;
  }, [])
);


export const indicesKeySet2String = (indicesKeySet) => (
  indicesKeySet.reduce((keySets, keySet) => {
    if (typeof keySet === 'number') {
      keySets.push(keySet);
      return keySets;
    }

    keySets.push(`${keySet.from || 0}-${keySet.to}`);
    return keySets;
  }, []).join(',')
);


export const indicesString2KeySet = (indicesString) => {
  const [ranges, indices] = partition(contains('-'), indicesString.split(','));
  const parsedRanges = ranges.map((_range) => {
    const [from, to] = _range.split('-');
    return { from: parseInt(from, 10), to: parseInt(to, 10), };
  });

  return [...indices.map((idx) => parseInt(idx, 10)), ...parsedRanges]
    .sort((indexOrRangeA, indexOrRangeB) => subtract(
      typeof indexOrRangeA === 'number' ? indexOrRangeA : indexOrRangeA.from,
      typeof indexOrRangeB === 'number' ? indexOrRangeB : indexOrRangeB.from
    ));
};


export const getCellOffsetFromTable = (column, row, [[{ column: originX, row: originY, }]]) => ([
  column - originX,
  row - originY,
]);


export const isLegalDrop = (toTableXOrigin, toTableYOrigin, dragTable, tables) => {
  const dragTableXLength = dragTable[0].length - 1;
  const dragTableYLength = dragTable.length - 1;

  return tables.reduce((isLegal, { table, }) => {
    const tableXMin = table[0][0].column;
    const tableXMax = table[0][0].column + (table[0].length - 1);
    const tableYMin = table[0][0].row;
    const tableYMax = table[0][0].row + (table.length - 1);

    return isLegal && (
      toTableXOrigin + dragTableXLength < tableXMin ||
      toTableXOrigin > tableXMax ||
      toTableYOrigin + dragTableYLength < tableYMin ||
      toTableYOrigin > tableYMax
    );
  }, true);
};
