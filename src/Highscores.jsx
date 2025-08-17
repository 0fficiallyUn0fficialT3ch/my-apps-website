import Phaser from 'phaser';

export default class Highscores extends Phaser.Scene {
  constructor() {
    super({ key: 'Highscores' });
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.canvas;
    this.add.text(width / 2, height / 2 - 120, 'Highscores', {
      font: 'bold 44px Arial',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Placeholder highscores list
    const scores = [
      { name: 'AAA', score: 1000 },
      { name: 'BBB', score: 800 },
      { name: 'CCC', score: 600 },
      { name: 'DDD', score: 400 },
      { name: 'EEE', score: 200 },
    ];
    scores.forEach((entry, i) => {
      this.add.text(width / 2, height / 2 - 40 + i * 36, `${i + 1}. ${entry.name} - ${entry.score}`, {
        font: '28px Arial',
        fill: '#ff0',
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0.5);
    });

    // Back button
    const backBtn = this.add.text(width / 2, height / 2 + 180, 'Back', {
      font: '32px Arial',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.scene.start('StartMenu');
      this.scene.stop('Highscores');
    });
  }
} 