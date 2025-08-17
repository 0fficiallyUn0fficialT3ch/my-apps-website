import Phaser from 'phaser';

export default class LanLobby extends Phaser.Scene {
  constructor() {
    super({ key: 'LanLobby' });
    this.ws = null;
    this.statusText = null;
    this.inputBox = null;
    this.connectBtn = null;
    this.sendBtn = null;
    this.messageBox = null;
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    this.add.rectangle(width / 2, height / 2, width, height, 0x111111, 0.95).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 100, 'LAN Play (Local Multiplayer)', {
      font: 'bold 40px Arial',
      fill: '#ffd700',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Server address input
    this.add.text(width / 2 - 120, height / 2 - 30, 'Server:', {
      font: '24px Arial',
      fill: '#fff',
    }).setOrigin(1, 0.5);
    const inputElem = document.createElement('input');
    inputElem.type = 'text';
    inputElem.value = 'ws://localhost:8080';
    inputElem.style.position = 'absolute';
    inputElem.style.left = `${width / 2 - 100}px`;
    inputElem.style.top = `${height / 2 - 45}px`;
    inputElem.style.width = '260px';
    inputElem.style.fontSize = '20px';
    inputElem.style.zIndex = 1000;
    document.body.appendChild(inputElem);
    this.inputBox = inputElem;

    // Connect button
    const connectBtn = this.add.text(width / 2 + 180, height / 2 - 30, 'Connect', {
      font: '24px Arial',
      fill: '#00ff00',
      backgroundColor: '#222',
      padding: { x: 16, y: 8 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    connectBtn.on('pointerdown', () => {
      this.connectToServer(inputElem.value);
    });
    this.connectBtn = connectBtn;

    // Status text
    this.statusText = this.add.text(width / 2, height / 2 + 20, 'Not connected', {
      font: '22px Arial',
      fill: '#ff4444',
    }).setOrigin(0.5);

    // Message input (hidden until connected)
    const msgElem = document.createElement('input');
    msgElem.type = 'text';
    msgElem.placeholder = 'Type a message...';
    msgElem.style.position = 'absolute';
    msgElem.style.left = `${width / 2 - 100}px`;
    msgElem.style.top = `${height / 2 + 60}px`;
    msgElem.style.width = '260px';
    msgElem.style.fontSize = '20px';
    msgElem.style.zIndex = 1000;
    msgElem.style.display = 'none';
    document.body.appendChild(msgElem);
    this.messageBox = msgElem;

    // Send button
    const sendBtn = this.add.text(width / 2 + 180, height / 2 + 75, 'Send', {
      font: '22px Arial',
      fill: '#00aaff',
      backgroundColor: '#222',
      padding: { x: 12, y: 6 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    sendBtn.setVisible(false);
    sendBtn.on('pointerdown', () => {
      if (this.ws && this.ws.readyState === 1 && msgElem.value) {
        this.ws.send(msgElem.value);
        msgElem.value = '';
      }
    });
    this.sendBtn = sendBtn;

    // Back button
    const backBtn = this.add.text(width / 2, height - 100, 'Back to Menu', {
      font: '28px Arial',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.cleanupDomInputs();
      this.scene.start('StartMenu');
      this.scene.stop('LanLobby');
    });
  }

  connectToServer(address) {
    if (this.ws) {
      this.ws.close();
    }
    this.ws = new window.WebSocket(address);
    this.statusText.setText('Connecting...').setFill('#ffaa00');
    this.ws.onopen = () => {
      this.statusText.setText('Connected!').setFill('#00ff00');
      this.messageBox.style.display = '';
      this.sendBtn.setVisible(true);
    };
    this.ws.onclose = () => {
      this.statusText.setText('Disconnected').setFill('#ff4444');
      this.messageBox.style.display = 'none';
      this.sendBtn.setVisible(false);
    };
    this.ws.onerror = () => {
      this.statusText.setText('Connection error').setFill('#ff4444');
      this.messageBox.style.display = 'none';
      this.sendBtn.setVisible(false);
    };
    this.ws.onmessage = (event) => {
      alert('Received: ' + event.data);
    };
  }

  cleanupDomInputs() {
    if (this.inputBox) {
      document.body.removeChild(this.inputBox);
      this.inputBox = null;
    }
    if (this.messageBox) {
      document.body.removeChild(this.messageBox);
      this.messageBox = null;
    }
  }

  shutdown() {
    this.cleanupDomInputs();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  destroy() {
    this.shutdown();
    super.destroy();
  }
}
