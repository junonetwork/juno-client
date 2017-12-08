export const createSearchCollectionTable = (
  collectionAddress, search, predicates, indices
) => ({
  collectionType: 'searchCollection',
  collectionAddress,
  search,
  predicates,
  indices,
});
