import { Player } from './models/player.js'
import { Enemy } from './models/enemy.js'
import { Projectile } from './models/projectile.js'
import { Particle } from './models/particle.js'

// Canvas configuration
const canvas = document.querySelector('#animation')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// DOM elements
const scoreValueEl = document.querySelectorAll('.score-value')
const scoreBigEl = document.querySelector('.score-big')
const startGameBtn = document.querySelector('#start-game-btn')
const gameLevelEl = document.querySelector('#game-level')
const bestScoreEl = document.querySelector('.best-score')

// Global variables
let bestScore = localStorage.getItem('best-score') || 0
let gameLevel = localStorage.getItem('game-level') || 0.5
let score = 0
let animationId
let spawnInterval
let player
let projectiles = []
let enemies = []
let particles = []

// Update DOM with stored data
bestScoreEl.innerHTML = bestScore
gameLevelEl.value = gameLevel

// Init function
function init() {
  player = new Player(canvas.width / 2, canvas.height / 2, 30, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreValueEl.forEach(el => el.innerHTML = score)
}

// Spawn enemies function
function spawnEnemies() {
  spawnInterval = setInterval(() => {
    const size = Math.random() * (30 - 10) + 10

    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - size : canvas.width + size
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - size : canvas.height + size
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    const enemy = new Enemy(x, y, size, color, velocity)
    enemies.push(enemy)
  }, 1000 / gameLevel)
}

// Animate function
function animate() {
  animationId = window.requestAnimationFrame(animate)
  ctx.fillStyle = 'rgba(0, 0, 0, .1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  player.draw(ctx)

  // Animate particles
  particles.forEach((particle, particleIndex) => {
    if (particle.alpha < 0) {
      particles.splice(particleIndex, 1)
    } else {
      particle.update(ctx)
    }
  })

  // Animate projectiles
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update(ctx)

    if (
      projectile.x + projectile.size < 0 ||
      projectile.x - projectile.size > canvas.width ||
      projectile.y + projectile.size < 0 ||
      projectile.y - projectile.size > canvas.height
    ) {
      // Remove projectile when outsite the canvas
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1)
      }, 0)
    }
  })

  // Animate enemies
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update(ctx)

    // Calculate the distance between the player and the enemy
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y)

    if (dist - enemy.size - player.size < 1) {
      // Ends the game when play is hit by an enemy
      scoreBigEl.classList.remove('d-none')
      window.cancelAnimationFrame(animationId)
      clearInterval(spawnInterval)
    }

    projectiles.forEach((projectile, projectileIndex) => {
      // Calculate the distance between the projectile and the enemy
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      if (dist - enemy.size - projectile.size < 1) {
        // Increase score when hit an enemy
        score += 100
        scoreValueEl.forEach(el => el.innerHTML = score)

        if (score > bestScore) {
          localStorage.setItem('best-score', score)
          bestScoreEl.innerHTML = score
        }

        // Creates particles when hit enemy is hit
        for (let i = 0; i < enemy.size * 2; i++) {
          const particle = new Particle(
            projectile.x,
            projectile.y,
            Math.random() * 3,
            enemy.color,
            {
              x: (Math.random() - 0.5) * (Math.random() * 6),
              y: (Math.random() - 0.5) * (Math.random() * 6),
            }
          )
          particles.push(particle)
        }

        // Remove enemy when hit
        setTimeout(() => {
          enemies.splice(enemyIndex, 1)
          projectiles.splice(projectileIndex, 1)
        }, 0)
      }
    })
  })
}

// Fire projectile on click
window.addEventListener('click', event => {
  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  }

  const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
  projectiles.push(projectile)
})

// Start or restart the game
startGameBtn.addEventListener('click', event => {
  gameLevel = parseFloat(gameLevelEl.value) 
  event.stopPropagation()

  localStorage.setItem('game-level', gameLevel)

  init()
  animate()
  spawnEnemies()

  scoreBigEl.classList.add('d-none')
})
