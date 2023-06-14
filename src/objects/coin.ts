import { IImageConstructor } from '../interfaces/image.interface';

export class Coin extends Phaser.GameObjects.Image {
  body: Phaser.Physics.Arcade.Body;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    aParams: IImageConstructor & { velocity: { x: number; y: number } }
  ) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    this.initSprite();
    this.initPhysics({ velocity: aParams.velocity });

    const particles = this.scene.add.particles('goldParticle');
    this.emitter = particles.createEmitter({
      speed: 50,
      scale: { start: 0.3, end: 0 },
      blendMode: 'ADD'
    });

    const result = this.scene.add.existing(this);

    this.emitter.startFollow(result);

    return result;
  }

  private initSprite() {
    this.setScale(2);
  }

  private initPhysics(opts: { velocity: { x: number; y: number } }) {
    this.scene.physics.world.enable(this);
    this.body.setVelocity(opts.velocity.x, opts.velocity.y);
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
    this.body.onCollide = true;
  }
}
