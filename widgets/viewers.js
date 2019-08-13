const config = require('../config.js');
const graphql = require('graphql-request');
const f = require('../functions.js');

function getViewers (displayName) {
    return (graphql.request(
        config.DLiveURL,
        `query{
            userByDisplayName(displayname:"${displayName}") {
                livestream {
                    watchingCount
                }
            }
        }`
    ));
}

module.exports = {
    viewersAPI: (req, res) => {
        if (req.query.user) {
            getViewers(req.query.user).then((data) => {
                let count = data.userByDisplayName.livestream.watchingCount;
                res.send({
                    count: count,
                    text: f.shortenNumber(count)
                })
            }).catch((err) => {
                res.send({
                    count: 0,
                    text: "Offline"
                })
            });
        } else {
            res.status(404).send("User parameter not found");
        }
    },
    viewersWidget: (req, res) => {
        if (req.query.user) {
            res.send(f.htmlPage(
               `<script>
                    var size;
                    function updateSize() {
                        size = window.innerWidth/2 < window.innerHeight ? window.innerWidth/2 : window.innerHeight;
                    }
                    
                    function windowResized () {
                        updateSize();
                        let logoS = document.getElementById("logo").style;
                        logoS.width = size + "px";
                        logoS.height = size + "px";
                        document.getElementById("viewers").style["line-height"] = size + "px";
                        updateViewers();
                    }
    
                    function updateViewers () {
                        updateSize();
                        fetch("/api/viewers?user=${req.query.user}").then((response) => {
                            response.json().then((data) => {
                                console.log(data);
                                let viewersElem = document.getElementById("viewers");
                                let text = data.text;
                                viewersElem.innerText = text;
                                let matchWidth = size/(text.length/(279.273/153.52));
                                let matchHeight = size/(0.872799401)
                                viewersElem.style["font-size"] = (matchWidth < matchHeight ? matchWidth : matchHeight)-1 + "px";
                            });
                        });
                    }
    
                    function load () {
                        windowResized();
                        window.addEventListener('resize', windowResized);
                        setInterval(updateViewers, 10000);
                    }
               </script>`,
               `<div style="text-align: center;">
                    <img id="logo" src="/resources/dlive-icon.png" style="float: left;"/><span id="viewers" style="color: ${req.query.textColor || "#F8BF00"}; font-family: monospace; text-shadow: 4px 4px 32px black;">20</span>
               </div>`,
               "",
               `onload="load()" style="margin: 0;"`
            ));
        } else {
            res.status(404).send("User parameter not found");
        }
    }
}