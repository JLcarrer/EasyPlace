const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {cors: {origin: '*'}});

const socketPort = 6942;
const expressPort = 8080;

var places = {};

//User instance for each socket
io.on('connection', (socket) => {
    console.log('a user connected');

    //Send places names to user
    socket.on('places', () => {
        console.log("User ask places");
        let ret = [];
        let i = 0;
        for (const [key, value] of Object.entries(places)) {
            ret[i] = key;
            i++;
        }
        console.log(ret);
        socket.emit('places', ret);
    });

    //Send place string to user
    socket.on('place', (place) => {
        console.log("User ask place " + place);
        if (place in places) {
            socket.emit('place', places[place].strPlace);
        } else {
            socket.emit('place', "KO");
        }
    });

    //Set pixel in place array and send the update to all users
    socket.on('setpixel', (place, x, y, r, g, b) => {
        places[place].setPixel(x, y, r, g, b);
        io.emit('setpixel', place, x, y, r, g, b);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

//Return index.html and other files in public folder
app.use(express.static('public'));

//Listen to the ports
app.listen(expressPort, () => console.log(`Express listening on port ${expressPort}!`));
server.listen(socketPort, () => console.log(`SocketIO listening on port ${socketPort}!`));

class Place{
    constructor(name, width, mode){
        this.name = name;
        this.width = width;
        this.mode = mode
        this.generatePlace();
    }

    //Generate and fill place array for testing
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
                } else if (this.mode == "noise") {
                    let noise = Math.floor((Math.sin(i / 16)) + (Math.sin(j / 16)) + 2);
                    place[i][j][0] = noise;
                    place[i][j][1] = noise;
                    place[i][j][2] = noise;
                }
            }
        }
        this.place = place;
    }

    //Generate place string for sending to user
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

    //Edit pixel in place array
    setPixel(x, y, r, g, b){
        this.place[x][y][0] = r;
        this.place[x][y][1] = g;
        this.place[x][y][2] = b;
    }
}

places["white"] = new Place("white", 256, "white")
places["random"] = new Place("random", 256, "random");
places["palette"] = new Place("palette", 256, "palette");
places["noise"] = new Place("noise", 256, "noise");