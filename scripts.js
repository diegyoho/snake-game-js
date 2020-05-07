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
    
    const minDimensionScreen = Math.min(window.innerWidth, window.innerHeight)

    screen.width = screen.height = worldSize

    screen.style.minWidth = `${ minDimensionScreen }px`
    screen.style.minHeight = `${ minDimensionScreen }px`
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
    }

    die() {
        this.dead = true
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
            objects.splice(objects.indexOf(snake), 1)
            snake.die()
        }
        
        const hasFood = objects.findIndex(obj => obj !== snake && (obj.x === snake.x && obj.y === snake.y))
        
        if(hasFood > -1) {
            objects.splice(hasFood, 1)
            foodCount--
            snake.eat()
            speed--
        }

        waitForMove = false
    }

    setTimeout(() => {
        moveAndCollisionSnake()
    }, speed)
}

setTimeout(() => {
    moveAndCollisionSnake()
}, speed)

document.addEventListener('keydown', event => {
    const keyPressed = event.key

    if(keyPressed === ' ') {
        pause = !pause
        return
    }

    if(pause || waitForMove) return

    waitForMove = true
    if(keyPressed === 'ArrowUp' &&
        (snake.tail.length === 0 || snake.directionMove !== 'down')) snake.changeDirection('up')
    else if(keyPressed === 'ArrowRight' &&
        (snake.tail.length === 0 || snake.directionMove !== 'left')) snake.changeDirection('right')
    else if(keyPressed === 'ArrowDown' &&
        (snake.tail.length === 0 || snake.directionMove !== 'up')) snake.changeDirection('down')
    else if(keyPressed === 'ArrowLeft' &&
        (snake.tail.length === 0 || snake.directionMove !== 'right')) snake.changeDirection('left')
})

// Spawn Foods
setInterval(() => {
    if(pause || snake.dead)
        return

    if(foodCount >= 5)
        return


    let x = Math.floor(Math.random() * worldSize)
    let y = Math.floor(Math.random() * worldSize)

    while(objects.find(obj => obj.x === x && obj.y === y)) {
        x = Math.floor(Math.random() * worldSize)
        y = Math.floor(Math.random() * worldSize)
    }

    objects.unshift(new Food(x, y))
    foodCount++
}, 2000)