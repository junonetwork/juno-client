/* eslint-disable import/no-extraneous-dependencies */
const Bundler = require('parcel-bundler');
const express = require('express');
const proxy = require('http-proxy-middleware');

const bundler = new Bundler('app/index.html');
const app = express();

app.use(
  '/api',
  proxy({
    target: 'http://localhost',
  })
);

app.use(bundler.middleware());

app.listen(parseInt(process.env.PORT, 10) || 4000);
