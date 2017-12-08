import {
  range,
}                        from 'ramda';


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
