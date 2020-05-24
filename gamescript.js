function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Line(x0, y0, x1, y1) {
  this.p0 = new Point(x0, y0);
  this.p1 = new Point(x1, y1);
  this.a = y1 - y0;
  this.b = x0 - x1;
  this.c = y0*(x0-x1) + x0*(y1-y0);
  this.draw = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.p0.x, this.p0.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.stroke();
  }
}

var Scene = {
    lines: [new Line(10, 0, 10, 511),
            new Line(200, 0, 300, 255)],
    draw: function(ctx) {
      for (i=0; i<this.lines.length; i++) {
        this.lines[i].draw(ctx);
      }
    }
}

function startGame() {
  Game.start();
  gameobj = new Xira(10, 10);
}

var pkey = 0;
function logKey(e) {
    pkey = e.code;
}

var Game = {
  canvas: document.createElement("canvas"),
  start: function() {
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    document.addEventListener('keydown', logKey);
    this.interval = setInterval(refresh, 100);
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

function intersect(l0, l1, p) {
    var a0 = 0.0;
    var a1 = 0.0;
    var b0 = 0.0;
    var b1 = 0.0;
    var c0 = 0.0;
    var c1 = 0.0;
    if (l1.a == 0) {
        a0 = 1.0 * l0.a; b0 = 1.0 * l0.b; c0 = 1.0 * l0.c;
        a1 = 1.0 * l1.a; b1 = 1.0 * l1.b; c1 = 1.0 * l1.c;
    } else {
        a0 = 1.0 * l1.a; b0 = 1.0 * l1.b; c0 = 1.0 * l1.c;
        a1 = 1.0 * l0.a; b1 = 1.0 * l0.b; c1 = 1.0 * l0.c;
    }
    //console.log(a0, a1, b0, b1);
    //console.log(l0.a, l1.a, l0.b, l1.b);
    if (a0 * b1 == a1 * b0) {
        p.x = p.y = -1.0;
        //console.log("parallel");
        return;
    }
    if (a1 != 0.0) {
        b1 = b1 - (b0 * a0/a1);
        c1 = c1 - (c0 * a0/a1);
        a1 = 0.0;
    }
    p.y = c1/b1;
    p.x = (c0 - b0*p.y)/a0;
    miny = l0.p0.y; maxy = l0.p1.y;
    if (miny > maxy) miny, maxy = maxy, miny;
    minx = l0.p0.x; maxx = l0.p1.x;
    if (minx > maxx) minx, maxx = maxx, minx;
    if (p.y < miny || p.y > maxy || p.x < minx || p.x > maxx) {
        p.x = p.y = -1;
    }
    return;
}

const lkey = 65;
const dkey = 83;
const rkey = 68;
const ukey = 87;

var Stand = 0;
var Run =   1;
var Jump =  2;
var DoubleJump = 3;

var Right = 0;
var Left = 1;

function Xira(dx, dy) {
  this.dx = dx;
  this.dy = dy;
  this.xspeed = 5;
  this.yspeed = 0;
  this.orient = Right;
  this.img = [new Image(), new Image()];
  this.img[Right].src = "xira_sprite.png";
  this.img[Left].src  = "xira_sprite_flip.png";
  this.action = Run;
  this.astate = 0;
  this.sx = 0;
  this.sy = 0;
  this.sw = 0;
  this.sh = 0;
  this.spritex = [[],  // Stand
                  [1360, 1680, 2000, 2310, 2640, 2960, 3270, 3590],  // Run
                  [],  // Jump
                  []]; // DoubleJump
  this.spritey = [[],  // Stand
                  [18, 18, 18, 18, 18, 18, 18, 18],  // Run
                  [],  // Jump
                  []]; // DoubleJump
  this.spritew = [[],  // Stand
                  [200, 200, 200, 200, 200, 200, 200, 200],  // Run
                  [],  // Jump
                  []]; // DoubleJump
  this.spriteh = [[],  // Stand
                  [300, 300, 300, 300, 300, 300, 300, 300],  // Run
                  [],  // Jump
                  []]; // DoubleJump

  this.draw = function(ctx) {
      ctx.drawImage(this.img[this.orient],
                         this.orient ? 3896 - this.sx : this.sx, this.sy,
                         this.sw, this.sh, this.dx, this.dy, 40, 60);
  }

  this.tick = function(pkey_) {
      if (pkey_ == ukey) {
          console.log('up');
      } else if (pkey_ == dkey) {
          console.log('down');
      } else if (pkey_ == lkey) {
          console.log('left');
      } else if (pkey_ == rkey) {
          console.log('right');
      }

    nextx = this.dx + this.xspeed;
    nexty = this.dy + this.yspeed;
    lLine = new Line(nextx, nexty, nextx, nexty+60);
    rLine = new Line(nextx+40, nexty, nextx+40, nexty+60);
    topLine = new Line(nextx, nexty, nextx+40, nexty);
    botLine = new Line(nextx, nexty, nextx+40, nexty);
    lbound = new Point(nextx, nexty);
    rbound = new Point(nextx + 40, nexty + 60);
    var touching = false;
    var i;
    for (i=0; i<Scene.lines.length; i++) {
        inter = new Point(0, 0);
        intersect(topLine, Scene.lines[i], inter);
        if (inter.x > 0 && inter.y > 0) {
            touching = true;
        }
        intersect(botLine, Scene.lines[i], inter);
        if (inter.x > 0 && inter.y > 0) {
            touching = true;
        }
        intersect(lLine, Scene.lines[i], inter);
        if (inter.x > 0 && inter.y > 0) {
            touching = true;
        }
        intersect(rLine, Scene.lines[i], inter);
        if (inter.x > 0 && inter.y > 0) {
            touching = true;
        }
    }
    if (touching) {
        //console.log("Touching");
        this.xspeed *= -1;
        if (this.orient == Left) {
            this.orient = Right;
        } else {
            this.orient = Left;
        }
    }
    this.astate = (this.astate + 1) % this.spritex[this.action].length;
    this.dx += this.xspeed;
    this.dy += this.yspeed;
    this.sx = this.spritex[this.action][this.astate];
    this.sy = this.spritey[this.action][this.astate];
    this.sw = this.spritew[this.action][this.astate];
    this.sh = this.spriteh[this.action][this.astate];
  }

  this.tick();
}
/*
Stand:
65 15   180, 300
385 18  180, 300
705 17  185, 300

Run:



function GameObj(width, height, colour, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.incr = 1;
  this.img = new Image();
  this.img.src = "xira_sprite.png";

  this.draw = function() {
    ctx = Game.context;
    ctx.drawImage(this.img, 65, 15, 180, 300, this.x, this.y,
                                              36, 60);

    this.x = this.x + this.incr;
  }
}
*/

function refresh() {
    Game.clear();
    gameobj.tick(pkey);
    pkey = 0;
    Scene.draw(Game.context);
    gameobj.draw(Game.context);
}
