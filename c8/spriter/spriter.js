var fs = require('fs'),
    Canvas = require('canvas');


function spriter() {
    var canvas = new Canvas(200, 200);
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#CCC";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = "#fff";
    ctx.fillRect(50, 50, 100, 100);
    fs.writeFileSync("./sprites.png", canvas.toBuffer());

}
//make the sprite method availale
module.exprotes=spriter;
