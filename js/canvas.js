var enemies = []

let highScore = localStorage.getItem("highScore") || 0;

let game = {
    canvas: document.getElementById("area"),
    start () {
        console.log(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.clear();
        this.interval = setInterval(redraw, 20);
        this.intervalNewEnemy = setInterval(newEnemy, 600);
        this.intervalnewBonus = setInterval(newBonus, 2500);
        this.intervalTime = setInterval(updateTimer, 1000); 
        this.time = 0;
        this.score = 0;
        let image = new Image();
        image.src = "img/face-cool.png"; 
        this.player = new sprite(30, 30, image, 10, 120);
        this.enemies = [];
        this.bonus = []; 
        this.keyCode = -1; //when there is no key pressed
        window.addEventListener('keydown', (e) =>
        {
            this.keyCode = e.keyCode;
        });

        window.addEventListener('keyup', (e) =>
        {
            this.keyPressed = -1;
        });
    },
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    restartGame() {
        clearInterval(this.interval); 
        clearInterval(this.intervalNewEnemy); 
        clearInterval(this.intervalnewBonus); 
        clearInterval(this.intervalTime); 
        game.start();
    }
}

function startGame() {
    game.start();
}
function restartGame(){
    game.restartGame();
}


function sprite(width, height, image, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.image = image;

  ctx = game.context;
  ctx.drawImage(this.image, this.x, this.y, this.width, this.height)


  this.redraw = function()
  {
    ctx = game.context;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height)  }
}

function redraw() {
  game.clear();
  //game.player.x += 1;
  switch (game.keyCode) {
   case 65: //left
       game.player.x -= 2;
      break;
   case 87: //up
       game.player.y -= 2;
      break;
   case 68: //right
        game.player.x += 2;
      break;
   case 83: //down
       game.player.y += 2;
      break;
   }
   if(game.player.x > game.canvas.width - 30) {
        game.player.x = game.canvas.width - 30; 
   } else if(game.player.x < 0) {
        game.player.x = 0; 
   }
   if(game.player.y > game.canvas.height - 30) {
        game.player.y = game.canvas.height - 30;
   } else if(game.player.y < 0) {
        game.player.y = 0; 
   }

  game.player.redraw();


   game.enemies.forEach((e) => {
       let yDelta = Math.floor(Math.random() * 11) - 5;
       e.x -= 1;
       e.y += yDelta;
       e.redraw();
    })

    game.bonus.forEach((e) => {
        let yDelta = Math.floor(Math.random() * 11) - 5;
        e.x -= 1;
        e.y += yDelta;
        e.redraw();
    })

    checkCollision();
    drawScore();
    drawTime(); 
}

function checkCollision() {
    distance = 15; 
    game.bonus.forEach((e) => {
        if(Math.abs(game.player.x - e.x) < distance && Math.abs(game.player.y - e.y) < distance) {
            game.bonus.splice(game.bonus.indexOf(e), 1); 
            game.score += 10;
            if (game.score > highScore) {
                highScore = game.score;
                localStorage.setItem("highScore", highScore);
            } 
        }
    }); 
    game.enemies.forEach((e) => {
        if(Math.abs(game.player.x - e.x) < distance && Math.abs(game.player.y - e.y) < distance) {
            game.restartGame(); 
        }
    }); 
}

function drawScore() {
    ctx.font = "18px Arial";
    ctx.strokeText("Score: " + game.score +  " | High Score: " + highScore, 50, 50); 
}

function drawTime() {
    ctx.font = "18px Arial";
    ctx.strokeText("Time: " + game.time, 300, 50); 
}


function newEnemy()
{
  
    let y = Math.floor(Math.random()*1024);
    let image = new Image();
    image.src = "img/face-devilish.png" 
    e = new sprite(30, 30, image, 1000, y);
    game.enemies.push(e);
    

}

function newBonus()
{
    let y = Math.floor(Math.random()*1024);
    let image = new Image();
    image.src = "img/face-monkey.png" 
    e = new sprite(30, 30, image, 1000, y);
    game.bonus.push(e);
}

function updateTimer() {
    game.time += 1;  
    game.score += 1;
}