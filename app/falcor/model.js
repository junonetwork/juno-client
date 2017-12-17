import { Model }             from 'falcor';
import HTTPDataSource        from 'falcor-http-datasource';
import {
  createEventHandler,
}                            from 'recompose';

const {
  stream: graphChange$,
  handler: graphChange,
} = createEventHandler();

export default new Model({
  source: new HTTPDataSource('/api/model.json'),
  onChange: graphChange,
})
  .batch()
  .boxValues()
  .treatErrorsAsValues();

export { graphChange$ };
