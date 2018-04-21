import {
  path,
  pathOr,
  prop,
  last,
  identity,
} from 'ramda';
import multimethod from './multimethod';
import {
  destructureAddress,
} from './cell';
import {
  serializeSearch,
} from '../redux/modules/tables';


export const cell2PathFragment = multimethod(
  prop('type'),
  [
    'searchCollection', ({ search }) => ['collection', serializeSearch(search)],
    'valueCollection', ({ resourcePath }) => resourcePath,
    'predicate', ({ uri }) => [uri],
    'index', ({ index }) => [index],
    'object', ({ collectionAddress, indexAddress, predicateAddress }, sheetMatrix) => {
      // recurse to caculate pathFragment for collection, index, and address
      const {
        column: collectionColumn,
        row: collectionRow,
      } = destructureAddress(collectionAddress);
      const {
        column: indexColumn,
        row: indexRow,
      } = destructureAddress(indexAddress);
      const {
        column: predicateColumn,
        row: predicateRow,
      } = destructureAddress(predicateAddress);

      return [
        ...cell2PathFragment(
          sheetMatrix[collectionRow][collectionColumn],
          sheetMatrix
        ),
        ...cell2PathFragment(
          sheetMatrix[indexRow][indexColumn],
          sheetMatrix
        ),
        ...cell2PathFragment(
          sheetMatrix[predicateRow][predicateColumn],
          sheetMatrix
        ),
      ];
    },
  ]
);


export const getSearchCollectionPath = (type) => [
  'resource', type, 'skos:prefLabel', 0,
];

export const getPredicatePath = (uri) => ['resource', uri, 'skos:prefLabel', 0];

export const getIndexPath = (collectionAddress, index, sheetMatrix) => {
  const {
    column: collectionColumn,
    row: collectionRow,
  } = destructureAddress(collectionAddress);

  return [
    ...cell2PathFragment(
      sheetMatrix[collectionRow][collectionColumn],
      sheetMatrix
    ),
    index,
  ];
};


export const getObjectPath = (collectionAddress, indexAddress, predicateAddress, sheetMatrix) => {
  const {
    column: collectionColumn,
    row: collectionRow,
  } = destructureAddress(collectionAddress);
  const {
    column: indexColumn,
    row: indexRow,
  } = destructureAddress(indexAddress);
  const {
    column: predicateColumn,
    row: predicateRow,
  } = destructureAddress(predicateAddress);

  return [
    ...cell2PathFragment(
      sheetMatrix[collectionRow][collectionColumn],
      sheetMatrix
    ),
    ...cell2PathFragment(
      sheetMatrix[indexRow][indexColumn],
      sheetMatrix
    ),
    ...cell2PathFragment(
      sheetMatrix[predicateRow][predicateColumn],
      sheetMatrix
    ),
  ];
};


const materializeSearchCollection = (cell, graphJSON) => {
  const relativePath = getSearchCollectionPath(cell.search.type);

  return {
    ...cell,
    cellLength: path(
      [
        'collection',
        serializeSearch(cell.search),
        'length',
        'value',
      ],
      graphJSON
    ),
    value: path([...relativePath, 'value'], graphJSON),
  };
};


const materializeValueCollection = (cell, graphJSON) => {
  return {
    ...cell,
    cellLength: path(
      [
        ...cell.resourcePath,
        'length',
        'value',
      ],
      graphJSON
    ),
    value: path(
      ['resource', last(cell.resourcePath), 'skos:prefLabel', 0, 'value'],
      graphJSON
    ),
  };
};


// const materializeIndex = (cell, graphJSON, sheetMatrix) => {
//   const relativePath = getIndexPath(cell.collectionAddress, cell.index, sheetMatrix);

//   // TODO - perhaps this should be recorded on write?
//   const { column, row } = destructureAddress(cell.collectionAddress);
//   const collectionType = sheetMatrix[row][column].type;
//   return {
//     ...cell,
//     value: collectionType === 'valueCollection' ?
//       `${cell.index} ${pathOr('', [...relativePath, 'value'], graphJSON)}` :
//       cell.index,
//     absolutePath: path([...relativePath, '$__path'], graphJSON),
//   };
// };
const materializeIndex = (cell, graphJSON, sheetMatrix) => {
  const relativePath = getIndexPath(cell.collectionAddress, cell.index, sheetMatrix);

  return {
    ...cell,
    value: cell.index,
    absolutePath: path([...relativePath, '$__path'], graphJSON),
  };
};


const materializePredicate = (cell, graphJSON) => ({
  ...cell,
  value: path([...getPredicatePath(cell.uri), 'value'], graphJSON),
});


const getBoxedValue = (relativePath, graphJSON) => {
  const boxValue = path([...relativePath, 0], graphJSON);
  if (!boxValue) {
    return {};
  }

  // if boxValue points to an object, get its skos:prefLabel
  if (boxValue['skos:prefLabel']) {
    return {
      value: boxValue['skos:prefLabel'][0].value,
      valueType: boxValue['skos:prefLabel'][0].$type === 'error' ? 'error' : 'ref',
    };
  }

  return {
    value: boxValue.value,
    valueType: boxValue.$type,
  };
};

const getAbsolutePath = (cellLength, relativePath, graphJSON) => {
  let absolutePath;

  if (cellLength === 1 && path([...relativePath, 0, '$__path'], graphJSON)) {
    absolutePath = path([...relativePath, 0, '$__path'], graphJSON);
  } else if (path([...relativePath, '$__path'], graphJSON)) {
    absolutePath = path([...relativePath, '$__path'], graphJSON);
  } else {
    absolutePath = null;
  }

  return absolutePath;
};

const materializeObject = (cell, graphJSON, sheetMatrix) => {
  const relativePath = getObjectPath(
    cell.collectionAddress, cell.indexAddress, cell.predicateAddress, sheetMatrix
  );
  const cellLength = pathOr(1, [...relativePath, 'length', 'value'], graphJSON);

  const { value, valueType } = getBoxedValue(relativePath, graphJSON);

  return {
    ...cell,
    absolutePath: getAbsolutePath(cellLength, relativePath, graphJSON),
    cellLength,
    value,
    valueType,
  };
};

export const materializeCell = multimethod(
  prop('type'),
  [
    'searchCollection', materializeSearchCollection,
    'valueCollection', materializeValueCollection,
    'index', materializeIndex,
    'predicate', materializePredicate,
    'object', materializeObject,
    'empty', identity,
  ]
);
