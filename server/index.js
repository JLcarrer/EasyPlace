const express = require('express');
const app = express();
const port = 6942;
const mode = "white";

var places = {};

app.get('/places', (req, res) => {
    let ret = "";
    res.header("Access-Control-Allow-Origin", "*");
    for (const [key, value] of Object.entries(places)) {
        ret += value.name + ",";
    }
    ret = ret.slice(0, -1);
    res.send(ret);
});

app.get('/:place', (req, res) => {
    console.log("User try connected to " + req.params.place + " : " + req.headers.host + " " + req.headers['user-agent']);
    res.header("Access-Control-Allow-Origin", "*");
    if (req.params.place in places) {
        res.send(places[req.params.place].strPlace);
    } else {
        res.send("KO");
    }
});

app.get('/:place/set/:x/:y/:r/:g/:b', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    if (req.params.place in places) {
        let x = parseInt(req.params.x);
        let y = parseInt(req.params.y);
        let r = parseInt(req.params.r);
        let g = parseInt(req.params.g);
        let b = parseInt(req.params.b);
        console.log("New pixel: (" + x + ", " + y + "), (" + r + ", " + g + ", " + b +")");
        places[req.params.place].setPixel(x, y, r, g, b);
        res.send("OK");
    } else {
        res.send("KO");
    }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

class Place{
    constructor(name, width, mode){
        this.name = name;
        this.width = width;
        this.mode = mode
        this.generatePlace();
    }

    generatePlace(){
        var place = new Array(256);
        for(let i = 0; i < 256; i++){
            place[i] = new Array(256);
            for(let j = 0; j < 256; j++){
                place[i][j] = new Array(3);
                if(this.mode == "random"){
                    place[i][j][0] = Math.floor(Math.random() * 4);
                    place[i][j][1] = Math.floor(Math.random() * 4);
                    place[i][j][2] = Math.floor(Math.random() * 4);
                } else if (this.mode == "palette") {
                    place[i][j][0] = Math.floor(i / 64);
                    place[i][j][1] = Math.floor(j / 64);
                    place[i][j][2] = Math.floor(i / 16) % 4;
                } else if (this.mode == "white") {
                    place[i][j][0] = 3;
                    place[i][j][1] = 3;
                    place[i][j][2] = 3;
                }
            }
        }
        this.place = place;
    }

    get strPlace(){
        var str = "";
    
        for(let i = 0; i < 256; i++){
            for(let j = 0; j < 256; j++){
                for(let k = 0; k < 3; k++){
                    str += this.place[i][j][k];
                }
            }
        }
    
        return str;
    }

    setPixel(x, y, r, g, b){
        this.place[x][y][0] = r;
        this.place[x][y][1] = g;
        this.place[x][y][2] = b;
    }
}

places["white"] = new Place("white", 256, "white")
places["random"] = new Place("random", 256, "random");
places["palette"] = new Place("palette", 256, "palette");