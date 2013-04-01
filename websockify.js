// A WebSocket to TCP socket proxy
// Copyright 2012 Joel Martin
// Licensed under LGPL version 3 (see docs/LICENSE.LGPL-3)

// Known to work with node 0.8.9
// Requires node modules: ws, optimist and policyfile
//     npm install ws optimist policyfile
//
// NOTE: 
// This version requires a patched version of einaros/ws that supports
// subprotocol negotiation. You can use the patched version like this:
// 
//     cd websockify/other
//     git clone https://github.com/kanaka/ws
//     npm link ./ws

var vncConnection = require('./vncController');

var WebSocketServer = require('ws').Server,
    sessionStore, express, wsServer, target_host, target_port;

var targets = {};

authSocket = function(socket){
    var reqCookie = socket.upgradeReq.headers.cookie;   // TRY TO LOOK FOR HANDSHAKE INSTEAD
    var parsedCookie = require('cookie').parse(reqCookie);
    var signedCookie = require('connect').utils.parseSignedCookies(parsedCookie,'monkey');
    var json = JSON.parse(signedCookie['connect.sess'].slice(2));
    var user = json['user'];
    console.log(user);
    // sessionStore.get(json, function(err, session) {console.log(session);
    //     if (err || !session) console.log('websockify: no found session.', false);
    //     socket.session = session;
    //     if (socket.session.user) {
    //       console.log(null, true);
    //     } else {
    //       console.log('websockify: no found session.user', false);
    //     }
    // });
    // if(memoryStore contains this sessionId)
    return true;
};

// Handle new WebSocket client
new_client = function(client) {
    var path = client.upgradeReq.url;
    var clientAddr = client._socket.remoteAddress,
        log;
    log = function(msg) {
        console.log(' ' + clientAddr + ': ' + msg);
    };
    console.log('WebSocket connection');
    console.log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);

    if (authSocket(client)) {
        target_port = "5901";
        target_host = "10.0.2.136";

        // All available vms
        VMs = {
            "user1-vm1":"10.0.2.166",
            "user1-vm2":"10.0.2.136",
            "user1-vm3":"10.0.2.165",
            "user2-vm1":"10.0.2.174",
            "user2-vm2":"10.0.2.173",
            "user2-vm3":"10.0.2.175",
            "user3-vm1":"10.0.2.167",
            "user3-vm2":"10.0.2.169",
            "user3-vm3":"10.0.2.168",
            "user4-vm1":"10.0.2.171",
            "user4-vm2":"10.0.2.170",
            "user4-vm3":"10.0.2.172"
        };

        target_host = VMs[path.substring(1)];
        if(!target_host)
            target_host = VMs["user4-vm3"];
        targets[client] = new vncConnection(client, target_port, target_host).target;
    }
    else
        client.close();

    client.on('close', function(code, reason) {
        console.log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
        if(targets[client]){
            console.log(targets);
            targets[client].end();
            delete targets[client];
            console.log(targets);
        }
    });
    client.on('error', function(a) {
        console.log('WebSocket client error: ' + a);
        if(targets[client]){
            console.log(targets);
            targets[client].end();
            delete targets[client];
            console.log(targets);
        }
    });
};

// Select 'binary' or 'base64' subprotocol, preferring 'binary'
selectProtocol = function(protocols, callback) {
    var plist = protocols ? protocols.split(',') : "";
    plist = protocols.split(',');
    if (plist.indexOf('binary') >= 0) {
        callback(true, 'binary');
    } else if (plist.indexOf('base64') >= 0) {
        callback(true, 'base64');
    } else {
        console.log("Client must support 'binary' or 'base64' protocol");
        callback(false);
    }
};

var Class = function(web) {
    sessionStore = web.sessionStore;
    wsServer = new WebSocketServer({
        server: web.server,
        // port:web,
        handleProtocols: selectProtocol
    });
    wsServer.on('connection', new_client);
    this.server = wsServer;
};

// exports
module.exports = Class;