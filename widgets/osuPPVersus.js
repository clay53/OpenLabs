const config = require('../config.js');
const f = require('../functions.js');
const fetch = require('node-fetch');

function getOsuUser (name, byName=true) {
    return(fetch(`https://osu.ppy.sh/api/get_user?k=${process.env.OSU_API_KEY}&u=${name}&type=${byName ? 'string' : 'id'}`));
}

module.exports = {
    osuUserPPAPI: function (req, res) {
        getOsuUser(req.query.name).then((user) => {
            user.json().then((data) => {
                res.send({
                    pp: parseFloat(data[0].pp_raw),
                    text: data[0].pp_raw,
                    text_short: f.shortenNumber(data[0].pp_raw)
                });
            })
        }).catch((err) => {
            res.send(err);
        });
    },
    osuPPVersusWidget: function (req, res) {
        res.send(f.htmlPage(
            `
            <style>
                .userContainer {
                    display: inline-block;
                }
                .userContainer span {
                    color: white;
                    font-size: 20px;
                    font-family: monospace;
                }
            </style>
            <script>

            </script>`,
            `<div>
                <div class="userContainer" style="background-color: #5c9d9f;">
                    <span id="user1" style="float: left;">${req.query.user1}</span>
                    <span id="user1Increase" style="float: right;">+0</span>
                </div><div class="userContainer" style="background-color: #dc98a4;">
                    <span id="user2" style="float: left;">${req.query.user2}</span>
                    <span id="user2Increase" style="float: right;">+0</span>
                </div>
            </div>
            <div>
                <span id="user1pp">0</span><span id="ppDiff">-1</span><span id="user2pp">0</span>
            </div>`,
            ``,
            `style="margin: 0;"`
        ));
    }
};