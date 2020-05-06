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

    screen.width = screen.height = 2

    screen.style.minWidth = `${ minDimensionScreen }px`
    screen.style.minHeight = `${ minDimensionScreen }px`
}

// Clear the canvas
function clearScreen(color = 'black') {
    context.fillStyle = color
    context.fillRect(0, 0, screen.width, screen.height)
}

resizeCanvas()

window.addEventListener('resize', () => setTimeout(resizeCanvas, 1))

clearScreen()