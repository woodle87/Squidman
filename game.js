// Ragdoll Sword Duel - Stable Physics, Player is Red, Bot is Blue

const { Engine, Render, Runner, World, Bodies, Body, Constraint, Composite, Events, Vector } = Matter;

const width = 900;
const height = 600;
const canvas = document.getElementById('gameCanvas');

const engine = Engine.create();
const world = engine.world;
engine.gravity.y = 0.7; // Less gravity for floatier movement

// More stable physics for walls/ground/roof
const staticPhysicsOpts = {
  isStatic: true,
  restitution: 0.08, // Low bounce
  friction: 0.6,
  frictionStatic: 0.8,
  slop: 0.1, // Slight buffer to prevent sticking, but not too large
  render: { fillStyle: "#666" }
};
const roofPhysicsOpts = {
  ...staticPhysicsOpts,
  render: { fillStyle: "#e0e048" }
};

const ground = Bodies.rectangle(width / 2, height - 20, width, 40, staticPhysicsOpts);
const roof = Bodies.rectangle(width / 2, 24, width, 48, roofPhysicsOpts);
const leftWall = Bodies.rectangle(0, height / 2, 40, height, staticPhysicsOpts);
const rightWall = Bodies.rectangle(width, height / 2, 40, height, staticPhysicsOpts);
World.add(world, [ground, roof, leftWall, rightWall]);

function createRagdoll(x, y, color = "#fff", swordColor = "#ff0") {
  const bodyOpts = { restitution: 0.08, friction: 0.5, frictionStatic: 0.8, slop: 0.1, render: { fillStyle: color } };
  const head = Bodies.circle(x, y - 70, 18, bodyOpts);
  const torso = Bodies.rectangle(x, y - 30, 16, 48, { ...bodyOpts, chamfer: { radius: 8 } });
  const upperArmL = Bodies.rectangle(x - 22, y - 40, 32, 10, { ...bodyOpts, chamfer: { radius: 5 } });
  const upperArmR = Bodies.rectangle(x + 22, y - 40, 32, 10, { ...bodyOpts, chamfer: { radius: 5 } });
  const lowerArmL = Bodies.rectangle(x - 42, y - 40, 28, 10, { ...bodyOpts, chamfer: { radius: 5 } });
  const lowerArmR = Bodies.rectangle(x + 42, y - 40, 28, 10, { ...bodyOpts, chamfer: { radius: 5 } });
  const handL = Bodies.circle(x - 56, y - 40, 8, bodyOpts);
  const handR = Bodies.circle(x + 56, y - 40, 8, bodyOpts);
  const upperLegL = Bodies.rectangle(x - 10, y + 8, 12, 32, { ...bodyOpts, chamfer: { radius: 5 } });
  const upperLegR = Bodies.rectangle(x + 10, y + 8, 12, 32, { ...bodyOpts, chamfer: { radius: 5 } });
  const lowerLegL = Bodies.rectangle(x - 10, y + 34, 12, 26, { ...bodyOpts, chamfer: { radius: 5 } });
  const lowerLegR = Bodies.rectangle(x + 10, y + 34, 12, 26, { ...bodyOpts, chamfer: { radius: 5 } });
  const footL = Bodies.circle(x - 10, y + 50, 8, bodyOpts);
  const footR = Bodies.circle(x + 10, y + 50, 8, bodyOpts);

  // Sword: attached to right hand (handR)
  const sword = Bodies.rectangle(x + 76, y - 40, 60, 8,
    { density: 0.005, chamfer: { radius: 2 }, restitution: 0.08, friction: 0.5, slop: 0.1, render: { fillStyle: swordColor } });
  const swordConstraint = Constraint.create({
    bodyA: handR,
    pointA: { x: 6, y: 0 },
    bodyB: sword,
    pointB: { x: -25, y: 0 },
    length: 0,
    stiffness: 0.85
  });

  // Constraints (joints)
  const parts = [
    head, torso, upperArmL, upperArmR, lowerArmL, lowerArmR, handL, handR,
    upperLegL, upperLegR, lowerLegL, lowerLegR, footL, footR, sword
  ];
  const constraints = [
    Constraint.create({ bodyA: head, pointA: { x: 0, y: 18 }, bodyB: torso, pointB: { x: 0, y: -24 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: { x: -8, y: -20 }, bodyB: upperArmL, pointB: { x: 16, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: { x: 8, y: -20 }, bodyB: upperArmR, pointB: { x: -16, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperArmL, pointA: { x: -16, y: 0 }, bodyB: lowerArmL, pointB: { x: 14, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperArmR, pointA: { x: 16, y: 0 }, bodyB: lowerArmR, pointB: { x: -14, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerArmL, pointA: { x: -14, y: 0 }, bodyB: handL, pointB: { x: 0, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerArmR, pointA: { x: 14, y: 0 }, bodyB: handR, pointB: { x: 0, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: { x: -6, y: 24 }, bodyB: upperLegL, pointB: { x: 0, y: -14 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: torso, pointA: { x: 6, y: 24 }, bodyB: upperLegR, pointB: { x: 0, y: -14 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperLegL, pointA: { x: 0, y: 14 }, bodyB: lowerLegL, pointB: { x: 0, y: -13 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: upperLegR, pointA: { x: 0, y: 14 }, bodyB: lowerLegR, pointB: { x: 0, y: -13 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerLegL, pointA: { x: 0, y: 13 }, bodyB: footL, pointB: { x: 0, y: 0 }, length: 2, stiffness: 0.6 }),
    Constraint.create({ bodyA: lowerLegR, pointA: { x: 0, y: 13 }, bodyB: footR, pointB: { x: 0, y: 0 }, length: 2, stiffness: 0.6 }),
    swordConstraint
  ];

  const ragdoll = Composite.create({ bodies: parts, constraints: constraints });
  World.add(world, ragdoll);

  return {
    parts, ragdoll, head, torso, upperArmL, upperArmR, lowerArmL, lowerArmR,
    handL, handR, footL, footR, sword, swordConstraint,
    allBodyParts: [
      { name: "head", body: head },
      { name: "torso", body: torso },
      { name: "upperArmL", body: upperArmL },
      { name: "upperArmR", body: upperArmR },
      { name: "lowerArmL", body: lowerArmL },
      { name: "lowerArmR", body: lowerArmR },
      { name: "handL", body: handL },
      { name: "handR", body: handR },
      { name: "upperLegL", body: upperLegL },
      { name: "upperLegR", body: upperLegR },
      { name: "lowerLegL", body: lowerLegL },
      { name: "lowerLegR", body: lowerLegR },
      { name: "footL", body: footL },
      { name: "footR", body: footR }
    ]
  };
}

// Player (red) and bot (blue)
const player = createRagdoll(180, height - 120, "#f44", "#fff");
const bot = createRagdoll(width - 180, height - 120, "#36f", "#ff2222");

// Health
let playerHealth = 100;
let botHealth = 100;

// Keyboard controls
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

// Mouse for sword aim and jumping/dash
let mouse = { x: width / 2, y: height / 2 };
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (width / rect.width);
  mouse.y = (e.clientY - rect.top) * (height / rect.height);
});

// Mini dash cooldown (1.5 seconds at 60fps = 90 frames)
let dashCooldown = 0;
let dashCooldownTime = 90;

Events.on(engine, 'beforeUpdate', function () {
  // Move left/right (A/D)
  if (keys['a']) {
    Body.applyForce(player.torso, player.torso.position, { x: -0.006, y: 0 });
  }
  if (keys['d']) {
    Body.applyForce(player.torso, player.torso.position, { x: 0.006, y: 0 });
  }

  // Jump (W) from any body part closest to mouse, any time
  if (keys['w']) {
    let closest = player.allBodyParts[0];
    let closestDist = Math.hypot(mouse.x - closest.body.position.x, mouse.y - closest.body.position.y);
    for (const part of player.allBodyParts) {
      let dist = Math.hypot(mouse.x - part.body.position.x, mouse.y - part.body.position.y);
      if (dist < closestDist) {
        closest = part;
        closestDist = dist;
      }
    }
    let dx = closest.body.position.x - mouse.x;
    let dy = closest.body.position.y - mouse.y;
    let mag = Math.hypot(dx, dy) || 1;
    Body.applyForce(closest.body, closest.body.position, { x: dx / mag * 0.16, y: dy / mag * 0.16 });
    keys['w'] = false;
  }

  // Mini dash (Z) towards mouse from torso, with cooldown
  if (keys['z'] && dashCooldown <= 0) {
    let dx = mouse.x - player.torso.position.x;
    let dy = mouse.y - player.torso.position.y;
    let mag = Math.hypot(dx, dy) || 1;
    Body.applyForce(player.torso, player.torso.position, { x: dx / mag * 0.25, y: dy / mag * 0.25 });
    dashCooldown = dashCooldownTime;
    keys['z'] = false;
  }
  if (dashCooldown > 0) dashCooldown--;

  // Sword aims at mouse (rotate upper/lower right arm)
  let armOrigin = player.upperArmR.position;
  let target = mouse;
  let angle = Math.atan2(target.y - armOrigin.y, target.x - armOrigin.x);
  Body.setAngle(player.upperArmR, angle);
  Body.setAngle(player.lowerArmR, angle);
});

setInterval(() => {
  const dx = player.torso.position.x - bot.torso.position.x;
  const dy = player.torso.position.y - bot.torso.position.y;
  const swordToPlayer = Matter.Vector.magnitude(Matter.Vector.sub(bot.sword.position, player.torso.position));
  const playerSwordSpeed = Matter.Vector.magnitude(player.sword.velocity);

  let caution = (playerSwordSpeed > 4 && swordToPlayer < 120 && dx * (player.sword.velocity.x) < 0);
  if (caution) {
    Body.applyForce(bot.torso, bot.torso.position, { x: -0.012 * Math.sign(dx), y: 0 });
  } else {
    Body.applyForce(bot.torso, bot.torso.position, { x: 0.005 * Math.sign(dx), y: 0 });
    if (Math.abs(dx) < 120 && Math.random() < 0.33 && (bot.footL.position.y > height - 55 || bot.footR.position.y > height - 55)) {
      Body.applyForce(bot.torso, bot.torso.position, { x: 0.04 * Math.sign(dx), y: -0.09 - 0.04 * Math.random() });
    }
  }
  if (Math.random() < 0.02 && bot.torso.position.y > 150) {
    Body.applyForce(bot.torso, bot.torso.position, { x: 0.03 * (Math.random() - 0.5), y: -0.12 });
  }

  let armOrigin = bot.upperArmR.position;
  let angle = Math.atan2(player.torso.position.y - armOrigin.y, player.torso.position.x - armOrigin.x);
  Body.setAngle(bot.upperArmR, angle);
  Body.setAngle(bot.lowerArmR, angle);
}, 70);

Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(pair => {
    if (pair.bodyA === player.sword && bot.parts.includes(pair.bodyB)) {
      const speed = Matter.Vector.magnitude(player.sword.velocity);
      if (speed > 2) {
        botHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
    if (pair.bodyB === player.sword && bot.parts.includes(pair.bodyA)) {
      const speed = Matter.Vector.magnitude(player.sword.velocity);
      if (speed > 2) {
        botHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
    if (pair.bodyA === bot.sword && player.parts.includes(pair.bodyB)) {
      const speed = Matter.Vector.magnitude(bot.sword.velocity);
      if (speed > 2) {
        playerHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
    if (pair.bodyB === bot.sword && player.parts.includes(pair.bodyA)) {
      const speed = Matter.Vector.magnitude(bot.sword.velocity);
      if (speed > 2) {
        playerHealth -= Math.min(20, Math.round(speed * 2));
      }
    }
  });
});

Events.on(engine, 'afterUpdate', function () {
  if (playerHealth <= 0 || botHealth <= 0) {
    setTimeout(() => {
      playerHealth = 100;
      botHealth = 100;
      Body.setPosition(player.torso, { x: 180, y: height - 120 });
      Body.setVelocity(player.torso, { x: 0, y: 0 });
      Body.setPosition(bot.torso, { x: width - 180, y: height - 120 });
      Body.setVelocity(bot.torso, { x: 0, y: 0 });
    }, 700);
  }
});

const ctx = canvas.getContext('2d');
function drawHUD() {
  ctx.save();
  ctx.clearRect(0, 0, width, 70);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`You`, 40, 40);
  ctx.fillText(`Bot`, width - 90, 40);
  ctx.fillStyle = "#f44";
  ctx.fillRect(90, 18, Math.max(0, playerHealth * 2), 22);
  ctx.fillStyle = "#36f";
  ctx.fillRect(width - 290, 18, Math.max(0, botHealth * 2), 22);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(90, 18, 200, 22);
  ctx.strokeRect(width - 290, 18, 200, 22);
  if (playerHealth <= 0) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#36f";
    ctx.fillText("Bot Wins!", width / 2 - 110, 60);
  }
  if (botHealth <= 0) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#f44";
    ctx.fillText("You Win!", width / 2 - 110, 60);
  }
  if (dashCooldown > 0) {
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ff0";
    ctx.fillText(`Dash Cooldown: ${(dashCooldown / 60).toFixed(1)}s`, 280, 40);
  }
  ctx.font = "18px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("A/D = move | W = jump from nearest body part | Z = mini dash | Sword aims at mouse", width / 2 - 310, 22);
  ctx.restore();
}

function drawRoofBar() {
  ctx.save();
  ctx.fillStyle = "#e0e048";
  ctx.fillRect(0, 0, width, 48);
  ctx.restore();
}

(function animateHUD() {
  drawRoofBar();
  drawHUD();
  requestAnimationFrame(animateHUD);
})();
