'use strict';

/* 
 * This library is a wrapper around SignalR and ajax.
 * Warning: SignalR is NOT delivered with this file. You will need to import it as a script before this one in your html.
 * 
 * Usage for SignalR: (in order)
 *  - network.init('/route/to/hub/'); // <-- Once
 *  - network.on('eventName', json => { console.log(JSON.stringify(json)); }); // <-- n times, except duplicates
 *  - network.connect(err => { if (err) console.error(err); }); // <-- Once
 *  - network.send('eventName', json, err => { console.error(err); }); // <-- n times, including duplicates
 *  
 *  Usage for ajax:
 *  - network.post('/route/to/method', json, json => { console.log(JSON.stringify(json)); });
 *  - network.get('/route/to/method', json, json => { console.log(JSON.stringify(json)); });
 * 
 *  To enable debug messaging, set network.debug to true.
 *  "json" is a json object, not a string.
 */

var network = new function() {
    var obj = {};
    var connection, connected, queue;
    var log = m => obj.debug ? console.log(m) : {};
    var logErr = e => obj.debug ? console.error(e) : {};

    obj.debug = false;

    obj.init = route => {
        if (!connection && signalR)
            connection = new signalR.HubConnectionBuilder().withUrl(`${window.location.origin}${route}`).build();
    };

    obj.on = (event, func) => {
        if (connection)
            connection.on(event, json => {
                log(`Received ${event}: ${JSON.stringify(json)}`);
                func(json);
            });
    };

    obj.connect = func => {
        if (connected) return; // Prevents connection duplication.
        log('Connecting...');
        if (connection)
            connection.start().then(() => {
                log('Connected successfully!');
                connected = true;
                func();
                if (queue) {
                    for (let i = 0; i < queue.length; i++) {
                        let queueParams = queue.shift();
                        obj.send(queueParams.event, queueParams.json, queueParams.errCallback);
                    }
                    queue = null;
                }
            }).catch(err => {
                logErr(err.toString());
                func(err.toString());
            });
    };

    obj.send = (event, json, errCallback) => {
        if (!connected) { // Allows queueing while a connection is being established.
            if (!queue) queue = [];
            queue.push({
                event, json, errCallback
            });
            return;
        }
        var str = JSON.stringify(json);
        log(`Sending ${event}: ${str}`);
        connection.invoke(event, json).catch(err => {
            logErr(err.toString());
            if (errCallback) errCallback(err.toString());
        });
    };

    obj.post = (route, json, func) => {
        $.ajax({
            type: "POST",
            url: route,
            data: JSON.stringify(json),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: response => {
                log(response.toString());
                func(response);
            },
            failure: response => {
                logErr(response.toString());
                func(response);
            },
            error: response => {
                logErr(response.toString());
                func(response);
            }
        });  
    };

    obj.get = (route, json, func) => {
        $.ajax({
            type: "GET",
            url: route,
            data: JSON.stringify(json),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: response => {
                log(response.toString());
                func(response);
            },
            failure: response => {
                logErr(response.toString());
                func(response);
            },
            error: response => {
                logErr(response.toString());
                func(response);
            }
        });
    };

    return obj;
}