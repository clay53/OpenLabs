const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

const f = require('./functions.js');

app.get('/resources/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});

// Widgets/APIs

const followers = require('./widgets/followers.js');
app.get('/api/followers', followers.followersAPI);
app.get('/widgets/followers', followers.followersWidget);

const viewers = require('./widgets/viewers.js');
app.get('/api/viewers', viewers.viewersAPI);
app.get('/widgets/viewers', viewers.viewersWidget);

const dliveChest = require('./widgets/dliveChest.js');
app.get('/api/dliveChest', dliveChest.dliveChestAPI);
app.get('/widgets/dliveChest', dliveChest.dliveChestWidget);

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});