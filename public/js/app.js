//Get canvas and context
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

//Get color picker
let redRange = document.getElementById("red");
let greenRange = document.getElementById("green");
let blueRange = document.getElementById("blue");
let currentColor = document.getElementById("current-color");

//Get place picker
let placeOptions = document.getElementById("place-options");

//Zoom
const maxZoom = 64;
const minZoom = 2;
let currentzoom = 1;

//6bit color palette 4x4x4
const palette = [0, 64, 128, 255];

//Socket.IO
const url = "http://localhost:6942/";
var socket = io(url);

//Places infos
let place = new Array(256);
let placesName = [];
let currentPlaceName;

let oldHighlight = {x: 0, y: 0};

//Set canvas size
canvas.width = 256
canvas.height = 256

//Ask places names to server
socket.emit("places");

//Get places names from server
socket.on("places", (data) => {
    placesName = data;
    for(let i = 0; i < placesName.length; i++){
        let option = document.createElement("option");
        option.value = i.toString();
        option.text = placesName[i];
        placeOptions.appendChild(option);
    }
    //Ask place string to server
    socket.emit("place", placesName[0]);
    currentPlaceName = placesName[0];
});

//Get place string from server and draw it
socket.on("place", (data) => {
    let index = 0;
    for(let i = 0; i < 256; i++){
        place[i] = new Array(256);
        for(let j = 0; j < 256; j++){
            place[i][j] = new Array(3);
            for(let k = 0; k < 3; k++){
                place[i][j][k] = data[index];
                index++;
            }
            ctx.fillStyle = "rgb(" + palette[place[i][j][0]] + "," + palette[place[i][j][1]] + ", " + palette[place[i][j][2]] + ")";
            ctx.fillRect(i, j, 1, 1);
        }
    }
});

//Get pixel update from server and draw it
socket.on("setpixel", (placeName, x, y, r, g, b) => {
    if(placeName == currentPlaceName){
        ctx.fillStyle = "rgb(" + palette[r] + "," + palette[g] + ", " + palette[b] + ")";
        ctx.fillRect(x, y, 1, 1);
        place[x][y][0] = r;
        place[x][y][1] = g;
        place[x][y][2] = b;
    }
});

//Update current color on color picker change
function updateColor(){
    let r = palette[redRange.value];
    let g = palette[greenRange.value];
    let b = palette[blueRange.value];
    currentColor.style.backgroundColor = "rgb(" + r + "," + g + ", " + b + ")";
}

//Update current place on place picker change
function updatePlace(){
    currentPlaceName = placesName[placeOptions.value];
    //Ask place string to server
    socket.emit("place", currentPlaceName);
}

//Zoom controler
canvas.addEventListener('wheel', (e) => {
    var width = canvas.offsetWidth;
    var height = canvas.offsetHeight;
    var x = e.offsetX;
    var y = e.offsetY;
    var xpercent = (x*100/width);
    var ypercent = (y*100/height);
    currentzoom = e.wheelDelta > 0 ? currentzoom * 2 : currentzoom / 2;
    currentzoom = Math.min(Math.max(currentzoom, minZoom), maxZoom);
    canvas.style.transform = "scale("+currentzoom+")";
    canvas.style.transformOrigin = xpercent + "% "+ ypercent +"%";
});

//Get pixel position on click
canvas.addEventListener('mousedown', (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / currentzoom);
    let y = Math.floor((e.clientY - rect.top) / currentzoom);
    //Send pixel update to server
    socket.emit("setpixel", currentPlaceName, x, y, redRange.value, greenRange.value, blueRange.value);
});

//Highlight pixel on mouse move
canvas.addEventListener('mousemove', (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / currentzoom);
    let y = Math.floor((e.clientY - rect.top) / currentzoom);
    if((x != oldHighlight.x || y != oldHighlight.y)){
        if(place[oldHighlight.x] != undefined && place[oldHighlight.x][oldHighlight.y] != undefined){
            let color = place[oldHighlight.x][oldHighlight.y];
            ctx.fillStyle = "rgb(" + palette[color[0]] + "," + palette[color[1]] + ", " + palette[color[2]] + ")";
            ctx.fillRect(oldHighlight.x, oldHighlight.y, 1, 1);
            ctx.fillStyle = "rgb(" + palette[redRange.value] + "," + palette[greenRange.value] + ", " + palette[blueRange.value] + ")";
            ctx.fillRect(x, y, 1, 1);
            oldHighlight.x = x;
            oldHighlight.y = y;
        }
    }
});
