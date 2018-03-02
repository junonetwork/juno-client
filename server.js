/* eslint-disable import/no-extraneous-dependencies */
const Bundler = require('parcel-bundler');
const express = require('express');
const proxy = require('http-proxy-middleware');

const bundler = new Bundler('app/index.html');
const app = express();

const PORT = process.env.PORT || 4000;
const DEV_PROXY = process.env.DEV_PROXY || '';

app.use(
  '/api',
  proxy({
    target: `http://localhost:${DEV_PROXY}`,
  })
);

app.use(bundler.middleware());

app.listen(PORT);
