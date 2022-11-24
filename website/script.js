let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let maxZoom = 64;
let minZoom = 2;
let currentzoom = 1;
const palette = [0, 85, 170, 255];
const url = "http://10.212.205.152:6942";
let place = new Array(256);

canvas.width = 256
canvas.height = 256

getPlace();

function getPlace(){
    fetch(url + "/place")
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
    fetch(url + "/set/" + x + "/" + y + "/" + r + "/" + g + "/" + b)
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
    setPixel(x, y, 0, 0, 0);
});