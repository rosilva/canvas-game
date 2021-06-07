import { CanvasElement } from "./canvas-element.js";

export class Projectile extends CanvasElement {
  constructor(x, y, size, color, velocity) {
    super(x, y, size, color)
    this.velocity = velocity
  }
}
