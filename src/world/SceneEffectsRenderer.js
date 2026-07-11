/**
 * PixiJS adapter for the renderer-neutral descriptors from WorldEffects.
 *
 * This module deliberately knows nothing about React, Zustand, API polling or
 * WorldCanvas. A scene supplies a parent Container and a map projector; the
 * renderer owns only its child containers and can therefore be mounted next
 * to any future Tiled/Pixi world implementation.
 */

import { Container, Graphics } from 'pixi.js';

const LAYER_ORDER = Object.freeze({
  'river-base': 100,
  'river-glow': 110,
  'river-particles': 120,
  crystals: 300,
  'crystal-glow': 290,
  'building-effects': 760,
  'ambient-effects': 840,
  'agent-effects': 940,
  'weather-effects': 1100,
  'alert-glow': 1180,
  'alert-icons': 1200,
  'world-labels': 1250,
});

const identityProjector = (point) => ({ x: point?.x ?? 0, y: point?.y ?? 0 });
const toColor = (value, fallback = 0xffffff) => {
  if (Number.isFinite(value)) return value;
  const parsed = Number.parseInt(String(value ?? '').replace('#', ''), 16);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const hash = (value) => [...String(value)].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7);

function pointOnPath(path, progress) {
  if (!Array.isArray(path) || path.length === 0) return { x: 0, y: 0 };
  if (path.length === 1) return path[0];
  const segments = path.length - 1;
  const scaled = ((progress % 1) + 1) % 1 * segments;
  const index = Math.min(segments - 1, Math.floor(scaled));
  const local = scaled - index;
  const first = path[index];
  const second = path[index + 1];
  return { x: first.x + (second.x - first.x) * local, y: first.y + (second.y - first.y) * local };
}

function drawDiamond(graphics, point, radius, color, alpha = 1) {
  graphics.poly([
    point.x, point.y - radius,
    point.x + radius, point.y,
    point.x, point.y + radius,
    point.x - radius, point.y,
  ]).fill({ color, alpha });
}

function drawAlertIcon(graphics, point, descriptor, time) {
  const scale = descriptor.scale ?? 1;
  const bob = Math.sin(time * 2.2 + (descriptor.bobPhase ?? 0) * Math.PI * 2) * 2;
  const y = point.y + bob;
  const radius = 11 * scale;
  graphics.circle(point.x, y, radius).fill({ color: toColor(descriptor.backgroundColor, 0xd7a846), alpha: 0.96 });
  graphics.circle(point.x, y, radius).stroke({ color: 0x2d2924, width: 1.3, alpha: 0.65 });
  if (descriptor.icon === 'spark') {
    graphics.poly([point.x, y - 6 * scale, point.x + 3 * scale, y - 1 * scale, point.x + 8 * scale, y, point.x + 3 * scale, y + 2 * scale, point.x, y + 7 * scale, point.x - 3 * scale, y + 2 * scale, point.x - 8 * scale, y, point.x - 3 * scale, y - 1 * scale]).fill(toColor(descriptor.color, 0xfff4d6));
  } else {
    graphics.rect(point.x - 1.3 * scale, y - 6 * scale, 2.6 * scale, 8 * scale).fill(toColor(descriptor.color, 0xfff4d6));
    graphics.circle(point.x, y + 5 * scale, 1.7 * scale).fill(toColor(descriptor.color, 0xfff4d6));
  }
}

/**
 * A small, deterministic scene effect renderer. `sync` is expected after
 * polling snapshots; `update` may be called from a Pixi ticker every frame.
 */
export class SceneEffectsRenderer {
  constructor({ parent = null, project = identityProjector, reducedMotion = false, maxParticles = 160 } = {}) {
    this.root = new Container();
    this.root.sortableChildren = true;
    this.project = project;
    this.reducedMotion = reducedMotion;
    this.maxParticles = maxParticles;
    this.layers = new Map();
    this.animated = [];
    this.lastEffects = null;
    if (parent) parent.addChild(this.root);
  }

  setProjector(project) {
    this.project = typeof project === 'function' ? project : identityProjector;
    if (this.lastEffects) this.sync(this.lastEffects);
  }

  setReducedMotion(reducedMotion) {
    this.reducedMotion = Boolean(reducedMotion);
  }

  attach(parent) {
    if (parent && this.root.parent !== parent) parent.addChild(this.root);
    return this;
  }

  layer(name) {
    if (this.layers.has(name)) return this.layers.get(name);
    const layer = new Container();
    layer.sortableChildren = true;
    layer.zIndex = LAYER_ORDER[name] ?? 900;
    this.layers.set(name, layer);
    this.root.addChild(layer);
    return layer;
  }

  clear() {
    this.animated = [];
    for (const layer of this.layers.values()) {
      layer.removeChildren().forEach((child) => child.destroy({ children: true }));
    }
  }

  sync(effects) {
    this.lastEffects = effects ?? null;
    this.clear();
    const instructions = Array.isArray(effects?.renderInstructions) ? effects.renderInstructions : [];
    let particleCount = 0;
    for (const instruction of instructions) {
      if (!instruction || instruction.kind === 'label-anchor') continue;
      const budget = Number(instruction.particleBudget) || 0;
      if (particleCount + budget > this.maxParticles && budget > 0) continue;
      particleCount += budget;
      this.addInstruction(instruction);
    }
    this.root.sortChildren();
  }

  addInstruction(descriptor) {
    const layer = this.layer(descriptor.layer);
    const graphics = new Graphics();
    graphics.cullable = true;
    layer.addChild(graphics);
    const animated = this.draw(graphics, descriptor, 0);
    if (animated && !this.reducedMotion) this.animated.push({ graphics, descriptor });
  }

  draw(graphics, descriptor, time) {
    graphics.clear();
    const point = this.project(descriptor.position ?? { x: 0, y: 0 });
    const color = toColor(descriptor.color, 0xd6a646);
    const alpha = clamp(descriptor.alpha ?? 1, 0, 1);

    if (descriptor.kind === 'polyline') {
      const points = (descriptor.points ?? []).map((item) => this.project(item));
      if (points.length < 2) return false;
      graphics.moveTo(points[0].x, points[0].y);
      for (const current of points.slice(1)) graphics.lineTo(current.x, current.y);
      graphics.stroke({ color, width: Math.max(1, (descriptor.lineWidth ?? 1) * 80), alpha });
      return false;
    }

    if (descriptor.kind === 'flow-particles') {
      const count = Math.min(this.maxParticles, Math.max(4, Math.round(7 + (descriptor.speed ?? 0) * 14)));
      const seed = hash(`${descriptor.layer}-${descriptor.color}`);
      for (let index = 0; index < count; index += 1) {
        const progress = ((time * (descriptor.speed ?? 0.4) * 0.18) + index / count + seed / 10000) % 1;
        const position = this.project(pointOnPath(descriptor.path, progress));
        const size = Math.max(1.5, (descriptor.size ?? 0.04) * 95);
        graphics.circle(position.x, position.y, size).fill({ color, alpha: alpha * (0.55 + (index % 3) * 0.15) });
      }
      return true;
    }

    if (descriptor.kind === 'diamond') {
      drawDiamond(graphics, point, Math.max(5, (descriptor.radius ?? 0.12) * 90), color, alpha);
      return false;
    }

    if (descriptor.kind === 'circle' || descriptor.kind === 'work-aura' || descriptor.kind === 'building-work-light') {
      const pulse = descriptor.pulseSpeed || descriptor.pulsePhase != null ? 0.88 + Math.sin(time * (descriptor.pulseSpeed ?? 2) + (descriptor.pulsePhase ?? 0) * Math.PI * 2) * 0.12 : 1;
      graphics.circle(point.x, point.y, Math.max(3, (descriptor.radius ?? 0.12) * 95 * pulse)).fill({ color, alpha });
      return descriptor.pulseSpeed != null || descriptor.pulsePhase != null;
    }

    if (descriptor.kind === 'alert-icon') {
      drawAlertIcon(graphics, point, descriptor, time);
      return true;
    }

    if (descriptor.kind === 'smoke-emitter') {
      const count = this.reducedMotion ? 3 : Math.min(18, Math.max(4, descriptor.particleBudget ?? 8));
      const seed = hash(`${descriptor.position?.x}-${descriptor.position?.y}`);
      for (let index = 0; index < count; index += 1) {
        const phase = (time * 0.16 + index / count + seed / 1000) % 1;
        const x = point.x + Math.sin((index + 1) * 5.2 + time * 0.4) * (4 + phase * 13);
        const y = point.y - phase * (descriptor.rise ?? 0.35) * 110;
        graphics.circle(x, y, 4 + phase * 10).fill({ color, alpha: alpha * (1 - phase) * 0.58 });
      }
      return true;
    }

    if (descriptor.kind === 'lightning-flash') {
      const interval = descriptor.intervalSeconds ?? 6;
      const phase = ((time + (hash(descriptor.position?.x) % 10)) % interval) / interval;
      if (phase < 0.055) graphics.circle(point.x, point.y, 180).fill({ color, alpha: alpha * (1 - phase / 0.055) });
      return true;
    }

    if (descriptor.kind === 'work-spark' || descriptor.kind === 'success-spark-burst') {
      const count = descriptor.kind === 'success-spark-burst' ? 8 : 4;
      for (let index = 0; index < count; index += 1) {
        const angle = index / count * Math.PI * 2 + time * 1.5;
        const radius = descriptor.kind === 'success-spark-burst' ? 5 + ((time * 30 + index * 7) % 18) : 5 + (index % 2) * 4;
        graphics.circle(point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius, descriptor.kind === 'success-spark-burst' ? 2.5 : 2).fill({ color, alpha });
      }
      return true;
    }

    if (descriptor.kind === 'package-carried') {
      const bob = Math.sin(time * 3 + (descriptor.bobPhase ?? 0) * Math.PI * 2) * 2;
      graphics.roundRect(point.x - 7, point.y - 7 + bob, 14, 12, 2).fill({ color: 0xb98347, alpha });
      graphics.rect(point.x - 6, point.y - 2 + bob, 12, 2).fill({ color: 0xf0ca72, alpha: alpha * 0.75 });
      return true;
    }

    if (descriptor.kind === 'success-seal') {
      graphics.circle(point.x, point.y, 7 * (descriptor.scale ?? 1)).stroke({ color, width: 2, alpha });
      graphics.moveTo(point.x - 3, point.y).lineTo(point.x - 0.5, point.y + 3).lineTo(point.x + 4, point.y - 4).stroke({ color, width: 1.8, alpha });
      return false;
    }

    return false;
  }

  update(timeSeconds) {
    if (this.reducedMotion) return;
    for (const item of this.animated) {
      if (!item.graphics.destroyed) this.draw(item.graphics, item.descriptor, timeSeconds);
    }
  }

  destroy() {
    this.clear();
    this.layers.clear();
    this.root.destroy({ children: true });
    this.lastEffects = null;
  }
}

export const createSceneEffectsRenderer = (options) => new SceneEffectsRenderer(options);
