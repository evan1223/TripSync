import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

global.ReadableStream = require('stream/web').ReadableStream;

const { MessagePort, MessageChannel } = require('worker_threads');
(global as any).MessagePort = MessagePort;
(global as any).MessageChannel = MessageChannel;

import { Request, Response, Headers, fetch } from 'undici';

global.Request = Request as any;
global.Response = Response as any;
global.Headers = Headers as any;
global.fetch = fetch as any;
