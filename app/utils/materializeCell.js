import {
  path,
  prop,
  last,
} from 'ramda';
import multimethod from './multimethod';
import {
  destructureAddress,
} from './cell';
import {
  serializeSearch,
} from '../redux/modules/tables';


// TODO - make multimethod
export const cell2PathFragment = (cell, sheetMatrix) => {
  if (cell.type === 'searchCollection') {
    return ['collection', serializeSearch(cell.search)];
  } else if (cell.type === 'valueCollection') {
    return cell.resourcePath;
  } else if (cell.type === 'predicate') {
    return [cell.uri];
  } else if (cell.type === 'index') {
    return [cell.index];
  } else if (cell.type === 'object') {
    // recurse to caculate pathFragment for collection, index, and address
    const {
      column: collectionColumn,
      row: collectionRow,
    } = destructureAddress(cell.collectionAddress);
    const {
      column: indexColumn,
      row: indexRow,
    } = destructureAddress(cell.indexAddress);
    const {
      column: predicateColumn,
      row: predicateRow,
    } = destructureAddress(cell.predicateAddress);

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
  }

  throw new Error('Tried to get path for unknown cell type', cell.type);
};


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


const materializeIndex = (cell, graphJSON, sheetMatrix) => {
  const relativePath = getIndexPath(cell.collectionAddress, cell.index, sheetMatrix);

  return {
    ...cell,
    value: cell.index,
    absolutePath: path([...relativePath, '$__path'], graphJSON),
  };
};


const materializePredicate = (cell, graphJSON) => {
  const relativePath = getPredicatePath(cell.uri);

  return {
    ...cell,
    value: path([...relativePath, 'value'], graphJSON),
  };
};


const materializeObject = (cell, graphJSON, sheetMatrix) => {
  const relativePath = getObjectPath(
    cell.collectionAddress, cell.indexAddress, cell.predicateAddress, sheetMatrix
  );
  const cellLength = path([...relativePath, 'length', 'value'], graphJSON);

  let absolutePath;

  if (cellLength === 1 && path([...relativePath, 0, '$__path'], graphJSON)) {
    absolutePath = path([...relativePath, 0, '$__path'], graphJSON);
  } else if (path([...relativePath, '$__path'], graphJSON)) {
    absolutePath = path([...relativePath, '$__path'], graphJSON);
  } else {
    absolutePath = null;
  }

  let boxValue = path(relativePath, graphJSON);

  // if boxValue is multivalue (not singleton), get first value
  if (boxValue && boxValue['0']) {
    boxValue = boxValue['0'];
  }

  // if boxValue points to an object, get its skos:prefLabel
  if (boxValue && boxValue['skos:prefLabel'] && boxValue['skos:prefLabel'][0]) {
    boxValue = boxValue['skos:prefLabel'][0];
  }

  return {
    ...cell,
    cellLength: cellLength === undefined ? 1 : cellLength,
    absolutePath,
    ...(boxValue || {}),
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
    'empty', (cell) => cell,
  ]
);
