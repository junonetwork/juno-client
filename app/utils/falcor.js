export const isPaths = (paths) => {
  if (!Array.isArray(paths)) {
    return false;
  }

  if (paths.length === 0) {
    return false;
  }

  for (let i = 0; i < paths.length; i += 1) {
    if (!Array.isArray(paths[i])) {
      return false;
    }
  }

  return true;
};

export const rangeLength = (rangeKey) => (
  typeof rangeKey === 'object' ?
    (rangeKey.to + 1) - (rangeKey.from || 0) :
    1
);
