const express = require('express');
const app = express();
const port = 6942;
const random = false;

var place = new Array(256);

generateRandom();

function generateRandom(){
    for(let i = 0; i < 256; i++){
        place[i] = new Array(256);
        for(let j = 0; j < 256; j++){
            place[i][j] = new Array(3);
            if(random){
                place[i][j][0] = Math.floor(Math.random() * 4);
                place[i][j][1] = Math.floor(Math.random() * 4);
                place[i][j][2] = Math.floor(Math.random() * 4);
            } else {
                place[i][j][0] = Math.floor(i / 64);
                place[i][j][1] = Math.floor(j / 64);
                place[i][j][2] = Math.floor(i / 16) % 4;
            }
        }
    }
}

function parsePlace(){
    var str = "";

    for(let i = 0; i < 256; i++){
        for(let j = 0; j < 256; j++){
            for(let k = 0; k < 3; k++){
                str += place[i][j][k];
            }
        }
    }

    return str;
}

app.get('/place', (req, res) => {
    console.log("New user connected : " + req.headers.host + " " + req.headers['user-agent']);
    res.header("Access-Control-Allow-Origin", "*");
    res.send(parsePlace());
});

app.get('/set/:x/:y/:r/:g/:b', (req, res) => {
    let x = parseInt(req.params.x);
    let y = parseInt(req.params.y);
    let r = parseInt(req.params.r);
    let g = parseInt(req.params.g);
    let b = parseInt(req.params.b);
    console.log("New pixel: (" + x + ", " + y + "), (" + r + ", " + g + ", " + b +")");
    res.header("Access-Control-Allow-Origin", "*");
    place[x][y][0] = r;
    place[x][y][1] = g;
    place[x][y][2] = b;
    res.send("OK");
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
