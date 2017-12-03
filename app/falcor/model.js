import { Model }             from 'falcor';
import {
  createEventHandler,
}                            from 'recompose';

const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler();

export default new Model({
  cache: {
    app: {
      value: 'XXX',
    },
  },
  onChange: graphChange,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues();

export { graphChange$ };
