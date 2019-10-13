## network.js

This is a simple Ajax and SignalR networking wrapper that simplifies server-client communication in lightweight web applications.

_Note:_ This library requires ASP.NET *Core* SignalR and jQuery

### Importing

#### CDN

In your .html file, add this to your `<head>` tag
```html
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/aspnet-signalr/1.1.4/signalr.min.js"></script>
<script src="https://raw.githubusercontent.com/itsmistad/network.js/master/network.js"></script>
```

### Usage

#### SignalR

Initialize a connection to your hub:
`network.init([hub path string])`
```js
network.init('/route/to/hub/');
```

Register any expected events:
`network.on([event], [action callback)`
```js
network.on('eventName', obj => {
    var result = JSON.stringify(obj);
    console.log(result);
});
```

Start the connection to your hub:
`network.connect([action callback])`
```js
network.connect(err => {
    if (err) console.error(err);
});
```

Invoke the event on your server's hub:
`network.send([event], [json object], [error callback])`
```js
network.send('eventName', obj, err => {
    console.error(err);
});
```

#### Ajax (POST/GET)

Submit a POST request: 
`network.post([path], [payload], [action callback])`
```js
network.post('/route/to/method', obj, response => {
    var result = JSON.stringify(response);
    console.log(result);
});
```

Submit a GET request: 
`network.get([path], [optional payload], [action callback])`
```js
network.get('/route/to/method', obj, response => {
    var result = JSON.stringify(response);
    console.log(result);
});
```