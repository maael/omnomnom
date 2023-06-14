import { Coin } from '../objects/coin';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export class MainScene extends Phaser.Scene {
  score: number;
  health: number;
  coinSpawner: number;
  constructor() {
    super({ key: 'MainScene' });
    this.score = 0;
    this.health = 2;
  }

  preload(): void {
    this.load.image('redhat', 'images/redhat.png');
    this.load.image('goldParticle', 'images/gold-particle.png');
    this.load.image('redParticle', 'images/red-particle.png');
    this.load.image('stairs', 'images/Stairs 5.png');
    this.load.spritesheet('mimic', 'images/mimic attack.png', {
      frameWidth: 23.5,
      frameHeight: 28
    });
    this.load.spritesheet('coin', 'images/coin.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('bomb', 'images/bomb.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image('chest-silver', 'images/chest-silver-idle-1.png');
    this.load.image('chest-silver-open', 'images/chest-silver-open-1.png');
    this.load.image('chest-silver-dead', 'images/chest-silver-dead-1.png');
  }

  makeChest(id: string, x: number, y: number, flip?: boolean) {
    const container = this.add.container(x, y);

    const hitarea = this.add.rectangle(0, 0, 150, 150).setOrigin(0, 0);
    const cat1 = this.add.rectangle(10, 75, 125, 75).setOrigin(0, 0);
    this.physics.add.existing(cat1);
    (cat1.body as any).setImmovable(true).setAllowGravity(false);
    cat1.setDataEnabled();
    cat1.setData('id', id);
    cat1.setData('open', false);
    cat1.data.set('alive', true);

    const mimic = this.add.image(-35, -10, 'chest-silver');

    const mimicWidth = 220;
    const mimicRatio = mimic.height / mimic.width;
    mimic
      .setDisplaySize(mimicWidth, mimicRatio * mimicWidth)
      .setFlipX(flip)
      .setOrigin(0, 0);

    hitarea.setInteractive();

    hitarea.on('pointerdown', function () {
      if (!cat1.getData('alive')) return;
      cat1.setData('open', true);
      mimic.setFrame(3);
      mimic.setTexture('chest-silver-open');
    });
    hitarea.on('pointerout', function () {
      if (!cat1.getData('alive')) return;
      cat1.setData('open', false);
      mimic.setFrame(0);
      mimic.setTexture('chest-silver');
    });
    hitarea.on('pointerup', function () {
      if (!cat1.getData('alive')) return;
      cat1.setData('open', false);
      mimic.setFrame(0);
      mimic.setTexture('chest-silver');
    });

    container.add([hitarea, cat1, mimic]);

    return cat1;
  }

  addItem(type: string, cats: Phaser.GameObjects.Rectangle[]) {
    const coin = new Coin({
      scene: this,
      x: getRandomInt(200, 500),
      y: 0,
      texture: type,
      velocity: {
        x: getRandomInt(-300, 300),
        y: getRandomInt(100, 300)
      }
    });

    cats.forEach((cat) => {
      this.physics.add.collider(cat, coin);
    });
  }

  create(): void {
    this.add.image(0, -6, 'stairs').setOrigin(0, 0).setDisplaySize(600, 808);

    const score = this.add.text(0, 40, `Score: ${this.score}`, {
      fontSize: '32px',
      align: 'center',
      fixedWidth: 600,
      color: 'gold'
    });

    const health = this.add.text(0, 80, `Health: ${this.health}`, {
      fontSize: '32px',
      align: 'center',
      fixedWidth: 600,
      color: 'red'
    });

    const fullscreen = this.add.text(0, 0, `[]`, {
      fontSize: '16px',
      align: 'right',
      fixedWidth: 600,
      color: 'white'
    });

    fullscreen.setInteractive();
    fullscreen.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    const cat1 = this.makeChest('left', 100, 500, true);

    const cat2 = this.makeChest('right', 350, 500);

    this.coinSpawner ||= setInterval(() => {
      const rnd = getRandomInt(0, 100);
      if (rnd > 50) {
        this.addItem('bomb', [cat1, cat2]);
      } else {
        this.addItem('coin', [cat1, cat2]);
      }
    }, 2_000);

    this.physics.world.on(
      'collide',
      (
        ob1: Phaser.GameObjects.Rectangle,
        ob2: Coin,
        bod1: Phaser.Physics.Arcade.Body,
        bod2: Phaser.Physics.Arcade.Body
      ) => {
        if (ob1.data.get('open') && ob1.data.get('alive') && bod1.touching.up) {
          const type = ob2.data.get('type');
          if (type === 'coin') {
            this.score = this.score + 1;
            score.setText(`Score: ${this.score}`);
            score.updateText();
          } else if (type === 'bomb') {
            this.health = Math.max(0, this.health - 1);
            health.setText(`Health: ${this.health}`);
            health.updateText();
            const img = ob1.parentContainer.list.find(
              (l) => l.type === 'Image'
            ) as Phaser.GameObjects.Image;
            img.setTexture('chest-silver-dead');
            ob1.data.set('alive', false);
          }
          console.info(ob1);
          ob2.emitter.stop();
          this.time.delayedCall(3_000, () => {
            ob2.emitter.remove();
          });
          ob2.destroy(true);
        }
      }
    );

    this.physics.world.on(
      'worldbounds',
      (
        body: Phaser.Physics.Arcade.Body,
        _up: boolean,
        down: boolean,
        _left: boolean,
        _right: boolean
      ) => {
        if (!down) return;
        (body.gameObject as any).emitter.stop();
        body.gameObject.destroy(true);
      }
    );
  }
}
