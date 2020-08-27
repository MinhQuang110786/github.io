//Welcome screen
const gameStart = document.querySelector('.welcome');
const snakeGame = document.querySelectorAll('.level .speed');

const pingGame = document.querySelector('#ping');
const frame = document.querySelector('.main-frame');
const speeds = [200,100,50];

//End screen
const gameEnd = document.querySelector('.endGame');
const returnBtn = document.querySelector('#return');
const restartBtn = document.querySelector('#restart');
let msg = document.querySelector('.msg');


frame.style.display = "none";
gameEnd.style.display = "none";

//Audio 
const audioStart = document.getElementById("audioStart");
const audioMain = document.getElementById("background");
const snakeEating = document.getElementById("feeding");
const wallHit = document.getElementById("wall_hit");
const audioOver = document.getElementById("overSound");
//Setting the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;

//Setting the block
let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;

//Setting the score, snakeSpeed
let score = 0;
let snakeSpeed = 0;

//Utility function
function drawBorder() {
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(0, height - blockSize, width, blockSize);
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseLine = "top";
    ctx.fillText(`Scores: ${score}`, blockSize, blockSize + 15);
}

function drawCircle(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    fillCircle ? ctx.fill() : ctx.stroke();
}



//Class Block
class Block {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    drawSquare(color) {
        let x = this.col * blockSize;
        let y = this.row * blockSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
    }
    drawCircle(color) {
        let centerX = this.col * blockSize + blockSize / 2;
        let centerY = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = color;
        drawCircle(centerX, centerY, blockSize / 2, true);
    }
    equal(otherBlocks) {
        return this.col === otherBlocks.col && this.row === otherBlocks.row;
    }
}

//Class Apple
class Apple {
    constructor(color) {
        this.position = new Block(10, 10);
        this.color = color;
    }

    draw() {
        this.position.drawCircle(this.color);
    }

    move() {
        let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        this.position = new Block(randomCol, randomRow);
    }
}

//Class Snake
class Snake {
    constructor(color) {
        this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
        this.direction = "right";
        this.nextDirection = "right";
        this.color = color;
    }

    draw() {
        this.segments.forEach(segment => segment.drawSquare(this.color));
    }

    move() {
        let head = this.segments[0];
        let newHead;
        this.direction = this.nextDirection;
        if (this.direction === "right") {
            newHead = new Block(head.col + 1, head.row);
        } else if (this.direction === "down") {
            newHead = new Block(head.col, head.row + 1);
        } else if (this.direction === "left") {
            newHead = new Block(head.col - 1, head.row);
        } else if (this.direction === "up") {
            newHead = new Block(head.col, head.row - 1);
        }

        if (this.checkCollision(newHead)) {
            wallHit.play();
            gameOver();
            return;
        }
        this.segments.unshift(newHead);
        if (newHead.equal(apple.position)) {
            snakeEating.play();
            switch(snakeSpeed){
                case speeds[0]:
                    score++;
                    break;
                case speeds[1]:
                        score+=2;;
                        break;
                case speeds[2]:
                        score+=3;
                        break;
            }
            apple.move();
        } else {
            this.segments.pop();
        }

    }

    setDirection(newDirection) {
        if (this.direction === "up" && newDirection === "down") {
            return;
        } else if (this.direction === "right" && newDirection === "left") {
            return;
        } else if (this.direction === "down" && newDirection === "up") {
            return;
        } else if (this.direction === "left" && newDirection === "right") {
            return;
        }
        this.nextDirection = newDirection;
    };

    checkCollision(head) {
        let leftCollision = (head.col === 0);
        let topCollision = (head.row === 0);
        let rightCollision = (head.col === widthInBlocks - 1);
        let bottomCollision = (head.row === heightInBlocks - 1);
        let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
        let selfCollision = false;
        for (let i = 0; i < this.segments.length; i++) {
            if (head.equal(this.segments[i])) {
                selfCollision = true;
            }
        }
        return wallCollision || selfCollision;
    };


}

let directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};
addEventListener('keydown', event => {
    let newDirection = directions[event.keyCode];
    if (newDirection)
        snake.setDirection(newDirection);
});

//Set the object snake and apple
let snake = new Snake('yellow');
let apple = new Apple('red');




//Active the game
audioStart.play();
audioStart.setAttribute("loop","true");
snakeGame.forEach((speed,index)=>{
    speed.addEventListener('click',()=>{
        gameStart.style.display = "none";
        frame.style.display = "block";
        snakeSpeed = speeds[index];
        audioStart.pause();
        audioMain.play();
        startGame();
    })
})

//Check the game over
function gameOver() {
    clearInterval(intervalId);
    frame.style.display = "none";
    gameEnd.style.display = "block";
    audioMain.pause();
    audioOver.play();
    msg.textContent = `Game Over. You got: ${score} points`;
};

//Handle the end

returnBtn.addEventListener('click', ()=>{
    gameEnd.style.display = "none";
    frame.style.display = "none";
    gameStart.style.display = "block";
    audioMain.pause();
    audioOver.pause();
    audioStart.play();
    startGame();
    clearInterval(intervalId);
});

restartBtn.addEventListener('click', e => {
    gameEnd.style.display = "none";
    gameStart.style.display = "none";
    frame.style.display = "block";
    audioOver.pause();
    audioMain.play();
    startGame();
})

//start Game function
function startGame() {
    score = 0;
    snake = new Snake('yellow');
    apple = new Apple('red');
    
    intervalId = setInterval(function () {
        ctx.clearRect(0, 0, width, height);
        drawScore();
        snake.move();
        snake.draw();
        apple.draw();
        drawBorder();
    }, snakeSpeed);
}




