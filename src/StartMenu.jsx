import Phaser from 'phaser';

export default class StartMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'StartMenu' });
  }

  preload() {
    console.log('StartMenu preload - loading background image...');
    // Load the background image
    this.load.image('titleBackground', './20250719_2340_Knight in Dark Cemetery_remix_01k0jygx76fmpvg66ntyjz665j.png');
    
    // Add error handling for image loading
    this.load.on('loaderror', (file) => {
      console.error('Failed to load image:', file.src);
    });
    
    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
    });
  }

  create() {
    console.log('StartMenu create method called');
    const { width, height } = this.sys.game.canvas;
    
    // Add background image with error handling
    try {
      const background = this.add.image(width / 2, height / 2 + 100, 'titleBackground');
      // Stretch to fill screen, maintaining aspect ratio but prioritizing height
      const scaleX = width / background.width;
      const scaleY = height / background.height;
      const scale = Math.max(scaleX, scaleY) * 0.81; // Use the larger scale to ensure full coverage, then shrink by 19% (0.9 * 0.9)
      background.setScale(scale);
      background.setDepth(0);
      console.log('Background image loaded successfully');
    } catch (error) {
      console.error('Failed to load background image:', error);
      // Fallback: create a dark background
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a1a, 1);
      bg.fillRect(0, 0, width, height);
      bg.setDepth(0);
      console.log('Using fallback dark background');
    }
    
    // Create title text with Cinzel font
    this.add.text(width / 2, height / 2 - 100, 'Skulls & Daggers', {
      font: 'bold 48px Cinzel',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(10);

    // Start Game button
    const startBtn = this.add.text(width / 2, height / 2, 'Start Game (1 Player)', {
      font: '32px Arial',
      fill: '#0f0',
      backgroundColor: '#222',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    startBtn.on('pointerdown', () => {
      this.scene.start('CharacterSelect', { playerMode: 'single' });
      this.scene.stop('StartMenu');
    });

    // 2 Player Game button
    const twoPlayerBtn = this.add.text(width / 2, height / 2 + 60, 'Start Game (2 Players)', {
      font: '32px Arial',
      fill: '#ff6b35',
      backgroundColor: '#222',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    twoPlayerBtn.on('pointerdown', () => {
      this.scene.start('CharacterSelect', { playerMode: 'multiplayer' });
      this.scene.stop('StartMenu');
    });

    // Highscores button
    const highBtn = this.add.text(width / 2, height / 2 + 120, 'Highscores', {
      font: '28px Arial',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    highBtn.on('pointerdown', () => {
      this.scene.start('Highscores');
      this.scene.stop('StartMenu');
    });
    
    // Load button (underneath Highscores)
    const loadBtn = this.add.text(width / 2, height / 2 + 180, 'Load', {
      font: '28px Arial',
      fill: '#00aaff',
      backgroundColor: '#333',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    loadBtn.on('pointerdown', () => {
      this.showLoadMenu();
    });

    // Play on LAN button
    const lanBtn = this.add.text(width / 2, height / 2 + 240, 'Play on LAN', {
      font: '28px Arial',
      fill: '#ffd700',
      backgroundColor: '#222',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    lanBtn.on('pointerdown', () => {
      this.scene.start('LanLobby');
      this.scene.stop('StartMenu');
    });
  }

  // Get all save games
  getAllSaveGames() {
    try {
      const saves = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('isometricGameSave_')) {
          try {
            const saveData = JSON.parse(localStorage.getItem(key));
            const saveName = key.replace('isometricGameSave_', '');
            saves.push({
              name: saveName,
              timestamp: saveData.timestamp,
              player: saveData.player,
              date: new Date(saveData.timestamp)
            });
          } catch (e) {
            console.error('Error parsing save data for key:', key, e);
          }
        }
      }
      return saves.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    } catch (error) {
      console.error('Error getting save games:', error);
      return [];
    }
  }
  
  // Check if save game exists
  hasSaveGame() {
    try {
      const saves = this.getAllSaveGames();
      return saves.length > 0;
    } catch (error) {
      console.error('Error checking save games:', error);
      return false;
    }
  }
  
  // Delete save function
  deleteSave(saveName) {
    try {
      const saveKey = `isometricGameSave_${saveName}`;
      const wasDeleted = localStorage.removeItem(saveKey);
      console.log('Save deleted:', saveName, 'Success:', wasDeleted !== null);
      
      // Refresh the load menu
      this.showLoadMenu();
      return true;
    } catch (error) {
      console.error('Error deleting save:', error);
      return false;
    }
  }
  
  // Show load menu
  showLoadMenu() {
    // Store reference to this scene for the load menu
    const startMenuScene = this;
    
    // Create a simple overlay instead of a new scene
    const { width, height } = this.sys.game.canvas;
    
    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, width, height);
    overlay.setScrollFactor(0).setDepth(50);
    
    // Title
    const title = this.add.text(width / 2, 100, 'LOAD GAME', {
      font: 'bold 48px Arial',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
    
    // Get save games
    const saveGames = this.getAllSaveGames();
    const loadMenuElements = [overlay, title];
    
    if (saveGames.length > 0) {
      // Display save games (max 3)
      saveGames.slice(0, 3).forEach((save, index) => {
        const yPos = 200 + (index * 60);
        const saveText = `${save.name} - ${save.date.toLocaleDateString()} ${save.date.toLocaleTimeString()}`;
        
        // Save button container
        const container = this.add.container(width / 2, yPos);
        container.setScrollFactor(0).setDepth(51);
        
        // Save button background
        const saveBg = this.add.graphics();
        saveBg.fillStyle(0x222222, 1);
        saveBg.fillRoundedRect(-200, -20, 400, 40, 5);
        saveBg.lineStyle(2, 0x00aaff, 1);
        saveBg.strokeRoundedRect(-200, -20, 400, 40, 5);
        
        // Save text
        const saveBtn = this.add.text(0, 0, saveText, {
          font: '20px Arial',
          fill: '#00aaff',
        }).setOrigin(0.5);
        
        // Delete button (X)
        const deleteBtn = this.add.text(170, -10, '✕', {
          font: 'bold 18px Arial',
          fill: '#ff4444',
          backgroundColor: '#333',
          padding: { x: 8, y: 4 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Add all elements to container
        container.add([saveBg, saveBtn, deleteBtn]);
        container.setInteractive(new Phaser.Geom.Rectangle(-200, -20, 400, 40), Phaser.Geom.Rectangle.Contains);
        
        // Load save on click
        container.on('pointerdown', () => {
          // Clean up load menu
          loadMenuElements.forEach(element => element.destroy());
          this.scene.start('IsoScene', { loadGame: true, saveName: save.name });
          this.scene.stop('StartMenu');
        });
        
        // Delete save on X click
        deleteBtn.on('pointerdown', (pointer) => {
          pointer.event.stopPropagation(); // Prevent triggering the load
          if (confirm(`Are you sure you want to delete save "${save.name}"?`)) {
            this.deleteSave(save.name);
            // Clean up and refresh
            loadMenuElements.forEach(element => element.destroy());
            this.showLoadMenu();
          }
        });
        
        loadMenuElements.push(container);
      });
      
      // Add "New Save" button if less than 3 saves
      if (saveGames.length < 3) {
        const newSaveBtn = this.add.text(width / 2, 200 + (saveGames.length * 60), 'Create New Save', {
          font: '24px Arial',
          fill: '#00ff00',
          backgroundColor: '#222',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setInteractive({ useHandCursor: true });
        
        newSaveBtn.on('pointerdown', () => {
          // Clean up load menu
          loadMenuElements.forEach(element => element.destroy());
          this.scene.start('IsoScene', { playerMode: 'single' });
          this.scene.stop('StartMenu');
        });
        
        loadMenuElements.push(newSaveBtn);
      }
    } else {
      // No saves message
      const noSavesText = this.add.text(width / 2, height / 2, 'No save games found', {
        font: '32px Arial',
        fill: '#666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
      
      // Create New Save button
      const newSaveBtn = this.add.text(width / 2, height / 2 + 60, 'Create New Save', {
        font: '24px Arial',
        fill: '#00ff00',
        backgroundColor: '#222',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setInteractive({ useHandCursor: true });
      
      newSaveBtn.on('pointerdown', () => {
        // Clean up load menu
        loadMenuElements.forEach(element => element.destroy());
        this.scene.start('IsoScene', { playerMode: 'single' });
        this.scene.stop('StartMenu');
      });
      
      loadMenuElements.push(noSavesText, newSaveBtn);
    }
    
    // Back button
    const backBtn = this.add.text(width / 2, height - 100, 'Back to Menu', {
      font: '24px Arial',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerdown', () => {
      // Clean up load menu
      loadMenuElements.forEach(element => element.destroy());
    });
    
    loadMenuElements.push(backBtn);
  }
} 