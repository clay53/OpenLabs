const graphql = require('graphql-request');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

function htmlPage(header, body, headerOptions, bodyOptions) {
    return `<html><head ${headerOptions}>${header}</head><body ${bodyOptions}>${body}</body></html>`;
}

function getFollowers(displayName) {
    return (graphql.request(
        'https://graphigo.prd.dlive.tv/',
        `query{
            userByDisplayName(displayname:"${displayName}") {
                followers {
                    totalCount
                }
            }
        }`
    ));
}

app.get('/api/followers', (req, res) => {
    if (req.query.user) {
        getFollowers(req.query.user).then((data) => {
            res.send({count: data.userByDisplayName.followers.totalCount});
        }).catch((err) => {
            console.log(err);
        });
    } else {
        res.status(404).send("User parameter not found");
    }
});

app.get('/widgets/followers', (req, res) => {
    if (req.query.user) {
        res.send(htmlPage(
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
                            let text = (data.count < 1000 ?
                                data.count.toString() :
                                (data.count < 10000 ?
                                    (data.count/1000).toFixed(2) + "k" :
                                    (data.count < 100000 ?
                                        (data.count/10000).toFixed(1) + "k" :
                                        (data.count < 1000000 ?
                                            Math.floor(data.count/1000) + "k" :
                                            "err"
                                        )
                                    )
                                )
                            );
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
            `<div id="followersContainer" style="border-radius: ${req.query.borderRadius || "50%"}; background-color: ${req.query.bgColor || "#F8BF00"}; text-align: center">
                <span id="followers" style="color: ${req.query.textColor || "white"}; font-family: monospace;">0</span>
            </div>`,
            "",
            `onLoad="load()" style="margin: 0px"`
        ))
    } else {
        res.status(404).send("User parameter not found");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});