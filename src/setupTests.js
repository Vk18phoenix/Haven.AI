// src/setupTests.js
import '@testing-library/jest-dom';
import 'web-streams-polyfill';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.Blob = require('buffer').Blob;
global.File = require('buffer').File;