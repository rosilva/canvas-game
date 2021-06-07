import { CanvasElement } from "./canvas-element.js";

export class Particle extends CanvasElement {
  constructor(x, y, size, color, velocity) {
    super(x, y, size, color)
    this.velocity = velocity
    this.alpha = 1
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }

  update(ctx) {
    this.draw(ctx)
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.01
  }
}
