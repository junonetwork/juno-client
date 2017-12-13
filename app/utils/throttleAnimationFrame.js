import raf from 'raf';


export default (cb) => {
  let clear = true;

  return (...args) => {
    if (clear) {
      raf(() => {
        cb(...args);
        clear = true;
      });

      clear = false;
    }
  };
};
