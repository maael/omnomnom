import { Coin } from '../objects/coin';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export class MainScene extends Phaser.Scene {
  score: number;
  coinSpawner: number;
  constructor() {
    super({ key: 'MainScene' });
    this.score = 0;
  }

  preload(): void {
    this.load.image('redhat', 'images/redhat.png');
    this.load.image('goldParticle', 'images/gold-particle.png');
    this.load.image('stairs', 'images/Stairs 5.png');
    this.load.spritesheet('mimic', 'images/mimic attack.png', {
      frameWidth: 23.5,
      frameHeight: 28
    });
    this.load.spritesheet('coin', 'images/coin.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image('chest-silver', 'images/chest-silver-idle-1.png');
    this.load.image('chest-silver-open', 'images/chest-silver-open-1.png');
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

    const mimic = this.add.image(-35, -10, 'chest-silver');

    const mimicWidth = 220;
    const mimicRatio = mimic.height / mimic.width;
    mimic
      .setDisplaySize(mimicWidth, mimicRatio * mimicWidth)
      .setFlipX(flip)
      .setOrigin(0, 0);

    hitarea.setInteractive();

    hitarea.on('pointerdown', function () {
      cat1.setData('open', true);
      mimic.setFrame(3);
      mimic.setTexture('chest-silver-open');
    });
    hitarea.on('pointerout', function () {
      cat1.setData('open', false);
      mimic.setFrame(0);
      mimic.setTexture('chest-silver');
    });
    hitarea.on('pointerup', function () {
      cat1.setData('open', false);
      mimic.setFrame(0);
      mimic.setTexture('chest-silver');
    });

    container.add([hitarea, cat1, mimic]);

    return cat1;
  }

  addCoin(cats: Phaser.GameObjects.Rectangle[]) {
    const coin = new Coin({
      scene: this,
      x: getRandomInt(100, 500),
      y: 0,
      texture: 'coin',
      velocity: {
        x: getRandomInt(-300, 300),
        y: getRandomInt(0, 300)
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
      fixedWidth: 600
    });

    const cat1 = this.makeChest('left', 100, 500, true);

    const cat2 = this.makeChest('right', 350, 500);

    this.coinSpawner ||= setInterval(() => {
      this.addCoin([cat1, cat2]);
    }, 2_000);

    this.physics.world.on(
      'collide',
      (
        ob1: Phaser.GameObjects.Rectangle,
        ob2: Coin,
        bod1: Phaser.Physics.Arcade.Body,
        bod2: Phaser.Physics.Arcade.Body
      ) => {
        if (ob1.data.get('open') && bod1.touching.up) {
          this.score = this.score + 1;
          score.setText(`Score: ${this.score}`);
          score.updateText();
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
