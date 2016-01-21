'use strict';

var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
self.postMessage('hello');
self.postMessage({ isworker: ENVIRONMENT_IS_WORKER });
self.postMessage(typeof window);
