import { Redhat } from '../objects/redhat';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export class MainScene extends Phaser.Scene {
  score: number;
  constructor() {
    super({ key: 'MainScene' });
    this.score = 0;
  }

  preload(): void {
    this.load.image('redhat', 'images/redhat.png');
    this.load.image('redParticle', 'images/red.png');
    this.load.image('stairs', 'images/Stairs 5.png');
    this.load.spritesheet('mimic', 'images/mimic attack.png', {
      frameWidth: 23.5,
      frameHeight: 28
    });
    this.load.spritesheet('coin', 'images/coin.png', {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  makeChest(id: string, x: number, y: number, flip?: boolean) {
    const hitarea = this.add.rectangle(x, y, 150, 150).setOrigin(0, 0);
    const cat1 = this.add.rectangle(x, y + 75, 150, 75).setOrigin(0, 0);
    this.physics.add.existing(cat1);
    (cat1.body as any).setImmovable(true).setAllowGravity(false);
    cat1.setDataEnabled();
    cat1.setData('id', id);
    cat1.setData('open', false);

    const mimic = this.add
      .image(x + 15, y, 'mimic')
      .setScale(5)
      .setFlipX(flip)
      .setOrigin(0, 0);

    hitarea.setInteractive();

    hitarea.on('pointerdown', function () {
      cat1.setData('open', true);
      mimic.setFrame(3);
    });
    hitarea.on('pointerout', function () {
      cat1.setData('open', false);
      mimic.setFrame(0);
    });
    hitarea.on('pointerup', function () {
      cat1.setData('open', false);
      mimic.setFrame(0);
    });

    return cat1;
  }

  addCoin(cats: Phaser.GameObjects.Rectangle[]) {
    const coin = new Redhat({
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

    const score = this.add.text(0, 0, `Score: ${this.score}`);

    const cat1 = this.makeChest('left', 100, 500, true);

    const cat2 = this.makeChest('right', 350, 500);

    this.addCoin([cat1, cat2]);

    this.physics.world.on(
      'collide',
      (
        ob1: Phaser.GameObjects.Rectangle,
        ob2: Redhat,
        bod1: Phaser.Physics.Arcade.Body,
        bod2: Phaser.Physics.Arcade.Body
      ) => {
        console.info(
          'what',
          ob1,
          ob2,
          ob1.data.get('open'),
          ob1.data.list.open
        );
        if (ob1.data.get('open')) {
          console.info('DIE');
          score.setText(`Score: ${this.score++}`);
          score.updateText();
          ob2.emitter.stop();
          ob2.destroy(true);

          this.addCoin([cat1, cat2]);
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

        this.addCoin([cat1, cat2]);
      }
    );
  }
}
