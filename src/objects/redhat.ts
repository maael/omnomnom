import { IImageConstructor } from '../interfaces/image.interface';

export class Redhat extends Phaser.GameObjects.Image {
  body: Phaser.Physics.Arcade.Body;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    aParams: IImageConstructor & { velocity: { x: number; y: number } }
  ) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    this.initSprite();
    this.initPhysics({ velocity: aParams.velocity });
    const result = this.scene.add.existing(this);

    const particles = this.scene.add.particles('redParticle');
    this.emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD'
    });

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
