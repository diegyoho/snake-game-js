// Set height of body to match the inner height of window
function setInnerHeight() {
    let vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Get the render context of canvas
const screen = document.querySelector('#screen')
const context = screen.getContext('2d')
const worldSize = 25

const objects = []
let foodCount = 0

// Calculate the canvas size 
function resizeCanvas() {
    setInnerHeight()
    
    let minDimensionScreen = Math.min(window.innerWidth, window.innerHeight)

    if(minDimensionScreen === window.innerHeight)
        minDimensionScreen *= 0.5
    else
        minDimensionScreen *= 0.9

    screen.width = screen.height = worldSize

    screen.style.minWidth = `${ minDimensionScreen }px`
    screen.style.minHeight = `${ minDimensionScreen }px`

    document.documentElement.style.setProperty('--map-width', `${minDimensionScreen * 0.01}px`)
}

// Clear the canvas
function clearScreen(color = 'black') {
    context.fillStyle = color
    context.fillRect(0, 0, screen.width, screen.height)
}

function drawPixel(x, y, color = '#4cff2c') {
    context.fillStyle = color
    context.fillRect(x, y, 1, 1)
}

// function drawText(text, x, y, color = '#4cff2c') {
//     context.fillStyle = color
//     context.font = '10px monospace';
//     context.fillText(text, x, y);
// }


resizeCanvas()

window.addEventListener('resize', () => setTimeout(resizeCanvas, 1))

function renderScreen() {
    clearScreen()

    objects.forEach(obj => obj.draw())
    // drawText('PRESS SPACE TO START', 0, 10)
    requestAnimationFrame(() => {
        renderScreen()
    })
}

renderScreen()
// clearScreen()

// Classes of game elements
class Snake {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.directionMove = 'right'
        this.tail = []
        this.dead = false
    }

    draw() {
        this.tail.forEach(t => t.draw())
        drawPixel(this.x, this.y)
    }

    move() {
        if(this.tail[this.tail.length-1])
            this.tail[this.tail.length-1].moveTail()

        switch(this.directionMove) {
            case 'up':
                this.y--
                break;
            case 'right':
                this.x++
                break;
            case 'down':
                this.y++
                break;
            case 'left':
                this.x--
                break;
        }
    }

    changeDirection(direction) {
        this.directionMove = direction || this.directionMove
    }

    eat() {
        const endTail = new Tail(this.x, this.y, this.tail[this.tail.length-1] || this)
        this.tail.push(endTail)
        this.eating = true
        document.querySelector('#score').innerText = `00${this.tail.length}`.slice(-3)
    }

    die() {
        this.dead = true
        audio.pause()
        audio.src = './audios/spaceTrash1.mp3'
        audio.currentTime = 0
        audio.play()
    }
}

class Tail {
    constructor(x, y, head) {
        this.x = x
        this.y = y
        this.head = head
    }

    draw() {
        drawPixel(this.x, this.y, '#37b321')
    }

    moveTail() {
        this.x = this.head.x
        this.y = this.head.y

        if(this.head.moveTail)
            this.head.moveTail()
    }
}

class Food {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.color = '#fb6031'
    }

    draw() {
        drawPixel(this.x, this.y, this.color)
    }
}

const snake = new Snake(Math.floor(Math.random() * worldSize),
                        Math.floor(Math.random() * worldSize))
let waitForMove = false
objects.push(snake)
let speed = 250,
    pause = true

const audio = document.querySelector('audio')
let eatSound = false
// Move Snake and Check collisions
function moveAndCollisionSnake() {
    
    if(snake.dead)
        return

    if(!pause) {
        snake.move()
        snake.x = ((snake.x % screen.width) + screen.width) % screen.width
        snake.y = ((snake.y % screen.height) + screen.height) % screen.height
        
        const hasTail = snake.tail.findIndex(obj => obj !== snake && (obj.x === snake.x && obj.y === snake.y))

        if(hasTail > -1) {
            // objects.splice(objects.indexOf(snake), 1)
            snake.die()
            document.querySelector('#end-game').style.display = 'flex'
            return
        }
        
        const hasFood = objects.findIndex(obj => obj !== snake && (obj.x === snake.x && obj.y === snake.y))
        
        if(hasFood > -1) {
            objects.splice(hasFood, 1)
            foodCount--
            snake.eat()
            speed--
            audio.pause()
            audio.src = './audios/powerUp2.mp3'
            audio.currentTime = 0
            audio.play()
            eatSound = true
        }
        waitForMove = false

        if(!eatSound) {
            audio.pause()
            audio.src = './audios/tone1.mp3'
            audio.currentTime = 0
            audio.play()
        } else if(audio.currentTime >= audio.duration/3) {
            eatSound = false
        }
    }

    setTimeout(() => {
        moveAndCollisionSnake()
    }, Math.max(speed, 75))
}

setTimeout(() => {
    moveAndCollisionSnake()
}, speed)

document.addEventListener('keydown', event => {
    const keyPressed = event.key

    if(keyPressed === ' ') {
        pauseGame()
        return
    }

    if(pause || waitForMove) return

    waitForMove = true
    if(keyPressed === 'ArrowUp') moveUp()
    else if(keyPressed === 'ArrowRight') moveRight()
    else if(keyPressed === 'ArrowDown') moveDown()
    else if(keyPressed === 'ArrowLeft') moveLeft()
})

// Spawn Foods
setInterval(() => {
    if(pause || snake.dead)
        return

    if(foodCount >= 5)
        return


    let x = Math.floor(Math.random() * worldSize)
    let y = Math.floor(Math.random() * worldSize)

    while(objects.find(obj => obj.x === x && obj.y === y) ||
          snake.tail.find(obj => obj.x === x && obj.y === y)) {
        x = Math.floor(Math.random() * worldSize)
        y = Math.floor(Math.random() * worldSize)
    }

    objects.unshift(new Food(x, y))
    foodCount++
}, 2000)

function pauseGame() {
    pause = !pause
}

function moveUp() {
    if(snake.tail.length === 0 || snake.directionMove !== 'down')
        snake.changeDirection('up')
}

function moveRight() {
    if(snake.tail.length === 0 || snake.directionMove !== 'left')
        snake.changeDirection('right')
}

function moveDown() {
    if(snake.tail.length === 0 || snake.directionMove !== 'up')
        snake.changeDirection('down')
}

function moveLeft() {
    if(snake.tail.length === 0 || snake.directionMove !== 'right')
        snake.changeDirection('left')
}

let time,
    touchDownPos

function getTouch(event) {
    const x = event.changedTouches[0].clientX
    const y = event.changedTouches[0].clientY
    return { x, y }
}

function clickScreen() {
    if(!isMobile())
        return

    pauseGame()
}

function touchStart(event) {
    if(!isMobile())
        return
    
        touchDownPos = getTouch(event)
    time = new Date()
}

function touchEnd(event) {
    if(!isMobile() || pause || waitForMove) return

    const deltaTime = new Date() - time
    // console.log(deltaTime)
    const touchUpPos = getTouch(event)
    const swipe = {
        x: touchUpPos.x - touchDownPos.x,
        y: touchUpPos.y - touchDownPos.y
    }

    // console.log(swipe)
    if(deltaTime <= 200) {
        waitForMove = true

        if(Math.abs(swipe.x) > Math.abs(swipe.y))
            if(swipe.x > 0)
                // console.log('right')
                moveRight()
            else
                // console.log('left')
                moveLeft()
        else
            if(swipe.y > 0)
                // console.log('down')
                moveDown()
            else
                // console.log('up')
                moveUp()
    }
}

//Function to detect Mobile Browser: https://medium.com/simplejs/detect-the-users-device-type-with-a-simple-javascript-check-4fc656b735e1
function isMobile() {
    if(navigator.userAgent.match(/Android/i) ||
       navigator.userAgent.match(/webOS/i) ||
       navigator.userAgent.match(/iPhone/i) ||
       navigator.userAgent.match(/iPad/i) ||
       navigator.userAgent.match(/iPod/i) ||
       navigator.userAgent.match(/BlackBerry/i) ||
       navigator.userAgent.match(/Windows Phone/i))
        return true
    
        return false
}

if(isMobile())
    document.querySelector('#browser').style.display = 'none'
else
    document.querySelector('#mobile').style.display = 'none'
