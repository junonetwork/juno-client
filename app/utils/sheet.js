import {
  range,
  partition,
  contains,
  subtract,
}                                    from 'ramda';


export const createSearchCollectionTable = (
  sheetId, tableId, collectionAddress, search, predicates, indices
) => ({
  collectionType: 'searchCollection',
  sheetId,
  tableId,
  collectionAddress,
  search,
  predicates,
  indices,
});

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
