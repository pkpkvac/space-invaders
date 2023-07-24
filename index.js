const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#scoreEl");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const SHIP_VELOCITY = 20;
const ROTATION = 0.3;
const SHIP_PROJECTILE = 20;

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.rotation = 0;
    this.opacity = 1;

    const image = new Image();
    image.src = "./img/spaceship.png";
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  draw() {
    c.save();

    c.globalAlpha = this.opacity;

    c.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );

    c.rotate(this.rotation);

    c.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    // if (this.image)

    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.fades) this.opacity -= 0.01;
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "white";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "./img/invader.png";
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 10,
        },
      })
    );
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 3,
      y: 0,
    };

    this.invaders = [];

    const rows = Math.floor(Math.random() * 5 + 2);
    const columns = Math.floor(Math.random() * 10 + 5);

    this.width = columns * 30;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 30,
              y: y * 30,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class Bomb {
  static radius = 30;
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 30;
    this.color = "red";
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.closePath();
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (
      this.position.x + this.radius + this.velocity.x >= canvas.width ||
      this.position.x - this.radius + this.velocity.x <= 0
    ) {
      this.velocity.x = -this.velocity.x;
    } else if (
      this.position.y + this.radius + this.velocity.y >= canvas.height ||
      this.position.y - this.radius + this.velocity.y <= 0
    ) {
      this.velocity.y = -this.velocity.y;
    }
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const player = new Player();
const projectiles = [];
const invaderProjectiles = [];
const particles = [];
const grids = [];
const bombs = [
  new Bomb({
    position: {
      x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
      y: randomBetween(Bomb.radius, canvas.height - Bomb.radius),
    },
    velocity: {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
    },
  }),
  new Bomb({
    position: {
      x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
      y: randomBetween(Bomb.radius, canvas.height - Bomb.radius),
    },
    velocity: {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
    },
  }),
];

const keys = {
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
  over: false,
  active: true,
};

let score = 0;

// Create stars
for (let i = 0; i < 150; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.4,
      },
      radius: Math.random() * 2,
      color: "white",
    })
  );
}

function createParticles({ object, color, fades }) {
  for (let i = 0; i < 16; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 10,
        color: color || "#BAA0DE",
        fades,
      })
    );
  }
}

function animate() {
  if (!game.active) return;

  requestAnimationFrame(animate);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  //   c.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    bomb.update();
  }

  player.update();

  particles.forEach((particle, index) => {
    // regen stars
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else invaderProjectile.update();

    if (
      invaderProjectile.position.y + invaderProjectile.height >=
        player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >=
        player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      // You lose
      // projectile hits player

      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;
      }, 0);

      setTimeout(() => {
        game.active = false;
      }, 2000);

      createParticles({ object: player, color: "white", fades: true });
    }
  });

  // TIME IS 24:15

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    for (let j = bombs.length - 1; j >= 0; j--) {
      const bomb = bombs[j];

      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) <
        projectile.radius + bomb.radius
      ) {
        // if bomb touches projectile, remove bomb
        projectiles.splice(j, 1);
      }
    }

    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(i, 1);
    } else {
      projectile.update();
    }
  }

  grids.forEach((grid, gridIndex) => {
    grid.update();

    // spawn projectiles
    // reduce % 100 for faster invader projectiles
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

      // projectiles hit enemy
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find(
              (invader2) => invader2 === invader
            );

            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile
            );

            // remove invader and projectile
            if (invaderFound && projectileFound) {
              score += 100;
              scoreEl.innerHTML = score;

              // dynamic score labels
              const scoreLabel = document.createElement("label");
              scoreLabel.innerHTML = "+100";
              scoreLabel.style.position = "absolute";
              scoreLabel.style.color = "white";
              scoreLabel.style.top = invader.position.y + "px";
              scoreLabel.style.left = invader.position.x + "px";
              scoreLabel.style.userSelect = "none";

              document.querySelector("#parentDiv").appendChild(scoreLabel);

              gsap.to(scoreLabel, {
                opacity: 0,
                y: -30,
                duration: 0.75,
                onComplete: () => {
                  document.querySelector("#parentDiv").removeChild(scoreLabel);
                },
              });

              // invader explodes
              createParticles({ object: invader, fades: true });

              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });
    });
  });

  if (keys.ArrowLeft.pressed && player.position.x >= 0) {
    player.velocity.x = -SHIP_VELOCITY;
    player.rotation = -ROTATION;
  } else if (
    keys.ArrowRight.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = SHIP_VELOCITY;
    player.rotation = ROTATION;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  // spawning enemies
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + 500);
    frames = 0;
  }

  frames++;
}

animate();

window.addEventListener("keydown", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      break;
    case " ":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: { x: 0, y: -SHIP_PROJECTILE },
        })
      );
      console.log(projectiles);
      //   keys.space.pressed = true;
      break;
  }
});

window.addEventListener("keyup", ({ key }) => {
  console.log(key);
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case " ":
      console.log("fire");
      // keys.space.pressed = true;
      break;
  }
});
