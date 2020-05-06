// Set height of body to match the inner height of window
function setInnerHeight() {
    let vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Get the render context of canvas
const screen = document.querySelector('#screen')
const context = screen.getContext('2d')

// 
function resizeCanvas() {
    setInnerHeight()
    
    const minDimensionScreen = Math.min(window.innerWidth, window.innerHeight)

    screen.width = screen.height = 25

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

resizeCanvas()

window.addEventListener('resize', () => setTimeout(resizeCanvas, 1))

const objects = []

function renderScreen() {
    clearScreen()

    objects.forEach(obj => obj.draw())

    requestAnimationFrame(() => {
        renderScreen()
    })
}

renderScreen()

class Snake {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.length = 1
        this.directionMove = 'right'
    }

    draw() {
        drawPixel(this.x, this.y)
    }

    move() {
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
}

const snake = new Snake(0, 0)

objects.push(snake)

setInterval(() => {
    snake.move()
    snake.x = ((snake.x % screen.width) + screen.width) % screen.width
    snake.y = ((snake.y % screen.height) + screen.height) % screen.height
}, 250);

document.addEventListener('keydown', event => {
    const keyPressed = event.key

    if(event.key === 'ArrowUp') snake.changeDirection('up')
    else if(event.key === 'ArrowRight') snake.changeDirection('right')
    else if(event.key === 'ArrowDown') snake.changeDirection('down')
    else if(event.key === 'ArrowLeft') snake.changeDirection('left')
})