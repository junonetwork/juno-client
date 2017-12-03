const fs = require('fs');

const name = process.argv[2];
const nameCamelCase = name.replace(/^[A-Z]/, l => l.toLowerCase());
const componentName = name.replace(/Container$/, '');


if (!name) {
  console.error('Missing container name as first and only command argument');
  process.exit(1);
} else if (
  !(name[0].charCodeAt() >= 65 && name[0].charCodeAt() <= 90) ||
  !/Container$/.test(name)
) {
  console.error('Container name must be PascalCase, start with a letter, and end in "Container"');
  process.exit(1);
}


const containerTemplate = `\
import {
  compose,
}                          from 'recompose';
import ${componentName}             from '../../components/${componentName}';


export default compose()(${componentName});
`;


const indexTemplate = `\
import ${name} from './${nameCamelCase}';

export default ${name};
`;


fs.mkdir(`${__dirname}/app/containers/${name}`, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  fs.writeFileSync(
    `${__dirname}/app/containers/${name}/${nameCamelCase}.jsx`,
    containerTemplate
  );

  fs.writeFileSync(
    `${__dirname}/app/containers/${name}/index.js`,
    indexTemplate
  );
});
