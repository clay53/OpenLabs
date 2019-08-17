const config = require('../config.js');
const graphql = require('graphql-request');
const f = require('../functions.js');

function getFollowers (displayName) {
    return (graphql.request(
        config.DLiveURL,
        `query{
            userByDisplayName(displayname:"${displayName}") {
                followers {
                    totalCount
                }
            }
        }`
    ));
}

module.exports = {
    followersAPI: (req, res) => {
        if (req.query.user) {
            getFollowers(req.query.user).then((data) => {
                let count = data.userByDisplayName.followers.totalCount
                res.send({
                    count: count,
                    text: f.shortenNumber(count)
                });
            }).catch((err) => {
                console.log(err);
            });
        } else {
            res.status(404).send("User parameter not found");
        }
    },
    followersWidget: (req, res) => {
        if (req.query.user) {
            res.send(f.htmlPage(
                `<script>
                    function updateContainer () {
                        let containerS = document.getElementById("followersContainer").style;
                        let size = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) + "px";
                        containerS.width = size;
                        containerS.height = size;
                        
                        document.getElementById("followers").style["line-height"] = size;
                    }
    
                    function updateFollowers () {
                        fetch("/api/followers?user=${req.query.user}").then((response) => {
                            response.json().then((data) => {
                                let followersElem = document.getElementById("followers");
                                let text = data.text;
                                followersElem.innerText = text;
                                followersElem.style["font-size"] = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight)/(text.length/1.5) + "px";
                            })
                        });
                    }
    
                    function load () {
                        console.log("loading");
    
                        updateContainer();
                        window.addEventListener('resize', updateContainer);
    
                        updateFollowers();
                        setInterval(updateFollowers, 5000);
                    }
                </script>`,
                `<div id="followersContainer" style="border-radius: ${req.query.borderRadius || "50%"}; background-color: ${req.query.bgColor || "#FFD300"}; text-align: center">
                    <span id="followers" style="color: ${req.query.textColor || "white"}; font-family: monospace;">0</span>
                </div>`,
                "",
                `onLoad="load()" style="margin: 0px"`
            ))
        } else {
            res.status(404).send("User parameter not found");
        }
    }
}