const config = require('../config.js');
const graphql = require('graphql-request');
const f = require('../functions.js');

function getDliveChest (displayName) {
    return (graphql.request(
        config.DLiveURL,
        `query{
            userByDisplayName(displayname:"${displayName}") {
                treasureChest {
                    value
                }
            }
        }`
    ));
}

module.exports = {
    dliveChestAPI: (req, res) => {
        if (req.query.user) {
            getDliveChest(req.query.user).then((data) => {
                let lino = data.userByDisplayName.treasureChest.value/100000;
                res.send({
                    lino: lino,
                    text: f.shortenNumber(lino, true)
                });
            }).catch((err) => {
                console.log(err);
            });
        } else {
            res.status(404).send("User parameter not found");
        }
    },
    dliveChestWidget: (req, res) => {
        if (req.query.user) {
            res.send(f.htmlPage(
                `<script>
                    const ratio = ${req.query.ratio || "0.8"};
                    var size;
                    function updateSize() {
                        size = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
                    }

                    function windowResized () {
                        updateSize();
                        let chestS = document.getElementById("chest-img").style;
                        chestS.width = size*ratio + "px";
                        chestS.height = size*ratio + "px";
                        document.getElementById("lino").style["line-height"] = size*(1-ratio) + "px";
                        document.getElementById("mainDiv").style.width = size + "px";
                        let linoDivS = document.getElementById("linoDiv").style;
                        let bR = ${req.query.borderRadius || "0.2"};
                        linoDivS.width = size + "px";
                        linoDivS["border-radius"] = bR*size*(1-ratio) + "px";
                        updateChest();
                    }

                    function updateChest () {
                        updateSize();
                        fetch("/api/dliveChest?user=${req.query.user}").then((response) => {
                            response.json().then((data) => {
                                let linoElem = document.getElementById("lino");
                                let text = data.text + " Lino";
                                linoElem.innerText = text;
                                let matchWidth = size/(text.length/(279.273/153.52));
                                let matchHeight = size*(1-ratio)*0.8/(0.872799401)
                                linoElem.style["font-size"] = (matchWidth < matchHeight ? matchWidth : matchHeight)-1 + "px";
                            });
                        });
                    }

                    function load () {
                        windowResized();
                        window.addEventListener('resize', windowResized);
                        setInterval(updateChest, 60000);
                    }
                </script>`,
                `<div id="mainDiv" style="text-align: center;">
                    <img src="/resources/dlive-chest.png" id="chest-img"/>
                    <div id="linoDiv" style="text-align: center; border-radius: 0px; background-color: ${req.query.bgColor || "#FFD300"}">
                        <span id="lino" style="color: ${req.query.textColor || "black"}; font-family: monospace;">-1</lino>
                    </div>
                </div>`,
                ``,
                `style="margin: 0;" onload="load()"`
            ));
        } else {
            res.status(404).send("User parameter not found");
        }
    }
}