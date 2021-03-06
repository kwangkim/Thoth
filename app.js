console.log('    o  +           +        +');
console.log('+        o     o       +        o');
console.log('-_-_-_-_-_-_-_,-----------------,      o ');
console.log('_-_-_-_-_-_-_-| STARTING... /\\_/\\  ');
console.log('-_-_-_-_-_-_-~|____________( ^ .^)  +     +  ');
console.log('_-_-_-_-_-_-_-""            ""      ');
console.log('+      o         o   +       o');
console.log('    +         +');
console.log('o        o         o      o     +\n');

/*
@================================================================================
@= MAIN APP
@================================================================================
*/
// db = require('./db/db').db();

// Custom Modules
var conf   = require('./config');
var httpServer = require('./webserver');
var vncWsServer = require('./websockify');
var rtcServer = require('./rtcserver');

// launch web server
var webServer = new httpServer(conf.PORTS.WEBSERVER);

// Launch vnc websocket server
var wsServer = new vncWsServer(webServer);	// upgrade http to websocket

// Launch webRTC
rtcServer.listen(conf.PORTS.WEBRTC);