import * as THREE from 'three';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(
  canvas.clientWidth, canvas.clientHeight, false
);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  55, canvas.clientWidth / canvas.clientHeight,
  0.1, 200
);
const fit = Math.max(1, 1.4 / camera.aspect);
camera.position.set(0, 4, 7).multiplyScalar(fit);
camera.lookAt(0, 0, 0);

// soft round glow for every particle
const dot = document.createElement('canvas');
dot.width = dot.height = 64;
const g = dot.getContext('2d');
const grad = g.createRadialGradient(
  32, 32, 0, 32, 32, 32
);
grad.addColorStop(0, 'rgba(255,255,255,1)');
grad.addColorStop(0.3, 'rgba(255,255,255,.35)');
grad.addColorStop(1, 'rgba(255,255,255,0)');
g.fillStyle = grad;
g.fillRect(0, 0, 64, 64);
const glow = new THREE.CanvasTexture(dot);

const COUNT = 60000;
const ARMS = 4;
const pos = new Float32Array(COUNT * 3);
const col = new Float32Array(COUNT * 3).fill(1);

const geo = new THREE.BufferGeometry();
geo.setAttribute(
  'position', new THREE.BufferAttribute(pos, 3)
);
geo.setAttribute(
  'color', new THREE.BufferAttribute(col, 3)
);
const galaxy = new THREE.Points(
  geo,
  new THREE.PointsMaterial({
    size: 0.06,
    map: glow,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
);
scene.add(galaxy);

const core = new THREE.Color('#ffb36b');
const edge = new THREE.Color('#5b6cff');
for (let i = 0; i < COUNT; i++) {
  const r = Math.random() ** 2 * 5;
  const arm = (i % ARMS) / ARMS * Math.PI * 2;
  const angle = arm + r * 0.9;
  const jitter = () =>
    (Math.random() - 0.5) ** 3 * 4 * (1 - r / 7);
  pos[i * 3] = Math.cos(angle) * r + jitter();
  pos[i * 3 + 2] = Math.sin(angle) * r + jitter();
  pos[i * 3 + 1] = jitter() * 0.4;
  const c = core.clone().lerp(edge, r / 5);
  col.set([c.r, c.g, c.b], i * 3);
}

// distant background stars
const far = new Float32Array(3000 * 3).map(
  () => (Math.random() - 0.5) * 80
);
const sky = new THREE.BufferGeometry();
sky.setAttribute(
  'position', new THREE.BufferAttribute(far, 3)
);
scene.add(new THREE.Points(sky,
  new THREE.PointsMaterial({
    size: 0.15, map: glow,
    transparent: true, depthWrite: false,
  })));

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  galaxy.rotation.y = t * 0.12;
  camera.position.x = Math.sin(t * 0.2) * 2 * fit;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
});
