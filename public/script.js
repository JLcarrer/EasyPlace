let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let redRange = document.getElementById("red");
let greenRange = document.getElementById("green");
let blueRange = document.getElementById("blue");
let currentColor = document.getElementById("current-color");
let placeOptions = document.getElementById("place-options");
let maxZoom = 64;
let minZoom = 2;
let currentzoom = 1;
const palette = [0, 64, 128, 255];
const url = "http://192.168.247.83:6942/";
let place = new Array(256);
let places = [];
let currentPlace;

canvas.width = 256
canvas.height = 256

getPlaces();

function getPlaces(){
    fetch(url + "places")
    .then(res => res.text())
    .then(text => {
        places = text.split(",");
        for(let i = 0; i < places.length; i++){
            let option = document.createElement("option");
            option.value = i.toString();
            option.text = places[i];
            placeOptions.appendChild(option);
        }
    })
    .then(() => {
        getPlace(places[0]);
        currentPlace = places[0];
    });
}

function getPlace(name){
    fetch(url + name)
    .then(res => res.text())
    .then(text => {
        let index = 0;
        for(let i = 0; i < 256; i++){
            place[i] = new Array(256);
            for(let j = 0; j < 256; j++){
                place[i][j] = new Array(3);
                for(let k = 0; k < 3; k++){
                    place[i][j][k] = text[index];
                    index++;
                }
                ctx.fillStyle = "rgb(" + palette[place[i][j][0]] + "," + palette[place[i][j][1]] + ", " + palette[place[i][j][2]] + ")";
                ctx.fillRect(i, j, 1, 1);
            }
        }
    });
}

function setPixel(x, y, r, g, b){
    fetch(url + currentPlace + "/set/" + x + "/" + y + "/" + r + "/" + g + "/" + b)
    .then(res => res.text())
    .then(text => {
        console.log(text);
        if(text == "OK"){
            ctx.fillStyle = "rgb(" + palette[r] + "," + palette[g] + ", " + palette[b] + ")";
            ctx.fillRect(x, y, 1, 1);
            place[x][y][0] = r;
            place[x][y][1] = g;
            place[x][y][2] = b;
        }
    });
}

function updateColor(){
    let r = palette[redRange.value];
    let g = palette[greenRange.value];
    let b = palette[blueRange.value];
    currentColor.style.backgroundColor = "rgb(" + r + "," + g + ", " + b + ")";
}

function updatePlace(){
    currentPlace = places[placeOptions.value];
    getPlace(currentPlace);
}

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

canvas.addEventListener('mousedown', (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / currentzoom);
    let y = Math.floor((e.clientY - rect.top) / currentzoom);
    setPixel(x, y, redRange.value, greenRange.value, blueRange.value);
});
