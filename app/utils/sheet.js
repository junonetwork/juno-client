/* eslint-disable prefer-destructuring */
import {
  range,
  last,
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

export const indicesKeySet2String = (indices) => (
  [...expandIndicesKeySet(indices), null]
    .reduce(([buffer, parsedIndices], index, idx, collection) => {
      if (idx === 0) {
        // initialize buffer
        return [[index], parsedIndices];
      } else if (buffer.length === 0) {
        // re-initialize buffer
        return [[index], parsedIndices];
      } else if (index === last(buffer) + 1) {
        // add to buffer
        return [[...buffer, index], parsedIndices];
      } else if (
        idx === collection.length - 1 ||
        index !== last(buffer) + 1
      ) {
        // if end of list, flush buffer (final index is null and can be ignored)
        // if next index isn't sequential w/ buffer, flush buffer and reinitialize w/ index
        if (buffer.length <= 2) {
          return parsedIndices === '' ?
            [[index], `${buffer.join(',')}`] :
            [[index], `${parsedIndices},${buffer.join(',')}`];
        }

        return parsedIndices === '' ?
          [[index], `${buffer[0]}-${last(buffer)}`] :
          [[index], `${parsedIndices},${buffer[0]}-${last(buffer)}`];
      }

      console.log(
        'warning, indicesKeySet2String failed to catch case',
        buffer, parsedIndices, index, collection
      );
      return [[...buffer, index], parsedIndices];
    }, [[], ''])[1]
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
