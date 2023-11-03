var canvas = document.querySelector("canvas");
var context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gamepads = {};

function gamepadHandler(event, connected) {
  const gamepad = event.gamepad;
  // Note:
  // gamepad === navigator.getGamepads()[gamepad.index]

  if (connected) {
    gamepads[gamepad.index] = gamepad;
  } else {
    delete gamepads[gamepad.index];
  }
}

window.addEventListener(
  "gamepadconnected",
  (e) => {
    gamepadHandler(e, true);
  },
  false,
);
window.addEventListener(
  "gamepaddisconnected",
  (e) => {
    gamepadHandler(e, false);
  },
  false,
);

var fps = 5;

var mouseX;
var mouseY;
var mouseDown = false;
function xy(e) {
  var boundingBox = canvas.getBoundingClientRect();
  mouseX = e.clientX - boundingBox.left;
  mouseY = e.clientY - boundingBox.top;
}

canvas.addEventListener('mousedown', function() {
  mouseDown = true;
}, false);

canvas.addEventListener('mouseup', function() {
  mouseDown = false;
}, false);

var keys = [];

window.addEventListener('keydown', function(e) {
  if (!keys.includes(e.key)) keys.push(e.key);
  if (e.key == "p") {
    createEnemy(mouseX, mouseY, 10, 10, 0, 50)
  }
}, false);

window.addEventListener('keyup', function(e) {
  if (keys.includes(e.key)) keys.splice(keys.indexOf(e.key), 1);
}, false);

var player = {
  img: document.getElementById("playerimg"),                 //nice
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  dir: 0,
  acceleration: 3/30*fps,
  decceleration: 2/30*fps,
  maxSpeed: 20/30*fps
};

var weapons = {
  blank: {
    name: "Blank",
    weaponimg: document.getElementById("blank"),
    weaponimgreversed: document.getElementById("blank"),
    bulletimg: document.getElementById("blank"),
    bulletDamage: 10,
    baseDamage: 10,
    baseProjectiles: 1,
    baseSpread: Math.PI/30,
    baseRSpread: Math.PI/50,
    baseBulletSpeed: 60/30*fps,
    baseBulletSize: 1,
    baseFirerate: 30/fps*30,
    baseAmmo: 5,
    baseReloadTime: 100/fps*30
  },
  shell: {
    name: "Shell",
    weaponimg: document.getElementById("shellweapon"),
    weaponimgreversed: document.getElementById("shellweapon"),
    bulletimg: document.getElementById("bulletplaceholder"),
    bulletDamage: 10,
    baseDamage: 10,
    baseProjectiles: 5,
    baseSpread: Math.PI/50,
    baseRSpread: Math.PI/35,
    baseBulletSpeed: 60/30*fps,
    baseBulletSize: 1,
    baseFirerate: 15/fps*30,
    baseAmmo: 5,
    baseReloadTime: 40/fps*30
  },
  mathGun: {
    name: "Math Gun",
    weaponimg: document.getElementById("mathgunweapon"),
    weaponimgreversed: document.getElementById("mathgunweaponreversed"),
    bulletimg: document.getElementById("mathgunbullet"),
    bulletDamage: 10,
    baseDamage: 10,
    baseProjectiles: 1,
    baseSpread: Math.PI/10,
    baseRSpread: Math.PI/250,
    baseBulletSpeed: 40/30*fps,
    baseBulletSize: 25,
    baseFirerate: 2/fps*30,
    baseAmmo: 20,
    baseReloadTime: 10/fps*30
  },
  pencil: {
    name: "Mechanical Pencil",
    weaponimg: document.getElementById("mathgunweapon"),
    weaponimgreversed: document.getElementById("mathgunweaponreversed"),
    bulletimg: document.getElementById("mathgunbullet"),
    bulletDamage: 10,
    baseDamage: 10,
    baseProjectiles: 1,
    baseSpread: Math.PI/15,
    baseRSpread: Math.PI/250,
    baseBulletSpeed: 40/30*fps,
    baseBulletSize: 1,
    baseFirerate: 8/fps*30,
    baseAmmo: 4,
    baseReloadTime: 25/fps*30
  }
};

var weapon = weapons.mathGun;

var stats = {
  damageMultiplier: 1,
  speedMultiplier: 1,
  bulletSpeedMultiplier: 1,
  projectiles: 0
}

var tempdir;

var bullets = [];

var enemys = [];

var walls = [];

for (var i = 0; i < 10; i++) {
  createWall(Math.random()*canvas.width-20,Math.random()*canvas.width-20,Math.random()*300,Math.random()*300);
}



var firerateTimer = 0;
var reloadTimer = weapon.baseAmmo;
var reloading = false;

setInterval(function() {
  //white canvas
  context.fillStyle = "white";
  context.fillRect(0,0,canvas.width,canvas.height);

  //draws the player
  context.fillStyle = "darkBlue";
  context.drawImage(player.img, player.x-playerimg.width/2, player.y-playerimg.height/2, playerimg.width, playerimg.height);

  //draws walls
  walls.forEach((item, i) => {
    context.beginPath();
    context.fillStyle = "black";
    context.fillRect(item.x, item.y, item.width, item.height);
    if (player.x > item.x - player.img.width/2 && player.x < item.width + item.x + player.img.width/2 && player.y > item.y - player.img.height/2 && player.y < item.height + item.y + player.img.height/2) {
      if (Math.abs(player.y - item.y - item.height/2) - item.height/2 <= Math.abs(player.x - item.x - item.width/2) - item.width/2) {
        player.x = (player.vx < 0) * item.width + item.x - player.img.width/2 + (player.vx < 0) * player.img.width;
        player.vx = -player.vx/2;
      } else {
        player.y = (player.vy < 0) * item.height + item.y - player.img.height/2 + (player.vy < 0) * player.img.height;
        player.vy = -player.vy/2;
      }
    }
  });
  
  //move enemys
  enemys.forEach((item, i) => {
    item.x += item.vx;
    item.y += item.vy;

    var d = Math.atan((item.x - player.x - player.vx*25 ) / ( item.y - player.y - player.vy*25 ));
    if (player.y + player.vy*25  <= item.y) d += Math.PI;

    item.vx *= 0.7;
    item.vy *= 0.7;

    item.vx += Math.sin(d)*0.5;
    item.vy += Math.cos(d)*0.5;

    context.beginPath();
    context.arc(item.x, item.y, item.size, -d - Math.PI * 0.3, -d + Math.PI * 1.3);
    context.lineTo(item.x, item.y);
    context.closePath();
    context.fillStyle = "red";
    context.fill();

    context.beginPath();
    context.arc(item.x, item.y, item.size+5, -d - Math.PI * (item.health/item.healthMax-0.5), -d + Math.PI * (item.health/item.healthMax+0.5));
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.stroke();
  });

  //move bullets
  bullets.forEach((item, i) => {
    if (weapon.name == "Math Gun") {
      context.beginPath();
      var tempdir = Math.PI/2+Math.atan(item.vx/item.vy);
      if (item.vy < 0) tempdir += Math.PI;

      for(var i2 = -0.6; i2 <= 0.6; i2+=0.05) {
        context.lineTo(item.x+item.vx*i2/fps*30+Math.sin((item.dist/30*fps+i2)*10)*30*Math.sin(tempdir), item.y+item.vy*i2/fps*30+Math.sin((item.dist/30*fps+i2)*10)*30*Math.cos(tempdir));
      }
      context.lineWidth = 1;
      context.strokeStyle = "darkgreen";
      context.stroke();
    } else {     
      context.save();
      context.translate(item.x, item.y);
      context.rotate(Math.PI/2-Math.atan(item.vx/item.vy) + Math.PI*(item.vy < 0));
      if (item.vx >= 0) context.drawImage(item.img, 20, -item.img.height/2, item.img.width, item.img.height);
      else context.drawImage(item.imgreversed, 20, -item.img.height/2, item.img.width, item.img.height);
      context.restore();
      context.drawImage(weapon.bulletimg, -weapon.bulletimg.width/2, -weapon.bulletimg.height/2, weapon.bulletimg.width, weapon.bulletimg.height);
    }
    item.dist++;

    // draws collision radius
    context.beginPath();
    context.arc(item.x, item.y, item.size, 0, Math.PI*2);
    context.stroke();
    
    item.x += item.vx;
    item.y += item.vy;

    enemys.forEach((item2, i2) => {
      if (Math.hypot(item.x - item2.x, item.y - item2.y) <= item.size + item2.size){
        item2.health -= weapon.baseDamage * stats.damageMultiplier;
        context.beginPath();
        context.arc(item2.x, item2.y, item2.size+5, 0, Math.PI*2);
        context.fillStyle = `white`;
        context.fill();
        if (item2.health <= 0) {
          enemys.splice(i2, 1);
          i2--;
        }
        bullets.splice(i, 1); 
        i--;
      }
    })

    if (item.x <= 0 || item.x >= canvas.width || item.y <= 0 || item.y >= canvas.height) {
      bullets.splice(i, 1);
      i--;
    }
  });

  // draw velocity line
  context.beginPath();
  context.moveTo(player.x, player.y);
  context.lineTo(player.x+player.vx*25, player.y+player.vy*25);
  context.stroke();

  if (player.y-mouseY != NaN) player.dir = Math.atan((mouseX-player.x)/(mouseY-player.y));
  if (player.y > mouseY) player.dir += Math.PI;

  //drawing the gun
  context.save();
  context.translate(player.x, player.y);
  context.rotate(Math.PI/2-player.dir);
  if (mouseX >= player.x) context.drawImage(weapon.weaponimg, 20, -weapon.weaponimg.height/2, weapon.weaponimg.width, weapon.weaponimg.height);
  else context.drawImage(weapon.weaponimgreversed, 20, -weapon.weaponimg.height/2, weapon.weaponimg.width, weapon.weaponimg.height);
  context.restore();

  // firing
  if (mouseDown && firerateTimer <= 0 && reloadTimer > 0) {
    reloading = false;
    createBullet(
      weapon.bulletimg,
      weapon.bulletimg,
      player.x + Math.sin(player.dir)*(20 + weapon.weaponimg.width),
      player.y + Math.cos(player.dir)*(20 + weapon.weaponimg.width),
      player.dir,
      weapon.baseBulletSpeed,
      weapon.baseBulletSize,
      weapon.bulletimg.radius,
      weapon.baseProjectiles,
      weapon.baseSpread,
      weapon.baseRSpread
    );
    reloadTimer--;
    if (reloadTimer <= 0) {
      reloadTimer = weapon.baseAmmo;
      firerateTimer = weapon.baseReloadTime;
      reloading = true;
    } else {
      firerateTimer = weapon.baseFirerate;
    }
  } // reload           nice
  else firerateTimer--;
  if (reloading && firerateTimer > 0) {
    context.beginPath();
    context.rect(player.x-30, player.y-25, 60, 4);
    context.fillStyle = "white";
    context.fill();
    context.strokeStyle = "black";
    context.stroke();
    context.beginPath();
    context.rect(player.x+30-60*firerateTimer/weapon.baseReloadTime, player.y-28, 4, 10);
    context.fillStyle = "white";
    context.fill();
    context.strokeStyle = "black";
    context.stroke();
  }


  player.x += player.vx;
  player.y += player.vy;

  if (player.x < 0 || player.x > canvas.width) {
    player.x = (player.x > canvas.width) * canvas.width;
    player.vx = -player.vx;
  }
  if (player.y < 0 || player.y > canvas.height) {
    player.y = (player.y > canvas.height) * canvas.height;
    player.vy = -player.vy;
  }

  var tempdir = Math.atan((keys.includes("d")-keys.includes("a"))/(keys.includes("s")-keys.includes("w")));
  if ((keys.includes("s")-keys.includes("w")) == 0) tempdir = 2*((keys.includes("d")-keys.includes("a"))>0)-1;
  if (keys.includes("w")) tempdir += Math.PI;
  if (keys.includes("d") || keys.includes("a")) player.vx += Math.sin(tempdir)*player.acceleration;
  if (keys.includes("s") || keys.includes("w")) player.vy += Math.cos(tempdir)*player.acceleration;
  
  tempdir = Math.atan(player.vx/player.vy);
  if (player.vy == 0) tempdir = 2*(player.vx > 0)-1;
  if (player.vy < 0) tempdir += Math.PI;

  if (!(keys.includes("d") || keys.includes("a") || keys.includes("s") || keys.includes("w"))) {
    if (Math.abs(player.vx) <= player.decceleration || Math.abs(player.vy) <= player.decceleration) {
      player.vx = 0;
      player.vy = 0;
    } else {
    player.vx -= Math.sin(tempdir) * player.decceleration;
    player.vy -= Math.cos(tempdir) * player.decceleration;
    }
  }
  if (Math.abs(player.vx) > player.maxSpeed || Math.abs(player.vy) > player.maxSpeed) {
    player.vx = Math.sin(tempdir) * player.maxSpeed;
    player.vy = Math.cos(tempdir) * player.maxSpeed;
  }
}, fps);

function createBullet(img,img2,x,y,direction,speed,size,cr,projectiles,spread,rSpread) {
  for (var i = -(projectiles-1)/2; i <= (projectiles-1)/2; i++) {
    var dir = direction-i*spread+rSpread*(Math.random()-0.5)
    if (weapon.name == "Mechanical Pencil") {
      for (var i2 = 0; i2 < 10; i2++) {
        bullets.push({
          img: img,
          imgreversed: img2,
          x: x+Math.sin(dir)*i2*10,
          y: y+Math.cos(dir)*i2*10,
          vx: Math.sin(dir)*speed,
          vy: Math.cos(dir)*speed,
          size: size,
          collisionRadius: cr,
          dist: 0,
          type: Math.floor(Math.random()*2),
          type2: Math.random()/5
        });
      }
    }
    bullets.push({
      img: img,
      imgreversed: img2,
      x: x,
      y: y,
      vx: Math.sin(dir)*speed,
      vy: Math.cos(dir)*speed,
      size: size,
      collisionRadius: cr,
      dist: 0,
      type: Math.floor(Math.random()*2),
      type2: Math.random()/5
    });
  }
}

function createEnemy(x, y, size, speed, type, health) {
  enemys.push({
    x: x,
    y: y,
    vx: 0,
    vy: 0,
    size: size,
    speed: speed,
    type: type,
    healthMax: health,      
    health: health
  })
}

function createWall(x, y, width, height) {
  walls.push({
    x: x,
    y: y,
    width: width,
    height: height
  })
}