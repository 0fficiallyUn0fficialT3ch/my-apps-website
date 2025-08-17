import Phaser from 'phaser';

const CHARACTERS = [
  { key: 'knight', name: 'KNIGHT', color: '#4fc3f7' },
  { key: 'fighter', name: 'FIGHTER', color: '#ffb74d' },
  { key: 'warrior', name: 'WARRIOR', color: '#81c784' },
];

export default class CharacterSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelect' });
  }

  preload() {}

  create(data = {}) {
    console.log('CharacterSelect create method called with data:', data);
    const playerMode = data.playerMode || 'single';
    const selectedCharacters = [];
    const { width, height } = this.sys.game.canvas;
    
    this.add.text(width / 2, height / 2 - 120, playerMode === 'multiplayer' ? 'Pick Characters (2 Players)' : 'Pick Your Character', {
      font: 'bold 44px Arial',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Add player mode indicator
    if (playerMode === 'multiplayer') {
      this.add.text(width / 2, height / 2 - 80, 'Player 1: WASD + Space | Player 2: Numpad + Enter', {
        font: '16px Arial',
        fill: '#ff6b35',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    }

    CHARACTERS.forEach((char, i) => {
      // Placeholder icon: colored circle
      const iconX = width / 2 - 80;
      const iconY = height / 2 - 30 + i * 70;
      const icon = this.add.circle(iconX, iconY, 28, Phaser.Display.Color.HexStringToColor(char.color).color);
      icon.setStrokeStyle(4, 0x222222);
      // Name text
      const nameText = this.add.text(iconX + 60, iconY, char.name, {
        font: '32px Arial',
        fill: char.color,
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0, 0.5);
      // Make all characters interactive
      icon.setInteractive({ useHandCursor: true });
      nameText.setInteractive({ useHandCursor: true });
      
      const selectCharacter = () => {
        if (playerMode === 'single') {
          // Single player - start game immediately
          this.scene.start('IsoScene', { character: char.key, playerMode: 'single' });
          this.scene.stop('CharacterSelect');
        } else {
          // Multiplayer - add to selection
          if (selectedCharacters.length < 2) {
            selectedCharacters.push(char.key);
            
            // Visual feedback for selection
            icon.setStrokeStyle(6, 0xffff00);
            nameText.setColor('#ffff00');
            
            // Show selection status
            const statusText = this.add.text(iconX + 200, iconY, `Player ${selectedCharacters.length}`, {
              font: '20px Arial',
              fill: '#ffff00',
              stroke: '#000',
              strokeThickness: 2,
            }).setOrigin(0, 0.5);
            
            // If both characters selected, start game
            if (selectedCharacters.length === 2) {
              this.time.delayedCall(1000, () => {
                this.scene.start('IsoScene', { 
                  character: selectedCharacters[0], 
                  player2Character: selectedCharacters[1],
                  playerMode: 'multiplayer' 
                });
        this.scene.stop('CharacterSelect');
              });
            }
          }
        }
      };
      
      icon.on('pointerdown', selectCharacter);
      nameText.on('pointerdown', selectCharacter);
    });

    // Back button
    const backBtn = this.add.text(width / 2, height / 2 + (playerMode === 'multiplayer' ? 220 : 180), 'Back', {
      font: '32px Arial',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.scene.start('StartMenu');
      this.scene.stop('CharacterSelect');
    });
  }
} 