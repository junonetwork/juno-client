const errorHandler = (dispatchValue) => {
  throw new Error(`No multimethod handler for dispatch value '${dispatchValue}'`);
};

export default (dispatch, methods, defaultMethod) => (...args) => {
  if (methods.length % 2 !== 0) {
    throw new Error('multimethod expects even number of method dispatch-handler pairs');
  }

  const dispatchValue = dispatch(...args);

  for (let i = 0; i < methods.length; i += 2) {
    if (dispatchValue === methods[i]) {
      return methods[i + 1](...args);
    }
  }

  return defaultMethod ?
    defaultMethod(...args) :
    errorHandler(dispatchValue);
};
