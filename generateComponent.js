const fs = require('fs');

const name = process.argv[2];
const nameCamelCase = name.replace(/^[A-Z]/, l => l.toLowerCase());
const nameSnakeCase = name.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`).replace(/^-/, '');

if (!name) {
  console.error('Missing component name as first and only command argument');
  process.exit(1);
} else if (name[0].charCodeAt() < 65 || name[0].charCodeAt() > 90) {
  console.error('Component name must be PascalCase and start with a letter');
  process.exit(1);
}


const componentTemplate = `\
import React                   from 'react';
import {}                      from 'prop-types';
import                              './style.scss';


const ${name} = () => (
  <div
    className="${nameSnakeCase}"
  >
  </div>
);


${name}.propTypes = {};

export default ${name};
`;


const indexTemplate = `\
import ${name} from './${nameCamelCase}';

export default ${name};
`;


const styleTemplate = `\
.${nameSnakeCase} {

}
`;


fs.mkdir(`${__dirname}/app/components/${name}`, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  fs.writeFileSync(
    `${__dirname}/app/components/${name}/${nameCamelCase}.jsx`,
    componentTemplate
  );

  fs.writeFileSync(
    `${__dirname}/app/components/${name}/index.js`,
    indexTemplate
  );

  fs.writeFileSync(
    `${__dirname}/app/components/${name}/style.scss`,
    styleTemplate
  );
});
