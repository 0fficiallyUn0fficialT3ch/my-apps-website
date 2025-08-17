import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import StartMenu from './StartMenu.jsx';
import Highscores from './Highscores.jsx';
import CharacterSelect from './CharacterSelect.jsx';
import LanLobby from './LanLobby.jsx';

const TILE_PATH = '/assets/Lords Of Pain - Old School Isometric Assets/environment/ground_darken.png';
const TORCH_PATH = '/assets/Lords Of Pain - Old School Isometric Assets/prop/torch/N/torch_N_90.0_0.png';
const ZONE_PATH = '/assets/Lords Of Pain - Old School Isometric Assets/vfx/zone.png';
const FLAME_FRAMES = Array.from({ length: 8 }, (_, i) => `/assets/Lords Of Pain - Old School Isometric Assets/vfx/flame/flame_${i}.png`);
// Restrict to 8 main directions for movement and animation
const DIRECTIONS = [
  { key: 'N', folder: 'N', angle: 90, dx: 0, dy: -1 },
  { key: 'NE', folder: 'NE', angle: 45, dx: 1, dy: -1 },
  { key: 'E', folder: 'E', angle: 0, dx: 1, dy: 0 },
  { key: 'SE', folder: 'SE', angle: 315, dx: 1, dy: 1 },
  { key: 'S', folder: 'S', angle: 270, dx: 0, dy: 1 },
  { key: 'SW', folder: 'SW', angle: 225, dx: -1, dy: 1 },
  { key: 'W', folder: 'W', angle: 180, dx: -1, dy: 0 },
  { key: 'NW', folder: 'NW', angle: 135, dx: -1, dy: -1 },
];
const KNIGHT_WALK_FRAMES = 8;
const KNIGHT_WALK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_armed_walk/${dir}/knight_armed_walk_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const KNIGHT_ATTACK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_armed_attack/${dir}/knight_armed_attack_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const KNIGHT_ATTACK_FRAMES = 8;
const TILE_WIDTH = 256; // actual image size
const TILE_HEIGHT = 256;
const ISO_TILE_WIDTH = 128; // logical isometric tile width
const ISO_TILE_HEIGHT = 64; // logical isometric tile height
const MAP_WIDTH = 80; // logical map width (4x wider)
const MAP_HEIGHT = 20; // logical map height
const EXTRA = 10; // buffer to overfill
const TORCH_COUNT = 5;
const MAP_TOP_BUFFER = 3;
const MAP_BOTTOM_BUFFER = 4;
const MAP_RIGHT_BUFFER = 14;
// Skeleton animation helpers
const ENEMY_DIRECTIONS = [
  { key: 'N', folder: 'N', angle: 90, dx: 0, dy: -1 },
  { key: 'NE', folder: 'NE', angle: 45, dx: 1, dy: -1 },
  { key: 'E', folder: 'E', angle: 0, dx: 1, dy: 0 },
  { key: 'SE', folder: 'SE', angle: 315, dx: 1, dy: 1 },
  { key: 'S', folder: 'S', angle: 270, dx: 0, dy: 1 },
  { key: 'SW', folder: 'SW', angle: 225, dx: -1, dy: 1 },
  { key: 'W', folder: 'W', angle: 180, dx: -1, dy: 0 },
  { key: 'NW', folder: 'NW', angle: 135, dx: -1, dy: -1 },
];
const ENEMY_FRAMES = 8;
const SKELETON_IDLE_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/skeleton/skeleton_default_idle/${dir}/skeleton_default_idle_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const SKELETON_WALK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/skeleton/skeleton_default_walk/${dir}/skeleton_default_walk_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const SKELETON_ATTACK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/skeleton/skeleton_default_attack/${dir}/skeleton_default_attack_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const SKELETON_DEATH_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/skeleton/skeleton_special_death/${dir}/skeleton_special_death_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;

// Slime animation paths
const SLIME_IDLE_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/slime/slime_default_idle/${dir}/slime_default_idle_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const SLIME_WALK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/slime/slime_default_walk/${dir}/slime_default_walk_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const SLIME_DEATH_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/enemy/slime/slime_special_death/${dir}/slime_special_death_${dir}_${ENEMY_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;

const ENEMY_COUNT = 100;
// 1. Add helper for knight death path and frame count
const KNIGHT_DEATH_FRAMES = 8;
const KNIGHT_DEATH_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_special_death/${dir}/knight_special_death_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;

// Fighter animation paths
const FIGHTER_WALK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/fighter/fighter_default_walk/${dir}/fighter_default_walk_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const FIGHTER_ATTACK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/fighter/fighter_armed_attack/${dir}/fighter_armed_attack_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const FIGHTER_DEATH_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/fighter/fighter_special_death/${dir}/fighter_special_death_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;

// Warrior animation paths
const WARRIOR_WALK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/warrior/warrior_default_walk/${dir}/warrior_default_walk_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const WARRIOR_ATTACK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/warrior/warrior_armed_attack/${dir}/warrior_armed_attack_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const WARRIOR_DEATH_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/playable character/warrior/warrior_special_death/${dir}/warrior_special_death_${dir}_${DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;

// Character stats configuration
const CHARACTER_STATS = {
  knight: {
    name: 'Knight',
    health: 100,
    damage: 25,
    attackSpeed: 1.0, // Normal speed
    movementSpeed: 1.0, // Normal speed
    description: 'Balanced warrior',
    ability: {
      name: 'Shield Bash',
      key: 'E',
      cooldown: 10000, // 10 seconds
      effect: 'shield',
      description: 'Creates a protective shield'
    }
  },
  fighter: {
    name: 'Fighter',
    health: 75,
    damage: 35,
    attackSpeed: 1.5, // Fast attacks
    movementSpeed: 1.2, // Fast movement
    description: 'High damage, low health',
    ability: {
      name: 'Rage Strike',
      key: 'E',
      cooldown: 8000, // 8 seconds
      effect: 'rage',
      description: 'Next attack deals double damage'
    }
  },
  warrior: {
    name: 'Warrior',
    health: 150,
    damage: 20,
    attackSpeed: 0.7, // Slow attacks
    movementSpeed: 0.8, // Slow movement
    description: 'High health, low damage',
    ability: {
      name: 'Ground Slam',
      key: 'E',
      cooldown: 12000, // 12 seconds
      effect: 'slam',
      description: 'Area attack damages all enemies'
    }
  }
};

// Store items configuration
const STORE_ITEMS = [
  {
    id: 'healthPotion',
    name: 'Health Potion',
    price: 50,
    description: 'Restore 25 health',
    type: 'consumable'
  },
  {
    id: 'speedPotion',
    name: 'Speed Potion',
    price: 60,
    description: '+50% speed for 15 seconds',
    type: 'consumable'
  },
  {
    id: 'damagePotion',
    name: 'Damage Potion',
    price: 80,
    description: '+50% damage for 20 seconds',
    type: 'consumable'
  },
  {
    id: 'shieldPotion',
    name: 'Shield Potion',
    price: 70,
    description: 'Temporary invincibility for 5 seconds',
    type: 'consumable'
  },
  {
    id: 'damageUpgrade',
    name: 'Damage Upgrade',
    price: 100,
    description: '+5 damage permanently',
    type: 'upgrade'
  },
  {
    id: 'healthUpgrade',
    name: 'Health Upgrade',
    price: 75,
    description: '+25 max health',
    type: 'upgrade'
  },
  {
    id: 'cooldownUpgrade',
    name: 'Ability Cooldown',
    price: 75,
    description: '-10% ability cooldown',
    type: 'upgrade'
  }
];

// Helper: Find the closest direction from DIRECTIONS for a given dx, dy
function getClosestDirection(dx, dy) {
  if (dx === 0 && dy === 0) return 'S'; // Default
  // Normalize input vector
  const len = Math.sqrt(dx * dx + dy * dy);
  const ndx = dx / len;
  const ndy = dy / len;
  let best = DIRECTIONS[0];
  let bestDot = -Infinity;
  for (const dir of DIRECTIONS) {
    // Normalize direction vector
    const dlen = Math.sqrt(dir.dx * dir.dx + dir.dy * dir.dy);
    const ddx = dir.dx / dlen;
    const ddy = dir.dy / dlen;
    // Dot product
    const dot = ndx * ddx + ndy * ddy;
    if (dot > bestDot) {
      bestDot = dot;
      best = dir;
    }
  }
  return best.folder;
}

// --- Add after skeleton animation helpers and before IsoGame function ---
const BOSS_DIRECTIONS = [
  { key: 'N', folder: 'N', angle: 90 },
  { key: 'NE', folder: 'NE', angle: 45 },
  { key: 'E', folder: 'E', angle: 0 },
  { key: 'SE', folder: 'SE', angle: 315 },
  { key: 'S', folder: 'S', angle: 270 },
  { key: 'SW', folder: 'SW', angle: 225 },
  { key: 'W', folder: 'W', angle: 180 },
  { key: 'NW', folder: 'NW', angle: 135 },
];
const BOSS_FRAMES = 8;
const BOSS_IDLE_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/boss/demonlord/demonlord_default_idle/${dir}/demonlord_default_idle_${dir}_${BOSS_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const BOSS_WALK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/boss/demonlord/demonlord_default_walk/${dir}/demonlord_default_walk_${dir}_${BOSS_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const BOSS_ATTACK_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/boss/demonlord/demonlord_default_attack1/${dir}/demonlord_default_attack1_${dir}_${BOSS_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;
const BOSS_DEATH_PATH = (dir, i) => `/assets/Lords Of Pain - Old School Isometric Assets/boss/demonlord/demonlord_special_death/${dir}/demonlord_special_death_${dir}_${BOSS_DIRECTIONS.find(d => d.folder === dir).angle}.0_${i}.png`;

function IsoGame({ armedMode: armedModeProp, onToggleArmed }) {
  console.log('IsoGame component rendering...');
  const gameRef = useRef(null);
  const phaserRef = useRef(null);
  const [currentScene, setCurrentScene] = useState('StartMenu');

  // Responsive game size
  const GAME_WIDTH = window.innerWidth;
  const GAME_HEIGHT = window.innerHeight;

  useEffect(() => {
    if (phaserRef.current) return; // Prevent multiple inits

    class IsoScene extends Phaser.Scene {
      constructor() {
        super({ key: 'IsoScene' });
        this.torchLights = [];
        this.knightTileX = 0; // Far left side of map
        this.knightTileY = 10 + MAP_TOP_BUFFER; // Center height
        this.knightDir = 'S';
        this.lastMoveTime = 0;
        // Remove old spawn tracking
        // this.maxEnemies = 10;
        // this.spawnedEnemies = 0;
        // this.activeEnemies = 0;
        // this.spawnTimer = 0;
        // this.spawnPoints = [ ... ];
        // this.nextSpawnIndex = 0;
        // New spawn system
        this.spawnPoints = [];
        this.spawnPointData = [];
        this.goldDrops = [];
        this.crates = []; // Add crates array
        this.goldCount = 3000; // Start with 3000 gold for testing
        this.blueGemCount = 0; // Start with 0 blue gems
        this.greenGemCount = 0; // Start with 0 green gems
        this.redGemCount = 0; // Start with 0 red gems
        console.log('Gold in constructor:', this.goldCount);
        console.log('Gem counts in constructor:', { blue: this.blueGemCount, green: this.greenGemCount, red: this.redGemCount });
        this.bossIncomingShown = false;
        this.bossIncomingText = null;
        this.bossSprite = null;
        this.bossAlive = false;
        this.bossTileX = null;
        this.bossTileY = null;
        this.bossHealth = 200;
        this.bossHealthBarBg = null;
        this.bossHealthBar = null;
        this.bossHealthText = null;
        this.bossMoveTimer = 0;
        this.bossAttackTimer = 0;
        
        // Level system
        this.currentLevel = 1;
        this.levelCompleted = false;
        this.levelAdvancementShown = false;
        this.playerAttackTimer = 0;
        this.abilityTimer = 0;
        this.abilityActive = false;
        this.rageActive = false;
        this.shieldActive = false;
        this.magicTimer = 0;
        this.magicActive = false;
        this.mana = 100;
        this.maxMana = 100;
        this.holyAuraActive = false;
        this.holyAuraTimer = 0;
        this.holyAuraSprite = null;
        this.fireExplosionActive = false;
        this.fireExplosionTimer = 0;
        this.pawPrintActive = false;
        this.pawPrintTimer = 0;
        this.fireStreakActive = false;
        this.fireStreakTimer = 0;
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashCooldownTimer = 0;
        this.dashPhase = 'none'; // 'none', 'burst', 'sustained'
        this.storeOpen = false;
        this.storeUI = null;
        this.storeToggleCooldown = 0;
        this.upgrades = {
          damage: 0,
          health: 0,
          abilityCooldown: 0
        };
        this.temporaryBuffs = {
          speed: { active: false, multiplier: 1.0, endTime: 0 },
          damage: { active: false, multiplier: 1.0, endTime: 0 },
          shield: { active: false, endTime: 0 }
        };
        this.inventoryUI = null;
        this.quantityMenu = null;
        this.victoryShown = false;
        
        // Save game system
        this.saveKey = 'isometricGameSave';
        this.autoSaveInterval = null;
        this.saveLoadCooldown = 0;
        this.saveName = '';
        this.saveMenuOpen = false;
        this.saveMenuUI = null;
        
        // Pause menu system
        this.pauseMenuOpen = false;
        this.pauseMenuUI = null;
        this.loadMenuOpen = false;
        this.loadMenuUI = null;
        
        // Click-to-move and cursor system
        this.cursor = null;
        this.clickToMoveTarget = null;
        this.isMovingToTarget = false;
        this.movementMode = 'keyboard'; // 'keyboard' or 'click'
        
        // Player movement and animation states
        this.isKnightAttacking = false;
        this.isKnightTweening = false;
        this.isKnightDead = false;
        this.lastMoveTime = 0;
        
        // Player 2 states (for multiplayer)
        this.isKnight2Attacking = false;
        this.isKnight2Tweening = false;
        this.lastMoveTime2 = 0;
        
        // Menu states - ensure all are properly initialized
        this.pauseMenuOpen = false;
        this.storeOpen = false;
        this.saveMenuOpen = false;
        this.loadMenuOpen = false;
        this.inventoryOpen = false;
        
        console.log('Movement mode initialized as:', this.movementMode);
        console.log('Menu states initialized:', {
          pauseMenuOpen: this.pauseMenuOpen,
          storeOpen: this.storeOpen,
          saveMenuOpen: this.saveMenuOpen,
          loadMenuOpen: this.loadMenuOpen,
          inventoryOpen: this.inventoryOpen
        });
      }
      preload() {
        console.log('IsoScene preload method called');
        this.load.image('isoTile', TILE_PATH);
        this.load.image('torch', TORCH_PATH);
        this.load.image('zone', ZONE_PATH);
        this.load.image('gold_drop', '/assets/Lords Of Pain - Old School Isometric Assets/prop/gold_drop/S/gold_drop_S_270.0_0.png');
        this.load.image('demonlord_idle_S_0', '/assets/Lords Of Pain - Old School Isometric Assets/boss/demonlord/demonlord_default_idle/S/demonlord_default_idle_S_270.0_0.png');
        
        // Load crate assets
        this.load.image('crate', '/assets/Lords Of Pain - Old School Isometric Assets/prop/crate/S/crate_S_270.0_0.png');
        
        // Load crate break animation frames (using South direction for simplicity)
        for (let i = 0; i < 8; i++) {
          this.load.image(`crate_break_${i}`, `/assets/Lords Of Pain - Old School Isometric Assets/prop/crate_break/S/crate_break_S_270.0_${i}.png`);
        }
        
        // Load gem assets
        this.load.image('gem_blue', '/assets/Lords Of Pain - Old School Isometric Assets/prop/gemstones_blue/S/gemstones_blue_S_270.0_0.png');
        this.load.image('gem_green', '/assets/Lords Of Pain - Old School Isometric Assets/prop/gemstones_green/S/gemstones_green_S_270.0_0.png');
        this.load.image('gem_red', '/assets/Lords Of Pain - Old School Isometric Assets/prop/gemstones_red/S/gemstones_red_S_270.0_0.png');
        
        // Slime splat will be created using graphics
        
        // Load cursor assets
        console.log('Loading cursor assets...');
        this.load.image('cursor_normal', '/assets/Lords Of Pain - Old School Isometric Assets/user interface/cursor/cursor_gauntlet_white.png');
        this.load.image('cursor_move', '/assets/Lords Of Pain - Old School Isometric Assets/user interface/cursor/cursor_gauntlet_green.png');
        this.load.image('cursor_attack', '/assets/Lords Of Pain - Old School Isometric Assets/user interface/cursor/cursor_gauntlet_red.png');
        this.load.image('cursor_interact', '/assets/Lords Of Pain - Old School Isometric Assets/user interface/cursor/cursor_gauntlet_yellow.png');
        console.log('Cursor assets loading initiated');
        
        // Load magic spell sprite sheet
        this.load.spritesheet('magic_spell', '/assets/magic_spell.png', { 
          frameWidth: 64, 
          frameHeight: 64 
        });
        
        // Load Holy Light Aura sprite sheet for Knight's magic
        this.load.spritesheet('holy_light_aura', '/assets/holy_light_aura.png', { 
          frameWidth: 64, 
          frameHeight: 64 
        });
        
        // Load Fire Explosion sprite sheet for Fighter's magic
        this.load.spritesheet('fire_explosion', '/assets/fire_explosion.png', { 
          frameWidth: 64, 
          frameHeight: 64 
        });
        
        // Load Paw Print sprite sheet for Warrior's magic
        this.load.spritesheet('paw_print', '/assets/paw_print.png', { 
          frameWidth: 64, 
          frameHeight: 64 
        });
        
        // Load Fire Streak sprite sheet for Warrior's magic
        this.load.spritesheet('fire_streak', '/assets/fire_streak.png', { 
          frameWidth: 64, 
          frameHeight: 64 
        });
        // Preload knight and skeleton walk frames for all 16 directions
        const ALL_DIRECTIONS = [
          { key: 'E', angle: '0.0' },
          { key: 'NEE', angle: '22.5' },
          { key: 'NE', angle: '45.0' },
          { key: 'NNE', angle: '67.5' },
          { key: 'N', angle: '90.0' },
          { key: 'NNW', angle: '112.5' },
          { key: 'NW', angle: '135.0' },
          { key: 'NWW', angle: '157.5' },
          { key: 'W', angle: '180.0' },
          { key: 'SWW', angle: '202.5' },
          { key: 'SW', angle: '225.0' },
          { key: 'SSW', angle: '247.5' },
          { key: 'S', angle: '270.0' },
          { key: 'SSE', angle: '292.5' },
          { key: 'SE', angle: '315.0' },
          { key: 'SEE', angle: '337.5' }
        ];
        for (const dir of ALL_DIRECTIONS) {
          for (let i = 0; i < 8; i++) {
            this.load.image(
              `knight_default_walk_${dir.key}_${i}`,
              `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/${dir.key}/knight_default_walk_${dir.key}_${dir.angle}_${i}.png`
            );
            this.load.image(
              `skeleton_default_walk_${dir.key}_${i}`,
              `/assets/Lords Of Pain - Old School Isometric Assets/enemy/skeleton/skeleton_default_walk/${dir.key}/skeleton_default_walk_${dir.key}_${dir.angle}_${i}.png`
            );
          }
        }
        // Preload new North walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_N_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/N/knight_default_walk_N_90.0_${i}.png`
          );
        }
        // Preload new East walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_E_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/E/knight_default_walk_E_0.0_${i}.png`
          );
        }
        // Preload new NorthEast walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_NE_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/NE/knight_default_walk_NE_45.0_${i}.png`
          );
        }
        // Preload new NorthWest walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_NW_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/NW/knight_default_walk_NW_135.0_${i}.png`
          );
        }
        // Preload new South walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_S_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/S/knight_default_walk_S_270.0_${i}.png`
          );
        }
        // Preload new SouthEast walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_SE_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/SE/knight_default_walk_SE_315.0_${i}.png`
          );
        }
        // Preload new SouthWest walk frames
        for (let i = 0; i < 8; i++) {
          const frameIdx = (i === 5) ? 4 : i; // Use frame 4 for both 4 and 5 if 5 is missing
          this.load.image(
            `knight_default_walk_SW_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/SW/knight_default_walk_SW_225.0_${frameIdx}.png`
          );
        }
        // Preload new West walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_W_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/W/knight_default_walk_W_180.0_${i}.png`
          );
        }
        
        // Preload fighter 16-direction walk frames
        for (const dir of ALL_DIRECTIONS) {
          for (let i = 0; i < 8; i++) {
            this.load.image(
              `fighter_default_walk_${dir.key}_${i}`,
              `/assets/Lords Of Pain - Old School Isometric Assets/playable character/fighter/fighter_default_walk/${dir.key}/fighter_default_walk_${dir.key}_${dir.angle}_${i}.png`
            );
          }
        }
        
        // Preload warrior 16-direction walk frames
        for (const dir of ALL_DIRECTIONS) {
          for (let i = 0; i < 8; i++) {
            this.load.image(
              `warrior_default_walk_${dir.key}_${i}`,
              `/assets/Lords Of Pain - Old School Isometric Assets/playable character/warrior/warrior_default_walk/${dir.key}/warrior_default_walk_${dir.key}_${dir.angle}_${i}.png`
            );
          }
        }
        // Preload new SouthWest-West walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_SWW_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/SWW/knight_default_walk_SWW_202.5_${i}.png`
          );
        }
        // Preload new South-SouthWest walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_SSW_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/SSW/knight_default_walk_SSW_247.5_${i}.png`
          );
        }
        // Preload new South-SouthEast walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_SSE_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/SSE/knight_default_walk_SSE_292.5_${i}.png`
          );
        }
        // Preload new NorthWest-West walk frames
        for (let i = 0; i < 8; i++) {
          this.load.image(
            `knight_default_walk_NWW_${i}`,
            `/assets/Lords Of Pain - Old School Isometric Assets/playable character/knight/knight_default_walk/NWW/knight_default_walk_NWW_157.5_${i}.png`
          );
        }
        FLAME_FRAMES.forEach((path, idx) => {
          this.load.image(`flame_${idx}`, path);
        });
        DIRECTIONS.forEach(dir => {
          for (let i = 0; i < KNIGHT_WALK_FRAMES; i++) {
            this.load.image(`knight_walk_${dir.folder}_${i}`, KNIGHT_WALK_PATH(dir.folder, i));
            }
        });
        // Load knight attack frames for all directions
        DIRECTIONS.forEach(dir => {
          for (let i = 0; i < KNIGHT_ATTACK_FRAMES; i++) {
            this.load.image(`knight_attack_${dir.folder}_${i}`, KNIGHT_ATTACK_PATH(dir.folder, i));
          }
        });
        // Load all skeleton frames for all directions
        ENEMY_DIRECTIONS.forEach(dir => {
          // Only load skeleton_idle_<dir>_0.png for idle
          this.load.image(`skeleton_idle_${dir.folder}_0`, SKELETON_IDLE_PATH(dir.folder, 0));
          // Load walk, attack, and death frames as before
          for (let i = 0; i < ENEMY_FRAMES; i++) {
            this.load.image(`skeleton_walk_${dir.folder}_${i}`, SKELETON_WALK_PATH(dir.folder, i));
            this.load.image(`skeleton_attack_${dir.folder}_${i}`, SKELETON_ATTACK_PATH(dir.folder, i));
            this.load.image(`skeleton_death_${dir.folder}_${i}`, SKELETON_DEATH_PATH(dir.folder, i));
          }
        });
        
        // Load all slime frames for all directions
        ENEMY_DIRECTIONS.forEach(dir => {
          // Only load slime_idle_<dir>_0.png for idle
          this.load.image(`slime_idle_${dir.folder}_0`, SLIME_IDLE_PATH(dir.folder, 0));
          // Load walk and death frames
          for (let i = 0; i < ENEMY_FRAMES; i++) {
            this.load.image(`slime_walk_${dir.folder}_${i}`, SLIME_WALK_PATH(dir.folder, i));
            this.load.image(`slime_death_${dir.folder}_${i}`, SLIME_DEATH_PATH(dir.folder, i));
          }
        });
        // Preload knight death frames for all directions
        DIRECTIONS.forEach(dir => {
          for (let i = 0; i < KNIGHT_DEATH_FRAMES; i++) {
            this.load.image(`knight_death_${dir.folder}_${i}`, KNIGHT_DEATH_PATH(dir.folder, i));
          }
        });
        
        // Preload fighter animations for all directions
        DIRECTIONS.forEach(dir => {
          for (let i = 0; i < KNIGHT_WALK_FRAMES; i++) {
            this.load.image(`fighter_walk_${dir.folder}_${i}`, FIGHTER_WALK_PATH(dir.folder, i));
          }
          for (let i = 0; i < KNIGHT_ATTACK_FRAMES; i++) {
            this.load.image(`fighter_attack_${dir.folder}_${i}`, FIGHTER_ATTACK_PATH(dir.folder, i));
          }
          for (let i = 0; i < KNIGHT_DEATH_FRAMES; i++) {
            this.load.image(`fighter_death_${dir.folder}_${i}`, FIGHTER_DEATH_PATH(dir.folder, i));
          }
        });
        
        // Preload warrior animations for all directions
        DIRECTIONS.forEach(dir => {
          for (let i = 0; i < KNIGHT_WALK_FRAMES; i++) {
            this.load.image(`warrior_walk_${dir.folder}_${i}`, WARRIOR_WALK_PATH(dir.folder, i));
          }
          for (let i = 0; i < KNIGHT_ATTACK_FRAMES; i++) {
            this.load.image(`warrior_attack_${dir.folder}_${i}`, WARRIOR_ATTACK_PATH(dir.folder, i));
          }
          for (let i = 0; i < KNIGHT_DEATH_FRAMES; i++) {
            this.load.image(`warrior_death_${dir.folder}_${i}`, WARRIOR_DEATH_PATH(dir.folder, i));
          }
        });
        // Preload all boss (demonlord) frames for each direction and type
        BOSS_DIRECTIONS.forEach(dir => {
          // Idle: only frame 0 (like skeleton idle)
          this.load.image(`demonlord_idle_${dir.folder}_0`, BOSS_IDLE_PATH(dir.folder, 0));
          // Walk, attack, death: 8 frames each
          for (let i = 0; i < BOSS_FRAMES; i++) {
            this.load.image(`demonlord_walk_${dir.folder}_${i}`, BOSS_WALK_PATH(dir.folder, i));
            this.load.image(`demonlord_attack1_${dir.folder}_${i}`, BOSS_ATTACK_PATH(dir.folder, i));
            this.load.image(`demonlord_death_${dir.folder}_${i}`, BOSS_DEATH_PATH(dir.folder, i));
          }
        });
      }
      create(data = {}) {
        console.log('IsoScene create method called with data:', data);
        
        // Check if we should load a saved game
        this.shouldLoadGame = data.loadGame || false;
        this.saveName = data.saveName || '';
        
        // Use selected character, default to 'knight'
        this.selectedCharacter = data.character || 'knight';
        console.log('Selected character:', this.selectedCharacter);
        
        // Handle player mode (single or multiplayer)
        this.playerMode = data.playerMode || 'single';
        this.player2Character = data.player2Character || 'knight';
        console.log('Player mode:', this.playerMode);
        // --- Animation creation: only once per game instance ---
        if (!this.sys.game.animsCreated) {
          // Knight walk (16 directions)
          const ALL_DIRECTIONS = [
            { key: 'E', angle: '0.0' },
            { key: 'NEE', angle: '22.5' },
            { key: 'NE', angle: '45.0' },
            { key: 'NNE', angle: '67.5' },
            { key: 'N', angle: '90.0' },
            { key: 'NNW', angle: '112.5' },
            { key: 'NW', angle: '135.0' },
            { key: 'NWW', angle: '157.5' },
            { key: 'W', angle: '180.0' },
            { key: 'SWW', angle: '202.5' },
            { key: 'SW', angle: '225.0' },
            { key: 'SSW', angle: '247.5' },
            { key: 'S', angle: '270.0' },
            { key: 'SSE', angle: '292.5' },
            { key: 'SE', angle: '315.0' },
            { key: 'SEE', angle: '337.5' }
          ];
          ALL_DIRECTIONS.forEach(dir => {
            const key = `knight_walk_${dir.key}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: 8 }, (_, i) => ({ key: `knight_default_walk_${dir.key}_${i}` })),
                frameRate: 8,
                repeat: -1
              });
            }
            const fighterKey = `fighter_walk_${dir.key}`;
            if (!this.anims.exists(fighterKey)) {
              this.anims.create({
                key: fighterKey,
                frames: Array.from({ length: 8 }, (_, i) => ({ key: `fighter_default_walk_${dir.key}_${i}` })),
                frameRate: 8,
                repeat: -1
              });
            }
            const warriorKey = `warrior_walk_${dir.key}`;
            if (!this.anims.exists(warriorKey)) {
              this.anims.create({
                key: warriorKey,
                frames: Array.from({ length: 8 }, (_, i) => ({ key: `warrior_default_walk_${dir.key}_${i}` })),
                frameRate: 8,
                repeat: -1
              });
            }
            
            // Create idle animations for all characters
            const knightIdleKey = `knight_idle_${dir.key}`;
            if (!this.anims.exists(knightIdleKey)) {
              this.anims.create({
                key: knightIdleKey,
                frames: [{ key: `knight_default_walk_${dir.key}_0` }], // Use first walk frame as idle
                frameRate: 1,
                repeat: -1
              });
            }
            
            const fighterIdleKey = `fighter_idle_${dir.key}`;
            if (!this.anims.exists(fighterIdleKey)) {
              this.anims.create({
                key: fighterIdleKey,
                frames: [{ key: `fighter_default_walk_${dir.key}_0` }], // Use first walk frame as idle
                frameRate: 1,
                repeat: -1
              });
            }
            
            const warriorIdleKey = `warrior_idle_${dir.key}`;
            if (!this.anims.exists(warriorIdleKey)) {
              this.anims.create({
                key: warriorIdleKey,
                frames: [{ key: `warrior_default_walk_${dir.key}_0` }], // Use first walk frame as idle
                frameRate: 1,
                repeat: -1
              });
            }
          });
          // Skeleton walk (16 directions)
          ALL_DIRECTIONS.forEach(dir => {
            const key = `skeleton_walk_${dir.key}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: 8 }, (_, i) => ({ key: `skeleton_default_walk_${dir.key}_${i}` })),
                frameRate: 8,
                repeat: -1
              });
            }
          });
          // Boss (demonlord) (8 directions)
          BOSS_DIRECTIONS.forEach(dir => {
            let key = `demonlord_idle_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: [ { key: `demonlord_idle_${dir.folder}_0` } ],
                frameRate: 1,
                repeat: -1,
              });
            }
            key = `demonlord_walk_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: BOSS_FRAMES }, (_, i) => ({ key: `demonlord_walk_${dir.folder}_${i}` })),
                frameRate: 8,
                repeat: -1,
              });
            }
            key = `demonlord_attack1_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: BOSS_FRAMES }, (_, i) => ({ key: `demonlord_attack1_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: 0,
              });
            }
            key = `demonlord_death_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: BOSS_FRAMES }, (_, i) => ({ key: `demonlord_death_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: 0,
              });
            }
          });
          // Knight attack (8 directions)
          DIRECTIONS.forEach(dir => {
            const key = `knight_attack_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: KNIGHT_ATTACK_FRAMES }, (_, i) => ({ key: `knight_attack_${dir.folder}_${i}` })),
                frameRate: 12,
                repeat: 0,
              });
            }
          });
          // Skeleton idle/attack/death (8 directions)
          ENEMY_DIRECTIONS.forEach(dir => {
            let key = `skeleton_idle_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: [ { key: `skeleton_idle_${dir.folder}_0` } ],
                frameRate: 1,
                repeat: -1,
              });
            }
            key = `skeleton_attack_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: ENEMY_FRAMES }, (_, i) => ({ key: `skeleton_attack_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: -1,
              });
            }
            key = `skeleton_death_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: ENEMY_FRAMES }, (_, i) => ({ key: `skeleton_death_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: 0,
              });
            }
          });
          // Knight death (8 directions)
          DIRECTIONS.forEach(dir => {
            const key = `knight_death_${dir.folder}`;
            if (!this.anims.exists(key)) {
              this.anims.create({
                key,
                frames: Array.from({ length: KNIGHT_DEATH_FRAMES }, (_, i) => ({ key: `knight_death_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: 0,
              });
            }
          });
          
          // Fighter animations (8 directions)
          DIRECTIONS.forEach(dir => {
            // Fighter walk
            const walkKey = `fighter_walk_${dir.folder}`;
            if (!this.anims.exists(walkKey)) {
              this.anims.create({
                key: walkKey,
                frames: Array.from({ length: KNIGHT_WALK_FRAMES }, (_, i) => ({ key: `fighter_walk_${dir.folder}_${i}` })),
                frameRate: 8,
                repeat: -1,
              });
            }
            // Fighter attack
            const attackKey = `fighter_attack_${dir.folder}`;
            if (!this.anims.exists(attackKey)) {
              this.anims.create({
                key: attackKey,
                frames: Array.from({ length: KNIGHT_ATTACK_FRAMES }, (_, i) => ({ key: `fighter_attack_${dir.folder}_${i}` })),
                frameRate: 12,
                repeat: 0,
              });
            }
            // Fighter death
            const deathKey = `fighter_death_${dir.folder}`;
            if (!this.anims.exists(deathKey)) {
              this.anims.create({
                key: deathKey,
                frames: Array.from({ length: KNIGHT_DEATH_FRAMES }, (_, i) => ({ key: `fighter_death_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: 0,
              });
            }
          });
          
          // Warrior animations (8 directions)
          DIRECTIONS.forEach(dir => {
            // Warrior walk
            const walkKey = `warrior_walk_${dir.folder}`;
            if (!this.anims.exists(walkKey)) {
              this.anims.create({
                key: walkKey,
                frames: Array.from({ length: KNIGHT_WALK_FRAMES }, (_, i) => ({ key: `warrior_walk_${dir.folder}_${i}` })),
                frameRate: 8,
                repeat: -1,
              });
            }
            // Warrior attack
            const attackKey = `warrior_attack_${dir.folder}`;
            if (!this.anims.exists(attackKey)) {
              this.anims.create({
                key: attackKey,
                frames: Array.from({ length: KNIGHT_ATTACK_FRAMES }, (_, i) => ({ key: `warrior_attack_${dir.folder}_${i}` })),
                frameRate: 12,
                repeat: 0,
              });
            }
            // Warrior death
            const deathKey = `warrior_death_${dir.folder}`;
            if (!this.anims.exists(deathKey)) {
              this.anims.create({
                key: deathKey,
                frames: Array.from({ length: KNIGHT_DEATH_FRAMES }, (_, i) => ({ key: `warrior_death_${dir.folder}_${i}` })),
                frameRate: 10,
                repeat: 0,
              });
            }
          });
          // Flame animation (single)
          if (!this.anims.exists('flame_anim')) {
            this.anims.create({
              key: 'flame_anim',
              frames: FLAME_FRAMES.map((_, idx) => ({ key: `flame_${idx}` })),
              frameRate: 12,
              repeat: -1,
            });
          }
          
          // Crate break animation
          if (!this.anims.exists('crate_break')) {
            this.anims.create({
              key: 'crate_break',
              frames: Array.from({ length: 8 }, (_, i) => ({ key: `crate_break_${i}` })),
              frameRate: 12,
              repeat: 0,
            });
          }
          
          // Magic spell animation
          if (!this.anims.exists('magic_spell')) {
            this.anims.create({
              key: 'magic_spell',
              frames: this.anims.generateFrameNumbers('magic_spell', { start: 0, end: 19 }),
              frameRate: 15,
              repeat: 0,
            });
          }
          
          // Holy Light Aura animation
          if (!this.anims.exists('holy_light_aura')) {
            this.anims.create({
              key: 'holy_light_aura',
              frames: this.anims.generateFrameNumbers('holy_light_aura', { start: 0, end: 19 }),
              frameRate: 12,
              repeat: -1, // Loop continuously
            });
          }
          
          // Fire Explosion animation
          if (!this.anims.exists('fire_explosion')) {
            this.anims.create({
              key: 'fire_explosion',
              frames: this.anims.generateFrameNumbers('fire_explosion', { start: 0, end: 19 }),
              frameRate: 15,
              repeat: 0, // Play once
            });
          }
          
          // Paw Print animation
          if (!this.anims.exists('paw_print')) {
            this.anims.create({
              key: 'paw_print',
              frames: this.anims.generateFrameNumbers('paw_print', { start: 0, end: 19 }),
              frameRate: 12,
              repeat: 0, // Play once
            });
          }
          
          // Fire Streak animation
          if (!this.anims.exists('fire_streak')) {
            this.anims.create({
              key: 'fire_streak',
              frames: this.anims.generateFrameNumbers('fire_streak', { start: 0, end: 9 }),
              frameRate: 15,
              repeat: 0, // Play once
            });
          }
          this.sys.game.animsCreated = true;
        }
        // Reset player state on restart
        this.characterStats = CHARACTER_STATS[this.selectedCharacter];
        this.playerHealth = this.characterStats.health + (this.upgrades.health * 25);
        this.playerMaxHealth = this.characterStats.health + (this.upgrades.health * 25);
        this.isKnightDead = false;
        this.isKnightAttacking = false;
        this.isKnightTweening = false;
        // Keep the gold from constructor (3000) or set to 0 if not initialized
        if (typeof this.goldCount === 'undefined') {
          this.goldCount = 0;
        }
        console.log('Gold after create method:', this.goldCount);
        this.bossIncomingShown = false;
        this.bossAlive = false;
        this.bossSprite = null;
        this.bossHealth = 200;
        this.victoryShown = false;
        this.lights.enable().setAmbientColor(0xffffff);
        this.lights.addLight(GAME_WIDTH / 2, GAME_HEIGHT / 2, 800, 0xffffff, 2.0);
        
        // Add player lights that will follow the players
        this.playerLight = this.lights.addLight(GAME_WIDTH / 2, GAME_HEIGHT / 2, 400, 0xffffff, 3.0);
        if (this.playerMode === 'multiplayer') {
          this.player2Light = this.lights.addLight(GAME_WIDTH / 2, GAME_HEIGHT / 2, 400, 0xffffff, 3.0);
        }
        // Create knight attack animations for all directions
        DIRECTIONS.forEach(dir => {
          this.anims.create({
            key: `knight_attack_${dir.folder}`,
            frames: Array.from({ length: KNIGHT_ATTACK_FRAMES }, (_, i) => ({ key: `knight_attack_${dir.folder}_${i}` })),
            frameRate: 12,
            repeat: 0,
          });
        });
        // Create all skeleton animations for all directions
        ENEMY_DIRECTIONS.forEach(dir => {
          this.anims.create({
            key: `skeleton_idle_${dir.folder}`,
            frames: [ { key: `skeleton_idle_${dir.folder}_0` } ],
            frameRate: 1,
            repeat: -1,
          });
          this.anims.create({
            key: `skeleton_attack_${dir.folder}`,
            frames: Array.from({ length: ENEMY_FRAMES }, (_, i) => ({ key: `skeleton_attack_${dir.folder}_${i}` })),
            frameRate: 10,
            repeat: -1,
          });
          this.anims.create({
            key: `skeleton_death_${dir.folder}`,
            frames: Array.from({ length: ENEMY_FRAMES }, (_, i) => ({ key: `skeleton_death_${dir.folder}_${i}` })),
            frameRate: 10,
            repeat: 0,
          });
        });
        
        // Create all slime animations for all directions
        ENEMY_DIRECTIONS.forEach(dir => {
          this.anims.create({
            key: `slime_idle_${dir.folder}`,
            frames: [ { key: `slime_idle_${dir.folder}_0` } ],
            frameRate: 1,
            repeat: -1,
          });
          this.anims.create({
            key: `slime_walk_${dir.folder}`,
            frames: Array.from({ length: ENEMY_FRAMES }, (_, i) => ({ key: `slime_walk_${dir.folder}_${i}` })),
            frameRate: 8,
            repeat: -1,
          });
          this.anims.create({
            key: `slime_death_${dir.folder}`,
            frames: Array.from({ length: ENEMY_FRAMES }, (_, i) => ({ key: `slime_death_${dir.folder}_${i}` })),
            frameRate: 8,
            repeat: 0,
          });
        });
        // Create knight death animations for all directions
        DIRECTIONS.forEach(dir => {
          this.anims.create({
            key: `knight_death_${dir.folder}`,
            frames: Array.from({ length: KNIGHT_DEATH_FRAMES }, (_, i) => ({ key: `knight_death_${dir.folder}_${i}` })),
            frameRate: 10,
            repeat: 0,
          });
        });
        
        // Slime splatter animation will be created using tweens
        
        this.isKnightDead = false;
        // Centering math for staggered isometric
        this.offsetX = 0;
        this.offsetY = 0;
        for (let row = 0; row < MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER; row++) {
          for (let col = 0; col < MAP_WIDTH + MAP_RIGHT_BUFFER; col++) {
            // Staggered isometric placement with Y offset
            const staggerX = col * (ISO_TILE_WIDTH / 2) + (row % 2 ? ISO_TILE_WIDTH / 4 : 0);
            const staggerY = row * (ISO_TILE_HEIGHT / 2);
            const tile = this.add.image(staggerX, staggerY, 'isoTile');
            tile.setOrigin(0.5, 1);
            tile.setPipeline('Light2D');
          }
        }
        const usedPositions = new Set();
        this.torchLights = [];
        for (let i = 0; i < TORCH_COUNT; i++) {
          let torchTileX, torchTileY, key;
          do {
            torchTileX = Phaser.Math.Between(0, MAP_WIDTH - 1);
            torchTileY = Phaser.Math.Between(0, MAP_HEIGHT - 1);
            key = `${torchTileX},${torchTileY}`;
          } while (usedPositions.has(key) || (torchTileX === this.knightTileX && torchTileY === this.knightTileY));
          usedPositions.add(key);
          const torchIsoX = (torchTileX - torchTileY) * (ISO_TILE_WIDTH / 2) + this.offsetX;
          const torchIsoY = (torchTileX + torchTileY) * (ISO_TILE_HEIGHT / 2) + this.offsetY;
          const torch = this.add.image(torchIsoX, torchIsoY, 'torch');
          torch.setOrigin(0.5, 1);
          torch.setPipeline('Light2D');
          const flame = this.add.sprite(torchIsoX, torchIsoY - 60, 'flame_0');
          flame.setOrigin(0.5, 1);
          flame.setPipeline('Light2D');
          flame.play('flame_anim');
          const light = this.lights.addLight(torchIsoX, torchIsoY - 80, 350, 0xffc300, 6.0);
          this.torchLights.push({ light, baseRadius: 350, baseIntensity: 6.0 });
        }
        // --- Initial enemy arrays (empty, will be populated by spawn points) ---
        this.skeletons = [];
        this.slimes = [];
        const usedEnemyPositions = new Set();
        // Reserve player tile
        usedEnemyPositions.add(`${this.knightTileX},${this.knightTileY}`);
        
        console.log('Setting up spawn point system...');
        // 2. Pick 6 random, non-overlapping spawn points (3 for skeletons, 3 for slimes)
        const allPossible = [];
        for (let x = 0; x < MAP_WIDTH + MAP_RIGHT_BUFFER; x++) {
          for (let y = 0; y < MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER; y++) {
            const key = `${x},${y}`;
            if (!usedEnemyPositions.has(key)) {
              allPossible.push({ x, y });
            }
          }
        }
        Phaser.Utils.Array.Shuffle(allPossible);
        
        // Pick 6 spawn points with minimum distance between them
        this.skeletonSpawnPoints = [];
        this.slimeSpawnPoints = [];
        
        for (let i = 0; i < 6; i++) {
          if (i < allPossible.length) {
            const spawnPoint = allPossible[i];
            usedEnemyPositions.add(`${spawnPoint.x},${spawnPoint.y}`);
            
            if (i < 3) {
              // First 3 are skeleton spawn points
              this.skeletonSpawnPoints.push(spawnPoint);
            } else {
              // Last 3 are slime spawn points
              this.slimeSpawnPoints.push(spawnPoint);
            }
          }
        }
        
        // Initialize spawn data
        this.skeletonSpawnData = [
          { count: 0, timer: 0, max: 5, type: 'skeleton', active: true },
          { count: 0, timer: 0, max: 5, type: 'skeleton', active: true },
          { count: 0, timer: 0, max: 5, type: 'skeleton', active: true }
        ];
        
        this.slimeSpawnData = [
          { count: 0, timer: 0, max: 5, type: 'slime', active: true },
          { count: 0, timer: 0, max: 5, type: 'slime', active: true },
          { count: 0, timer: 0, max: 5, type: 'slime', active: true }
        ];
        
        // Initialize spawn point visual indicators arrays
        this.skeletonSpawnIndicators = [];
        this.slimeSpawnIndicators = [];
        
        // Add visual indicators for spawn points
        this.skeletonSpawnPoints.forEach((sp, index) => {
          const { x, y } = this.getIsoPos(sp.x, sp.y);
          // Draw orange circle for skeleton spawn points
          const circle = this.add.graphics();
          circle.lineStyle(4, 0xffaa66, 0.7);
          circle.strokeCircle(x, y, ISO_TILE_WIDTH / 2);
          circle.setDepth(9);
          
          // Add label
          const label = this.add.text(x, y - 30, `Skeleton ${index + 1}`, { 
            font: '12px Arial', 
            fill: '#ffaa66' 
          }).setOrigin(0.5).setDepth(10);
          
          // Store indicators for later removal
          this.skeletonSpawnIndicators[index] = { circle, label };
        });
        
        this.slimeSpawnPoints.forEach((sp, index) => {
          const { x, y } = this.getIsoPos(sp.x, sp.y);
          // Draw green circle for slime spawn points
          const circle = this.add.graphics();
          circle.lineStyle(4, 0x66ff66, 0.7);
          circle.strokeCircle(x, y, ISO_TILE_WIDTH / 2);
          circle.setDepth(9);
          
          // Add label
          const label = this.add.text(x, y - 30, `Slime ${index + 1}`, { 
            font: '12px Arial', 
            fill: '#66ff66' 
          }).setOrigin(0.5).setDepth(10);
          
          // Store indicators for later removal
          this.slimeSpawnIndicators[index] = { circle, label };
        });
        // Add zone effect under knight
        const { x: knightX, y: knightY } = this.getKnightIsoPos();
        this.zone = this.add.image(knightX, knightY, 'zone');
        this.zone.setOrigin(0.5, 0.7);
        this.zone.setAlpha(0.5);
        this.zone.setBlendMode(Phaser.BlendModes.ADD);
        
        // Add zone effect under player 2 in multiplayer mode
        if (this.playerMode === 'multiplayer') {
          const { x: knight2X, y: knight2Y } = this.getKnight2IsoPos();
          this.zone2 = this.add.image(knight2X, knight2Y, 'zone');
          this.zone2.setOrigin(0.5, 0.7);
          this.zone2.setAlpha(0.3);
          this.zone2.setBlendMode(Phaser.BlendModes.ADD);
          this.zone2.setTint(0x4444ff); // Blue tint for player 2
        }
        // Add player character sprite based on selection
        const characterSpriteKey = `${this.selectedCharacter}_walk_S_0`;
        this.knight = this.add.sprite(knightX, knightY, characterSpriteKey);
        this.knight.setOrigin(0.5, 1);
        this.knight.setPipeline('Light2D');
        this.knight.play(`${this.selectedCharacter}_walk_S`);
        
        // Add second player if in multiplayer mode
        if (this.playerMode === 'multiplayer') {
          // Position player 2 slightly offset from player 1
          const player2X = knightX + 50;
          const player2Y = knightY + 25;
          const player2SpriteKey = `${this.player2Character}_walk_S_0`;
          this.knight2 = this.add.sprite(player2X, player2Y, player2SpriteKey);
          this.knight2.setOrigin(0.5, 1);
          this.knight2.setPipeline('Light2D');
          this.knight2.play(`${this.player2Character}_walk_S`);
          
          // Initialize player 2 position and state
          this.knight2TileX = this.knightTileX + 2;
          this.knight2TileY = this.knightTileY + 1;
          this.knight2Dir = 'S';
          this.knight2DirX = 0;
          this.knight2DirY = 0;
          this.isKnight2Attacking = false;
          this.knight2LastAttackTime = 0;
          this.knight2AttackCooldown = 500; // 500ms cooldown
          this.knight2Health = CHARACTER_STATS[this.player2Character].health;
          this.knight2MaxHealth = CHARACTER_STATS[this.player2Character].health;
          this.knight2CharacterStats = CHARACTER_STATS[this.player2Character];
          this.lastMoveTime2 = 0;
          
          // Add player 2 health bar
          this.knight2HealthBar = this.add.graphics();
          this.knight2HealthBar.setDepth(10);
          this.updatePlayer2HealthBar();
        }
        
        // Camera follow knight
        const cam = this.cameras.main;
        // Update camera bounds for staggered map
        const mapPixelWidth = (MAP_WIDTH + MAP_RIGHT_BUFFER - 1) * (ISO_TILE_WIDTH / 2) + ISO_TILE_WIDTH;
        const mapPixelHeight = (MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1) * (ISO_TILE_HEIGHT / 2) + ISO_TILE_HEIGHT;
        const camBufferY = ISO_TILE_HEIGHT / 2 + MAP_TOP_BUFFER * (ISO_TILE_HEIGHT / 2);
        cam.setBounds(0, -camBufferY, mapPixelWidth, mapPixelHeight + camBufferY);
        cam.startFollow(this.knight, true, 0.12, 0.12);
        cam.setRoundPixels(true);
        
        // Initialize camera zoom
        this.cameraZoom = 1.0;
        cam.setZoom(this.cameraZoom);
        
        // Mouse wheel zoom functionality
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
          // deltaY is positive for scroll up (zoom in), negative for scroll down (zoom out)
          const zoomSpeed = 0.1;
          const zoomChange = deltaY > 0 ? zoomSpeed : -zoomSpeed;
          
          // Calculate new zoom level
          const newZoom = Phaser.Math.Clamp(this.cameraZoom + zoomChange, 0.5, 2.0);
          
                  // Only update if zoom actually changed
        if (newZoom !== this.cameraZoom) {
          this.cameraZoom = newZoom;
          cam.setZoom(this.cameraZoom);
          this.updateUIScaling();
          console.log(`Camera zoom: ${this.cameraZoom.toFixed(2)}x`);
        }
        });
        // Remove old keyboard listeners if any (prevents stacking on restart)
        if (this.input.keyboard.listeners && this.input.keyboard.listeners.length) {
          this.input.keyboard.removeAllListeners();
        }
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        console.log('Keyboard controls initialized:', {
          cursors: !!this.cursors,
          keyW: !!this.keyW,
          keyA: !!this.keyA,
          keyS: !!this.keyS,
          keyD: !!this.keyD
        });
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keyShop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keySave = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);
        this.keyLoad = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F9);
        this.keySaveMenu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F6);
        
        // Player 2 controls (numpad) for multiplayer mode
        if (this.playerMode === 'multiplayer') {
          this.keyNumpad8 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT);
          this.keyNumpad2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
          this.keyNumpad4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR);
          this.keyNumpad6 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX);
          this.keyNumpad7 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN);
          this.keyNumpad9 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE);
          this.keyNumpad1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
          this.keyNumpad3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);
          this.keyNumpadEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ENTER);
        }
        // Remove old SPACE listeners before adding new one
        this.input.keyboard.removeListener('keydown-SPACE');
        this.input.keyboard.on('keydown-SPACE', () => {
          try {
            console.log('SPACE key pressed - attempting attack');
            if (this.isKnightAttacking) {
              console.log('Already attacking, ignoring SPACE');
              return;
            }
          
          this.isKnightAttacking = true;
          const dir = this.knightDir;
            console.log('Playing attack animation:', `${this.selectedCharacter}_attack_${dir}`);
          this.knight.play(`${this.selectedCharacter}_attack_${dir}`);
            
                        // Find and attack adjacent enemies
            let enemyFound = false;
            
            // Check skeletons first
          for (const skeleton of this.skeletons) {
            if (!skeleton.alive) continue;
            const dx = Math.abs(skeleton.tileX - this.knightTileX);
            const dy = Math.abs(skeleton.tileY - this.knightTileY);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
                console.log('Attacking skeleton at:', skeleton.tileX, skeleton.tileY);
                this.performAttack(skeleton);
                enemyFound = true;
                break;
              }
            }
            
            // Check slimes if no skeleton was found
            if (!enemyFound) {
              for (const slime of this.slimes) {
                if (!slime.alive) continue;
                const dx = Math.abs(slime.tileX - this.knightTileX);
                const dy = Math.abs(slime.tileY - this.knightTileY);
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
                  console.log('Attacking slime at:', slime.tileX, slime.tileY);
                  this.performAttack(slime);
                  enemyFound = true;
              break;
                }
            }
          }
          // Check for boss attack
          if (this.bossAlive && this.bossSprite) {
            const dist = Math.max(Math.abs(this.bossTileX - this.knightTileX), Math.abs(this.bossTileY - this.knightTileY));
            if (dist === 1) {
              // Player attacks boss - reduce boss health based on character damage
              let damage = this.characterStats.damage + (this.upgrades.damage * 5);
              
              // Apply temporary damage buff
              if (this.temporaryBuffs.damage.active) {
                damage *= this.temporaryBuffs.damage.multiplier;
              }
              
              if (this.rageActive) {
                damage *= 2; // Double damage when rage is active
                this.rageActive = false; // Consume rage effect
              }
              this.bossHealth = Math.max(0, this.bossHealth - damage);
              
              // Show damage popup above boss
              const { x: bossX, y: bossY } = this.getIsoPos(this.bossTileX, this.bossTileY);
              const damageText = this.add.text(bossX, bossY - 80, `-${damage}`, {
                font: 'bold 22px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
              }).setOrigin(0.5, 0.5).setDepth(100);
              
              // Animate damage text
              this.tweens.add({
                targets: damageText,
                y: bossY - 120,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => damageText.destroy()
              });
            }
          }
          
          // Check for crate breaking
          if (this.crates && this.crates.length > 0) {
            for (let i = this.crates.length - 1; i >= 0; i--) {
              const crate = this.crates[i];
              const dx = Math.abs(crate.tileX - this.knightTileX);
              const dy = Math.abs(crate.tileY - this.knightTileY);
              if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
                // Play break animation
                crate.sprite.play('crate_break');
                if (crate.labelText) crate.labelText.destroy();
                
                // Create drops from broken crate
                this.createCrateDrops(crate.tileX, crate.tileY);
                
                // Remove from array and destroy after animation
                this.crates.splice(i, 1);
                crate.sprite.once('animationcomplete', () => {
                  crate.sprite.destroy();
                });
                break;
              }
            }
          }
          // After attack animation, resume idle anim
          this.knight.once('animationcomplete', () => {
            this.isKnightAttacking = false;
            this.knight.play(`${this.selectedCharacter}_idle_${dir}`);
          });
        } catch (error) {
          console.error('Error in SPACE key attack handler:', error);
          this.isKnightAttacking = false;
        }
        });
        // Inventory toggle
        this.input.keyboard.on('keydown-I', () => {
          this.toggleInventory();
        });
        
        // Delete all save games (Ctrl+Shift+D)
        this.input.keyboard.on('keydown-Ctrl+Shift+D', () => {
          if (confirm('Are you sure you want to delete ALL save games? This action cannot be undone.')) {
            this.deleteAllSaveGames();
          }
        });
        
        // Ctrl+G is now available for future use
        
        // Pause menu (Esc)
        this.input.keyboard.on('keydown-ESC', () => {
          this.togglePauseMenu();
        });
        
        // Store (Left Shift)
        this.input.keyboard.on('keydown-SHIFT', () => {
          const currentTime = this.time.now;
          if (currentTime < (this.storeToggleCooldown || 0)) {
            console.log('Store toggle on cooldown, ignoring Left Shift');
            return;
          }
          this.storeToggleCooldown = currentTime + 300; // 300ms cooldown
          
          console.log('Left Shift pressed - toggling store, current state:', this.storeOpen);
          if (!this.storeOpen) {
            this.openStore();
          } else {
            this.closeStore();
          }
        });
        
        // T key is now available for future use
        // Player health
        this.playerHealth = this.characterStats.health;
        this.playerMaxHealth = this.characterStats.health;
        // Health bar graphics
        // Level display (first)
        // Level text moved to be under the health bar
        this.levelText = this.add.text(24, 100, `Level: ${this.currentLevel}`, { font: 'bold 20px Arial', fill: '#ffff00', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0);
        
        // Gem count display across top of screen
        const { width } = this.sys.game.canvas;
        const gemBarY = 10;
        const gemBarHeight = 30;
        
        // Gem bar background
        this.gemBarBg = this.add.graphics();
        this.gemBarBg.fillStyle(0x000000, 0.8);
        this.gemBarBg.fillRect(0, gemBarY, width, gemBarHeight);
        this.gemBarBg.setScrollFactor(0).setDepth(10);
        
        // Gem counts
        const gemSpacing = width / 5; // 5 gems total (including white placeholder)
        
        this.blueGemDisplay = this.add.text(gemSpacing * 1, gemBarY + 15, `💎 ${this.blueGemCount || 0}`, {
          font: 'bold 18px Arial',
          fill: '#0080ff',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(11);
        
        this.greenGemDisplay = this.add.text(gemSpacing * 2, gemBarY + 15, `💎 ${this.greenGemCount || 0}`, {
          font: 'bold 18px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(11);
        
        this.redGemDisplay = this.add.text(gemSpacing * 3, gemBarY + 15, `💎 ${this.redGemCount || 0}`, {
          font: 'bold 18px Arial',
          fill: '#ff0000',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(11);
        
        this.whiteGemDisplay = this.add.text(gemSpacing * 4, gemBarY + 15, `💎 ${this.whiteGemCount || 0}`, {
          font: 'bold 18px Arial',
          fill: '#ffffff',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(11);
        
        console.log('Gem display elements created:', {
          blue: !!this.blueGemDisplay,
          green: !!this.greenGemDisplay,
          red: !!this.redGemDisplay,
          white: !!this.whiteGemDisplay
        });
        
        // Update gem display to ensure initial values are shown
        this.updateGemDisplay();
        
        // Health bar background
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x222222, 0.8);
        this.healthBarBg.fillRect(20, 60, 204, 34);
        this.healthBarBg.setScrollFactor(0);
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0);
        this.healthBarText = this.add.text(24, 64, `${this.playerHealth}/${this.playerMaxHealth}`, { font: '20px Arial', fill: '#fff' }).setScrollFactor(0);
        
        // Player 2 health bar text for multiplayer mode
        if (this.playerMode === 'multiplayer') {
          this.knight2HealthBarText = this.add.text(24, 104, `P2 Health: ${this.knight2Health}/${this.knight2MaxHealth}`, { font: '20px Arial', fill: '#4444ff' }).setScrollFactor(0);
          this.knight2HealthBarBg = this.add.graphics();
          this.knight2HealthBarBg.fillStyle(0x222222, 0.8);
          this.knight2HealthBarBg.fillRect(20, 100, 204, 34);
          this.knight2HealthBarBg.setScrollFactor(0);
        }
        
        // Gold display
        this.goldText = this.add.text(24, this.playerMode === 'multiplayer' ? 144 : 124, 'Gold: 3000', { font: '20px Arial', fill: '#ffd700' }).setScrollFactor(0);
        
        // Ability text
        this.abilityText = this.add.text(24, this.playerMode === 'multiplayer' ? 184 : 164, `${this.characterStats.ability.key}: ${this.characterStats.ability.name} (Ready)`, { 
          font: '20px Arial', 
          fill: '#00ff00' 
        }).setScrollFactor(0);
        
        // Magic text (for both Knight and Warrior)
        this.magicText = this.add.text(24, this.playerMode === 'multiplayer' ? 224 : 204, `Q: Magic Spell`, { 
          font: '20px Arial', 
          fill: '#00ffff' 
        }).setScrollFactor(0);
        
        // Dash text
        this.dashText = this.add.text(24, this.playerMode === 'multiplayer' ? 264 : 244, `W: Dash (Ready)`, { 
          font: '20px Arial', 
          fill: '#ff8800' 
        }).setScrollFactor(0);
        
        
        // Create inventory UI
        this.createInventoryUI();
        
        // Set initial UI scaling
        this.updateUIScaling();
        
        this.updateHealthBar();
        if (this.playerMode === 'multiplayer') {
          this.updatePlayer2HealthBar();
        }
        
        // Auto-save removed as requested
        
        // Create cursor system
        this.createCursorSystem();
        
        // Load saved game if requested
        if (this.shouldLoadGame) {
          this.loadGame(this.saveName);
        }
        
        // Start spawning enemies
        console.log('Starting enemy spawn system...');
        this.startEnemySpawning();
        
        // Test basic game functionality
        console.log('=== GAME INITIALIZATION COMPLETE ===');
        console.log('Player position:', { x: this.knightTileX, y: this.knightTileY });
        console.log('Spawn points:', { 
          skeleton: this.skeletonSpawnPoints.length, 
          slime: this.slimeSpawnPoints.length 
        });
        console.log('Initial enemies:', { 
          skeletons: this.skeletons.length, 
          slimes: this.slimes.length 
        });
        console.log('Keyboard controls initialized:', {
          cursors: !!this.cursors,
          wasd: { w: !!this.keyW, a: !!this.keyA, s: !!this.keyS, d: !!this.keyD }
        });
      }
      
      startEnemySpawning() {
        console.log('Enemy spawn system started');
        
        // Spawn initial enemies at each spawn point
        this.skeletonSpawnPoints.forEach((spawnPoint, index) => {
          console.log(`Spawning skeleton at spawn point ${index + 1}:`, spawnPoint);
          this.spawnEnemy('skeleton', spawnPoint.x, spawnPoint.y);
        });
        
        this.slimeSpawnPoints.forEach((spawnPoint, index) => {
          console.log(`Spawning slime at spawn point ${index + 1}:`, spawnPoint);
          this.spawnEnemy('slime', spawnPoint.x, spawnPoint.y);
        });
      }
      
      spawnEnemy(type, tileX, tileY) {
        console.log(`Spawning ${type} at tile (${tileX}, ${tileY})`);
        
        const { x, y } = this.getIsoPos(tileX, tileY);
        
        if (type === 'skeleton') {
          const skeleton = this.add.sprite(x, y, 'skeleton_idle_S_0');
          skeleton.setOrigin(0.5, 1);
          skeleton.setPipeline('Light2D');
          skeleton.tileX = tileX;
          skeleton.tileY = tileY;
          skeleton.alive = true;
          skeleton.dir = 'S';
          skeleton.state = 'idle';
          skeleton.lastMoveTime = 0;
          skeleton.lastAttackTime = 0;
          skeleton.play('skeleton_idle_S');
          
          this.skeletons.push(skeleton);
          console.log(`Skeleton spawned, total skeletons: ${this.skeletons.length}`);
        } else if (type === 'slime') {
          const slime = this.add.sprite(x, y, 'slime_idle_S_0');
          slime.setOrigin(0.5, 1);
          slime.setPipeline('Light2D');
          slime.tileX = tileX;
          slime.tileY = tileY;
          slime.alive = true;
          slime.dir = 'S';
          slime.state = 'idle';
          slime.lastMoveTime = 0;
          slime.lastAttackTime = 0;
          slime.play('slime_idle_S');
          
          this.slimes.push(slime);
          console.log(`Slime spawned, total slimes: ${this.slimes.length}`);
        }
      }
      
      update(time, delta) {
        // Simple test to see if update is running
        if (!this._updateCount) this._updateCount = 0;
        this._updateCount++;
        if (this._updateCount === 1) {
          console.log('Game update loop is running!');
        }
        
        // Frame rate limiting to prevent performance issues - REMOVED as it was blocking movement
        // if (!this._lastUpdateTime || time - this._lastUpdateTime < 32) { // ~30 FPS max for better performance
        //   return;
        // }
        this._lastUpdateTime = time;
        
        // Performance monitoring
        if (!this._updateCount) this._updateCount = 0;
        this._updateCount++;
        if (this._updateCount % 100 === 0) {
          console.log(`Update count: ${this._updateCount}, Skeletons: ${this.skeletons?.length || 0}, Slimes: ${this.slimes?.length || 0}, Player pos: (${this.knightTileX}, ${this.knightTileY})`);
        }
        
        // --- PLAYER DEATH LOGIC (run first!) ---
        if (this.playerHealth <= 0 && !this.isKnightDead) {
          this.isKnightDead = true;
          this.isKnightAttacking = true;
          this.isKnightTweening = true;
          this.knight.play(`${this.selectedCharacter}_death_${this.knightDir}`);
          this.knight.once('animationcomplete', () => {
            const cam = this.cameras.main;
            const centerX = cam.worldView.centerX;
            const centerY = cam.worldView.centerY;
            const gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
              font: 'bold 64px Arial',
              fill: '#fff',
              align: 'center',
              stroke: '#000',
              strokeThickness: 10,
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100);
            this.time.delayedCall(2500, () => {
              gameOverText.destroy();
              this.isKnightDead = false;
              this.isKnightAttacking = false;
              this.isKnightTweening = false;
              this.scene.restart();
            });
          });
          return;
        }
        if (this.isKnightDead) return;
        if (this.torchLights) {
          this.torchLights.forEach(obj => {
            obj.light.radius = obj.baseRadius + Phaser.Math.Between(-40, 40);
            obj.light.intensity = obj.baseIntensity + Phaser.Math.FloatBetween(-1.0, 1.0);
          });
        }
        
        // Store toggle is now handled by keyboard event handler (T key)
        // Removed from update loop to prevent conflicts
        
        // Handle save/load with cooldown
        if (this.keySave.isDown && time > this.saveLoadCooldown) {
          this.saveLoadCooldown = time + 1000; // 1 second cooldown
          this.saveGame();
        }
        
        if (this.keyLoad.isDown && time > this.saveLoadCooldown) {
          this.saveLoadCooldown = time + 1000; // 1 second cooldown
          this.loadGame();
        }
        
        // Handle save menu with cooldown
        if (this.keySaveMenu.isDown && time > this.saveLoadCooldown) {
          this.saveLoadCooldown = time + 1000; // 1 second cooldown
          this.openSaveMenu();
        }
        
        // Player 2 attack handling (must be before the early return)
        if (this.playerMode === 'multiplayer' && this.knight2 && this.keyNumpadEnter.isDown) {
          if (!this.isKnight2Attacking) {
            console.log('Player 2 attacking!', this.player2Character, this.knight2Dir);
            this.isKnight2Attacking = true;
            const dir = this.knight2Dir;
            const attackAnim = `${this.player2Character}_attack_${dir}`;
            console.log('Playing attack animation:', attackAnim);
            this.knight2.play(attackAnim);
            
            // Check for adjacent enemies (skeletons and slimes)
            let killed = false;
            
            // Check skeletons
            for (const skeleton of this.skeletons) {
              if (!skeleton.alive) continue;
              const dx = Math.abs(skeleton.tileX - this.knight2TileX);
              const dy = Math.abs(skeleton.tileY - this.knight2TileY);
              if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
                skeleton.alive = false;
                skeleton.play(`skeleton_death_${skeleton.dir}`);
                
                // Show damage popup above skeleton
                const { x: skeletonX, y: skeletonY } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
                const damageText = this.add.text(skeletonX, skeletonY - 60, `-${this.knight2CharacterStats.damage}`, {
                  font: 'bold 18px Arial',
                  fill: '#ffffff',
                  stroke: '#000000',
                  strokeThickness: 2,
                }).setOrigin(0.5, 0.5).setDepth(100);
                
                // Animate damage text
                this.tweens.add({
                  targets: damageText,
                  y: skeletonY - 90,
                  alpha: 0,
                  duration: 800,
                  ease: 'Power2',
                  onComplete: () => damageText.destroy()
                });
                
                // Update enemy counters (cached for performance)
                if (!this._cachedAliveSkeletons || time % 1000 < 16) { // Update cache every ~1 second
                  this._cachedAliveSkeletons = this.skeletons.filter(s => s.alive).length;
                  this._cachedAliveSlimes = this.slimes.filter(s => s.alive).length;
                }
                
                // 80% chance to drop gold
                if (Math.random() < 0.8) {
                  const { x, y } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
                  const amount = Phaser.Math.Between(5, 30);
                  const drop = this.add.image(x, y, 'gold_drop');
                  drop.setOrigin(0.5, 1);
                  drop.setDepth(10);
                  // Show amount above drop
                  const amountText = this.add.text(x, y - 48, `+${amount}`, { font: '18px Arial', fill: '#ffd700', stroke: '#222', strokeThickness: 3 }).setOrigin(0.5, 1).setDepth(11);
                  this.goldDrops.push({ tileX: skeleton.tileX, tileY: skeleton.tileY, sprite: drop, amount, amountText });
                }
                
                // 80% chance to drop gem
                if (Math.random() < 0.8) {
                  const { x, y } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
                  const gemTypes = ['blue', 'green', 'red'];
                  const randomGemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
                  const gemSprite = this.add.image(x, y - 20, `gem_${randomGemType}`);
                  gemSprite.setOrigin(0.5, 1);
                  gemSprite.setDepth(10);
                  
                  this.goldDrops.push({ 
                    tileX: skeleton.tileX, 
                    tileY: skeleton.tileY, 
                    sprite: gemSprite, 
                    amount: 0, 
                    item: `${randomGemType}Gem` 
                  });
                }
                this.time.delayedCall(800, () => skeleton.destroy());
                killed = true;
                
                // Check if all enemies from this spawn point are dead
                this.checkSpawnPointCompletion();
                break;
              }
            }
            
            // Check slimes if no skeleton was killed
            if (!killed) {
              for (const slime of this.slimes) {
                if (!slime.alive) continue;
                const dx = Math.abs(slime.tileX - this.knight2TileX);
                const dy = Math.abs(slime.tileY - this.knight2TileY);
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
                  slime.alive = false;
                  slime.play(`slime_death_${slime.dir}`);
                  
                  // Show damage popup above slime
                  const { x: slimeX, y: slimeY } = this.getIsoPos(slime.tileX, slime.tileY);
                  const damageText = this.add.text(slimeX, slimeY - 60, `-${this.knight2CharacterStats.damage}`, {
                    font: 'bold 18px Arial',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                  }).setOrigin(0.5, 0.5).setDepth(100);
                  
                  // Animate damage text
                  this.tweens.add({
                    targets: damageText,
                    y: slimeY - 90,
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2',
                    onComplete: () => damageText.destroy()
                  });
                  
                  // Update enemy counters (cached for performance)
                  if (!this._cachedAliveSkeletons || time % 1000 < 16) { // Update cache every ~1 second
                    this._cachedAliveSkeletons = this.skeletons.filter(s => s.alive).length;
                    this._cachedAliveSlimes = this.slimes.filter(s => s.alive).length;
                  }

                  
                  // 80% chance to drop gold
                  if (Math.random() < 0.8) {
                    const { x, y } = this.getIsoPos(slime.tileX, slime.tileY);
                    const amount = Phaser.Math.Between(5, 30);
                    const drop = this.add.image(x, y, 'gold_drop');
                    drop.setOrigin(0.5, 1);
                    drop.setDepth(10);
                    // Show amount above drop
                    const amountText = this.add.text(x, y - 48, `+${amount}`, { font: '18px Arial', fill: '#ffd700', stroke: '#222', strokeThickness: 3 }).setOrigin(0.5, 1).setDepth(11);
                    this.goldDrops.push({ tileX: slime.tileX, tileY: slime.tileY, sprite: drop, amount, amountText });
                  }
                  
                  // 80% chance to drop gem
                  if (Math.random() < 0.8) {
                    const { x, y } = this.getIsoPos(slime.tileX, slime.tileY);
                    const gemTypes = ['blue', 'green', 'red'];
                    const randomGemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
                    const gemSprite = this.add.image(x, y - 20, `gem_${randomGemType}`);
                    gemSprite.setOrigin(0.5, 1);
                    gemSprite.setDepth(10);
                    
                    this.goldDrops.push({ 
                      tileX: slime.tileX, 
                      tileY: slime.tileY, 
                      sprite: gemSprite, 
                      amount: 0, 
                      item: `${randomGemType}Gem` 
                    });
                  }
                  this.time.delayedCall(800, () => slime.destroy());
                  killed = true;
                  
                  // Check if all enemies from this spawn point are dead
                  this.checkSpawnPointCompletion();
                  break;
                }
              }
            }
            
                      // After attack animation, resume idle anim
          this.knight2.once('animationcomplete', () => {
            this.isKnight2Attacking = false;
            this.knight2.play(`${this.player2Character}_idle_${dir}`);
          });
          }
        }
        
        // Prevent movement while attacking or tweening (allow movement when store is open)
        if (this.isKnightAttacking || this.isKnightTweening) {
          console.log('Movement blocked:', { 
            isKnightAttacking: this.isKnightAttacking, 
            isKnightTweening: this.isKnightTweening 
          });
          return;
        }
        
        // Check attack cooldown based on character attack speed
        const attackCooldown = 500 / this.characterStats.attackSpeed; // Base 500ms cooldown
        if (this.playerAttackTimer && time - this.playerAttackTimer < attackCooldown) {
          // Still in attack cooldown, don't allow new attacks
        }
        
        // Check and update temporary buffs
        this.updateTemporaryBuffs(time);
        this.updateInventoryUI(time);
        
        // Mana regeneration (only for warrior)
        if (this.selectedCharacter === 'warrior' && this.mana < this.maxMana) {
          if (!this.lastManaRegen || time - this.lastManaRegen > 2000) { // Every 2 seconds
            this.mana = Math.min(this.maxMana, this.mana + 10);
            this.lastManaRegen = time;
          }
        }
        
        // Check Holy Aura expiration
        if (this.holyAuraActive && time - this.holyAuraTimer > 15000) { // 15 seconds
          this.deactivateHolyAura();
        }
        
        // Check Fire Explosion expiration
        if (this.fireExplosionActive && time - this.fireExplosionTimer > 3000) { // 3 seconds
          this.deactivateFireExplosion();
        }
        
        // Check Paw Print expiration
        if (this.pawPrintActive && time - this.pawPrintTimer > 4000) { // 4 seconds
          this.deactivatePawPrint();
        }
        
        // Check Fire Streak expiration
        if (this.fireStreakActive && time - this.fireStreakTimer > 2000) { // 2 seconds
          this.deactivateFireStreak();
        }
        
        // Update health bars
        this.updateHealthBar();
        if (this.playerMode === 'multiplayer') {
          this.updatePlayer2HealthBar();
        }
        
        // Check ability cooldown and handle ability activation
        const cooldownReduction = this.upgrades.abilityCooldown * 0.1; // 10% reduction per upgrade
        const abilityCooldown = this.characterStats.ability.cooldown * (1 - cooldownReduction);
        const canUseAbility = !this.abilityTimer || time - this.abilityTimer > abilityCooldown;
        
        // Update ability UI
        if (this.abilityText) {
        if (canUseAbility) {
          this.abilityText.setColor('#00ff00'); // Green when ready
          this.abilityText.setText(`${this.characterStats.ability.key}: ${this.characterStats.ability.name} (Ready)`);
        } else {
          const remainingTime = Math.ceil((abilityCooldown - (time - this.abilityTimer)) / 1000);
          this.abilityText.setColor('#ff0000'); // Red when on cooldown
          this.abilityText.setText(`${this.characterStats.ability.key}: ${this.characterStats.ability.name} (${remainingTime}s)`);
          }
        }
        
        // Handle ability activation
        if (this.keyE.isDown && canUseAbility && !this.abilityActive) {
          this.activateAbility(time);
        }
        
        // Handle magic activation (for Knight, Warrior, and Fighter)
        if (this.selectedCharacter === 'knight' || this.selectedCharacter === 'warrior' || this.selectedCharacter === 'fighter') {
          const magicCooldown = this.selectedCharacter === 'knight' ? 15000 : 
                               this.selectedCharacter === 'fighter' ? 8000 : 
                               this.selectedCharacter === 'warrior' ? 6000 : 5000; // 15s for Knight, 8s for Fighter, 6s for Warrior
          const canUseMagic = !this.magicTimer || time - this.magicTimer > magicCooldown;
          
          // Update magic UI
          if (this.magicText) {
            // Debug: Log character selection
            if (time % 3000 < 16) { // Log every 3 seconds
              console.log('Magic UI Debug:', {
                selectedCharacter: this.selectedCharacter,
                canUseMagic,
                magicActive: this.magicActive,
                fireExplosionActive: this.fireExplosionActive
              });
            }
            
            if (this.selectedCharacter === 'knight') {
              if (canUseMagic && !this.holyAuraActive) {
                this.magicText.setColor('#00ffff'); // Cyan when ready
                this.magicText.setText(`Q: Holy Light Aura (Ready)`);
              } else if (this.holyAuraActive) {
                const remainingActive = Math.ceil((15000 - (time - this.holyAuraTimer)) / 1000);
                this.magicText.setColor('#ffff00'); // Yellow when active
                this.magicText.setText(`Q: Holy Light Aura (Active: ${remainingActive}s)`);
              } else {
                const remainingTime = Math.ceil((magicCooldown - (time - this.magicTimer)) / 1000);
                this.magicText.setColor('#ff0000'); // Red when on cooldown
                this.magicText.setText(`Q: Holy Light Aura (${remainingTime}s)`);
              }
            } else if (this.selectedCharacter === 'fighter') {
              if (canUseMagic && !this.fireExplosionActive) {
                this.magicText.setColor('#00ffff'); // Cyan when ready
                this.magicText.setText(`Q: Fire Explosion (Ready)`);
              } else if (this.fireExplosionActive) {
                const remainingActive = Math.ceil((3000 - (time - this.fireExplosionTimer)) / 1000);
                this.magicText.setColor('#ffff00'); // Yellow when active
                this.magicText.setText(`Q: Fire Explosion (Active: ${remainingActive}s)`);
              } else {
                const remainingTime = Math.ceil((magicCooldown - (time - this.magicTimer)) / 1000);
                this.magicText.setColor('#ff0000'); // Red when on cooldown
                this.magicText.setText(`Q: Fire Explosion (${remainingTime}s)`);
              }
            } else if (this.selectedCharacter === 'warrior') {
              // Show both abilities for Warrior
              let warriorText = '';
              let textColor = '#00ffff'; // Default cyan
              
              const fireStreakCooldown = 6000; // 6 seconds
              const canUseFireStreak = !this.fireStreakTimer || time - this.fireStreakTimer > fireStreakCooldown;
              
              if (canUseMagic && !this.pawPrintActive && canUseFireStreak && !this.fireStreakActive) {
                textColor = '#00ffff'; // Cyan when both ready
                warriorText = `Q: Paw Print (Ready) | R: Fire Streak (Ready)`;
              } else if (this.pawPrintActive) {
                const remainingActive = Math.ceil((4000 - (time - this.pawPrintTimer)) / 1000);
                textColor = '#ffff00'; // Yellow when active
                warriorText = `Q: Paw Print (Active: ${remainingActive}s) | R: Fire Streak (Ready)`;
              } else if (this.fireStreakActive) {
                const remainingActive = Math.ceil((2000 - (time - this.fireStreakTimer)) / 1000);
                textColor = '#ffff00'; // Yellow when active
                warriorText = `Q: Paw Print (Ready) | R: Fire Streak (Active: ${remainingActive}s)`;
              } else if (!canUseMagic && canUseFireStreak) {
                const remainingTime = Math.ceil((magicCooldown - (time - this.magicTimer)) / 1000);
                textColor = '#ff0000'; // Red when on cooldown
                warriorText = `Q: Paw Print (${remainingTime}s) | R: Fire Streak (Ready)`;
              } else if (canUseMagic && !canUseFireStreak) {
                const remainingTime = Math.ceil((fireStreakCooldown - (time - this.fireStreakTimer)) / 1000);
                textColor = '#ff0000'; // Red when on cooldown
                warriorText = `Q: Paw Print (Ready) | R: Fire Streak (${remainingTime}s)`;
              } else {
                const pawPrintTime = Math.ceil((magicCooldown - (time - this.magicTimer)) / 1000);
                const fireStreakTime = Math.ceil((fireStreakCooldown - (time - this.fireStreakTimer)) / 1000);
                textColor = '#ff0000'; // Red when both on cooldown
                warriorText = `Q: Paw Print (${pawPrintTime}s) | R: Fire Streak (${fireStreakTime}s)`;
              }
              
              this.magicText.setColor(textColor);
              this.magicText.setText(warriorText);
            }
          }
          
          // Handle magic activation
          if (this.keyQ.isDown && canUseMagic && !this.magicActive) {
            console.log('Q pressed for magic:', {
              selectedCharacter: this.selectedCharacter,
              canUseMagic,
              magicActive: this.magicActive,
              holyAuraActive: this.holyAuraActive,
              fireExplosionActive: this.fireExplosionActive,
              mana: this.mana
            });
            
            if (this.selectedCharacter === 'knight' && !this.holyAuraActive) {
              this.activateHolyAura(time);
            } else if (this.selectedCharacter === 'fighter' && !this.fireExplosionActive) {
              console.log('Activating Fire Explosion for Fighter');
              this.activateFireExplosion(time);
            } else if (this.selectedCharacter === 'warrior' && !this.pawPrintActive) {
              console.log('Activating Paw Print for Warrior');
              this.activatePawPrint(time);
            }
          }
          
          // Handle Fire Streak activation for Warrior (R key) - OUTSIDE magic block
          const fireStreakCooldown = 6000; // 6 seconds
          const canUseFireStreak = !this.fireStreakTimer || time - this.fireStreakTimer > fireStreakCooldown;
          
          // Debug: Log R key state and conditions
          if (this.keyR.isDown) {
            console.log('R key pressed!', {
              selectedCharacter: this.selectedCharacter,
              fireStreakActive: this.fireStreakActive,
              canUseFireStreak: canUseFireStreak,
              fireStreakTimer: this.fireStreakTimer,
              time: time,
              timeDiff: this.fireStreakTimer ? time - this.fireStreakTimer : 'no timer'
            });
          }
          
          if (this.keyR.isDown && this.selectedCharacter === 'warrior' && !this.fireStreakActive && canUseFireStreak) {
            console.log('Activating Fire Streak for Warrior');
            this.activateFireStreak(time);
          }
        }
        
        // Handle dash activation
        const dashCooldown = 8000; // 8 seconds
        const canUseDash = !this.dashCooldownTimer || time - this.dashCooldownTimer > dashCooldown;
        
        // Update dash UI
        if (this.dashText) {
          if (this.dashActive) {
            if (this.dashPhase === 'burst') {
              const remainingBurst = Math.ceil((1000 - (time - this.dashTimer)) / 1000);
              this.dashText.setColor('#ffff00'); // Yellow during burst
              this.dashText.setText(`W: Dash (Burst: ${remainingBurst}s)`);
            } else if (this.dashPhase === 'sustained') {
              const remainingSustained = Math.ceil((4000 - (time - this.dashTimer)) / 1000);
              this.dashText.setColor('#ffaa00'); // Orange during sustained
              this.dashText.setText(`W: Dash (Sustained: ${remainingSustained}s)`);
            }
          } else if (canUseDash) {
            this.dashText.setColor('#ff8800'); // Orange when ready
            this.dashText.setText(`W: Dash (Ready)`);
          } else {
            const remainingTime = Math.ceil((dashCooldown - (time - this.dashCooldownTimer)) / 1000);
            this.dashText.setColor('#ff0000'); // Red when on cooldown
            this.dashText.setText(`W: Dash (${remainingTime}s)`);
          }
        }
        
        // Handle dash activation
        if (this.keyW.isDown && canUseDash && !this.dashActive) {
          this.activateDash(time);
        }
        
        // Check dash phase transitions
        if (this.dashActive) {
          if (this.dashPhase === 'burst' && time - this.dashTimer > 1000) {
            // Transition from burst to sustained
            this.dashPhase = 'sustained';
            this.dashTimer = time; // Reset timer for sustained phase
            console.log('Dash: Burst phase ended, entering sustained phase');
          } else if (this.dashPhase === 'sustained' && time - this.dashTimer > 3000) {
            // End sustained phase
            this.deactivateDash(time);
          }
        }
        
        // Only prevent movement if pause menu is open (allow movement in other menus)
        if (this.pauseMenuOpen) {
          console.log('Movement blocked: pause menu is open');
          return;
        }
        
        // Allow movement even when store is open
        if (this.storeOpen) {
          console.log('Store is open but movement allowed');
        }
        
        // Click-to-move movement disabled for now - will be re-enabled for Android app
        
        // Handle keyboard movement
        let dx = 0, dy = 0, dir = this.knightDir;
        
        // Check if knight exists
        if (!this.knight) {
          console.log('ERROR: Knight sprite does not exist!');
          return;
        }
        
        // Simple movement test - always check for input
        if (this.cursors.left.isDown || this.keyA.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.keyD.isDown) dx += 1;
        if (this.cursors.up.isDown) dy -= 1; // Removed W key from movement
        if (this.cursors.down.isDown || this.keyS.isDown) dy += 1;
        
        // Debug: Log any key presses
        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown ||
            this.keyA.isDown || this.keyS.isDown || this.keyD.isDown) {
          console.log('Keys pressed:', {
            arrows: { left: this.cursors.left.isDown, right: this.cursors.right.isDown, up: this.cursors.up.isDown, down: this.cursors.down.isDown },
            wasd: { a: this.keyA.isDown, s: this.keyS.isDown, d: this.keyD.isDown },
            dash: this.keyW.isDown,
            dx, dy
          });
        }
        
        // Debug: Log input state every 60 frames (1 second at 60fps)
        if (this._updateCount % 60 === 0) {
          console.log('Input debug:', {
            cursors: {
              left: this.cursors.left.isDown,
              right: this.cursors.right.isDown,
              up: this.cursors.up.isDown,
              down: this.cursors.down.isDown
            },
            wasd: {
              a: this.keyA.isDown,
              s: this.keyS.isDown,
              d: this.keyD.isDown
            },
            dash: this.keyW.isDown,
            // movementMode: this.movementMode, // Disabled for now
            isKnightAttacking: this.isKnightAttacking,
            isKnightTweening: this.isKnightTweening,
            storeOpen: this.storeOpen
          });
        }
        
        // Debug movement
        if (dx !== 0 || dy !== 0) {
          console.log('Movement detected:', { dx, dy, cursors: {
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
            up: this.cursors.up.isDown,
            down: this.cursors.down.isDown
          }, wasd: {
            a: this.keyA.isDown,
            s: this.keyS.isDown,
            d: this.keyD.isDown
          }, dash: this.keyW.isDown});
        }
        let moveSpeedMultiplier = this.characterStats.movementSpeed;
        if (this.temporaryBuffs.speed.active) {
          moveSpeedMultiplier *= this.temporaryBuffs.speed.multiplier;
        }
        if (this.pawPrintSpeedBoost) {
          moveSpeedMultiplier *= 1.5; // 50% speed boost from Paw Print
        }
        if (this.dashActive) {
          if (this.dashPhase === 'burst') {
            moveSpeedMultiplier *= 4.0; // 4x speed boost during burst phase
          } else if (this.dashPhase === 'sustained') {
            moveSpeedMultiplier *= 2.0; // 2x speed boost during sustained phase
          }
        }
        const MOVE_COOLDOWN = 150 / moveSpeedMultiplier;
        if (dx !== 0 || dy !== 0) {
          if (time - this.lastMoveTime > MOVE_COOLDOWN) {
            dir = getClosestDirection(dx, dy);
            // Clamp knight movement to map bounds
            const newX = Phaser.Math.Clamp(this.knightTileX + dx, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
            const newY = Phaser.Math.Clamp(this.knightTileY + dy, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
            if (newX !== this.knightTileX || newY !== this.knightTileY) {
              // Tween movement
              this.isKnightTweening = true;
              const { x: startX, y: startY } = this.getKnightIsoPos();
              const oldTileX = this.knightTileX;
              const oldTileY = this.knightTileY;
              this.knightTileX = newX;
              this.knightTileY = newY;
              this.knightDir = dir;
              const { x: endX, y: endY } = this.getKnightIsoPos();
              // Set sprite to start position (in case of desync)
              this.knight.x = startX;
              this.knight.y = startY;
              this.tweens && this.tweens.killTweensOf(this.knight);
              this.tweens.add({
                targets: this.knight,
                x: endX,
                y: endY,
                duration: 120,
                onComplete: () => {
                  this.isKnightTweening = false;
                  // Return to idle animation when movement completes
                  if (!this.isKnightAttacking) {
                    const idleAnimKey = `${this.selectedCharacter}_idle_${this.knightDir}`;
                    console.log('Tween complete - returning to idle:', idleAnimKey);
                    this.knight.play(idleAnimKey);
                  }
                },
              });
            }
            // Always use the new 16-direction animation key
            if (!this.knight.anims.currentAnim || this.knight.anims.currentAnim.key !== `${this.selectedCharacter}_walk_${dir}`) {
              this.knight.play(`${this.selectedCharacter}_walk_${dir}`);
            }
            this.lastMoveTime = time;
          }
        } else {
          // Return to idle animation when not moving
          if (!this.isKnightAttacking && !this.isKnightTweening) {
            const currentAnim = this.knight.anims.currentAnim;
            const idleAnimKey = `${this.selectedCharacter}_idle_${this.knightDir}`;
            
            // Only change animation if we're not already playing the correct idle animation
            if (!currentAnim || currentAnim.key !== idleAnimKey) {
              console.log('Returning to idle animation:', idleAnimKey);
              this.knight.play(idleAnimKey);
        }
          }
        }
        
        // Click-to-move movement disabled for now - will be re-enabled for Android app
        if (this.zone && this.knight) {
          const { x, y } = this.getKnightIsoPos();
          this.zone.x = x;
          this.zone.y = y;
        }
        
        // Update player lights to follow players
        if (this.playerLight && this.knight) {
          const { x, y } = this.getKnightIsoPos();
          this.playerLight.x = x;
          this.playerLight.y = y;
        }
        
        // Update Holy Aura position to follow player
        if (this.holyAuraSprite && this.holyAuraActive) {
          const { x, y } = this.getKnightIsoPos();
          this.holyAuraSprite.x = x;
          this.holyAuraSprite.y = y - 20; // Keep it hovering above player
        }
        
        if (this.playerMode === 'multiplayer' && this.player2Light && this.knight2) {
          const { x, y } = this.getKnight2IsoPos();
          this.player2Light.x = x;
          this.player2Light.y = y;
          
          // Update player 2 zone position
          if (this.zone2) {
            this.zone2.x = x;
            this.zone2.y = y;
          }
        }
        
        // Player 2 movement (numpad controls) for multiplayer mode
        if (this.playerMode === 'multiplayer' && this.knight2) {
          // Prevent player 2 movement while attacking or store is open
          if (!this.isKnight2Attacking && !this.isKnight2Tweening && !this.storeOpen) {
          
          let dx2 = 0, dy2 = 0, dir2 = this.knight2Dir;
          
          // Numpad movement controls
          if (this.keyNumpad8.isDown) dy2 -= 1; // North
          if (this.keyNumpad2.isDown) dy2 += 1; // South
          if (this.keyNumpad4.isDown) dx2 -= 1; // West
          if (this.keyNumpad6.isDown) dx2 += 1; // East
          if (this.keyNumpad7.isDown) { dx2 -= 1; dy2 -= 1; } // Northwest
          if (this.keyNumpad9.isDown) { dx2 += 1; dy2 -= 1; } // Northeast
          if (this.keyNumpad1.isDown) { dx2 -= 1; dy2 += 1; } // Southwest
          if (this.keyNumpad3.isDown) { dx2 += 1; dy2 += 1; } // Southeast
          
          let moveSpeedMultiplier2 = this.knight2CharacterStats.movementSpeed;
          const MOVE_COOLDOWN2 = 150 / moveSpeedMultiplier2;
          
          if (dx2 !== 0 || dy2 !== 0) {
            if (time - this.lastMoveTime2 > MOVE_COOLDOWN2) {
              dir2 = getClosestDirection(dx2, dy2);
              // Clamp knight2 movement to map bounds
              const newX2 = Phaser.Math.Clamp(this.knight2TileX + dx2, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
              const newY2 = Phaser.Math.Clamp(this.knight2TileY + dy2, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
              
              // Don't move onto player 1
              if (!(newX2 === this.knightTileX && newY2 === this.knightTileY)) {
                if (newX2 !== this.knight2TileX || newY2 !== this.knight2TileY) {
                  // Tween movement
                  this.isKnight2Tweening = true;
                  const { x: startX2, y: startY2 } = this.getKnight2IsoPos();
                  this.knight2TileX = newX2;
                  this.knight2TileY = newY2;
                  this.knight2Dir = dir2;
                  const { x: endX2, y: endY2 } = this.getKnight2IsoPos();
                  
                  // Set sprite to start position (in case of desync)
                  this.knight2.x = startX2;
                  this.knight2.y = startY2;
                  this.tweens && this.tweens.killTweensOf(this.knight2);
                  this.tweens.add({
                    targets: this.knight2,
                    x: endX2,
                    y: endY2,
                    duration: 120,
                    onComplete: () => {
                      this.isKnight2Tweening = false;
                      // Return to idle animation when movement completes
                      if (!this.isKnight2Attacking) {
                        this.knight2.play(`${this.player2Character}_idle_${this.knight2Dir}`);
                      }
                    },
                  });
                }
                // Always use the new 16-direction animation key
                if (!this.knight2.anims.currentAnim || this.knight2.anims.currentAnim.key !== `${this.player2Character}_walk_${dir2}`) {
                  this.knight2.play(`${this.player2Character}_walk_${dir2}`);
                }
                this.lastMoveTime2 = time;
              }
            }
          } else {
            // Return to idle animation when not moving
            if (!this.isKnight2Attacking && !this.isKnight2Tweening) {
              if (!this.knight2.anims.currentAnim || this.knight2.anims.currentAnim.key !== `${this.player2Character}_idle_${this.knight2Dir}`) {
                this.knight2.play(`${this.player2Character}_idle_${this.knight2Dir}`);
              }
            }
          }
          
          // Update player 2 position
          this.updateKnight2Position();
          }
        }
        // Update skeleton positions and AI - Relentless Pursuit Mode (with performance throttling)
        if (this.skeletons && time % 100 < 16) { // Only update every ~100ms for performance
          console.log(`Processing ${this.skeletons.length} skeletons`);
          for (const skeleton of this.skeletons) {
            if (!skeleton.alive) continue;
            
            // Initialize skeleton properties
            if (!skeleton.lastMoveTime) skeleton.lastMoveTime = 0;
            if (!skeleton.dir) skeleton.dir = 'S';
            
            const dx = this.knightTileX - skeleton.tileX;
            const dy = this.knightTileY - skeleton.tileY;
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            
            // Attack if adjacent
            if (dist <= 1) {
              if (skeleton.state !== 'attack' || skeleton.anims.currentAnim.key !== `skeleton_attack_${skeleton.dir}`) {
                skeleton.state = 'attack';
                skeleton.play(`skeleton_attack_${skeleton.dir}`);
              }
            } else if (dist <= 10) {
              // Only chase player if within 10 tiles
              // Play walk animation
              if (!skeleton.anims.currentAnim || skeleton.anims.currentAnim.key !== `skeleton_walk_${skeleton.dir}`) {
                skeleton.state = 'chase';
                skeleton.play(`skeleton_walk_${skeleton.dir}`);
              }
              
              // Move toward player every frame (with small cooldown for smooth movement)
              const ENEMY_MOVE_COOLDOWN = 200; // Faster movement
              if (!skeleton.lastMoveTime || time - skeleton.lastMoveTime > ENEMY_MOVE_COOLDOWN) {
                // Calculate direction toward player
                const moveDx = Math.sign(dx);
                const moveDy = Math.sign(dy);
                
                // Update skeleton direction based on movement
                if (moveDx > 0 && moveDy === 0) skeleton.dir = 'E';
                else if (moveDx < 0 && moveDy === 0) skeleton.dir = 'W';
                else if (moveDx === 0 && moveDy > 0) skeleton.dir = 'S';
                else if (moveDx === 0 && moveDy < 0) skeleton.dir = 'N';
                else if (moveDx > 0 && moveDy > 0) skeleton.dir = 'SE';
                else if (moveDx > 0 && moveDy < 0) skeleton.dir = 'NE';
                else if (moveDx < 0 && moveDy > 0) skeleton.dir = 'SW';
                else if (moveDx < 0 && moveDy < 0) skeleton.dir = 'NW';
                
                // Move one tile toward player
                const newX = Phaser.Math.Clamp(skeleton.tileX + moveDx, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
                const newY = Phaser.Math.Clamp(skeleton.tileY + moveDy, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
                
                // Don't move onto player and respect 3-enemy stacking limit
                if (!(newX === this.knightTileX && newY === this.knightTileY) && 
                    this.countEnemiesOnTile(newX, newY) < 3) {
                  skeleton.tileX = newX;
                  skeleton.tileY = newY;
                }
                skeleton.lastMoveTime = time;
              }
            } else {
              // Idle if too far from player
              if (!skeleton.anims.currentAnim || skeleton.anims.currentAnim.key !== `skeleton_idle_${skeleton.dir}`) {
                skeleton.state = 'idle';
                skeleton.play(`skeleton_idle_${skeleton.dir}`);
              }
            }
            
            // Update sprite position
            if (skeleton.alive) {
              const { x, y } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
              skeleton.x = x;
              skeleton.y = y;
            }
            
            // Attack player if adjacent (with cooldown)
            if (dist <= 1 && (!skeleton.lastAttackTime || time - skeleton.lastAttackTime > 2000)) {
              // Deal damage to player
              let damage = 10; // Skeleton damage
              if (this.shieldActive || this.temporaryBuffs.shield.active) {
                damage = 0; // Block all damage when shield is active
                this.shieldActive = false; // Consume shield effect
              } else if (this.holyAuraProtection) {
                damage = Math.floor(damage * 0.5); // Reduce damage by 50% when Holy Aura is active
              }
              this.playerHealth = Math.max(0, this.playerHealth - damage);
              
              // Show damage popup above player
              if (damage > 0) {
                const { x: playerX, y: playerY } = this.getKnightIsoPos();
                const damageText = this.add.text(playerX, playerY - 80, `-${damage}`, {
                  font: 'bold 20px Arial',
                  fill: '#ffffff',
                  stroke: '#000000',
                  strokeThickness: 3,
                }).setOrigin(0.5, 0.5).setDepth(100);
                
                // Animate damage text
                this.tweens.add({
                  targets: damageText,
                  y: playerY - 120,
                  alpha: 0,
                  duration: 1000,
                  ease: 'Power2',
                  onComplete: () => damageText.destroy()
                });
              }
              
              skeleton.lastAttackTime = time;
            }
          }
        }
        
        // Update slime positions and AI - Slower, more methodical movement (with performance throttling)
        if (this.slimes && time % 150 < 16) { // Only update every ~150ms for performance (slower than skeletons)
          console.log(`Processing ${this.slimes.length} slimes`);
          for (const slime of this.slimes) {
            if (!slime.alive) continue;
            
            // Initialize slime properties
            if (!slime.lastMoveTime) slime.lastMoveTime = 0;
            if (!slime.dir) slime.dir = 'S';
            
            const dx = this.knightTileX - slime.tileX;
            const dy = this.knightTileY - slime.tileY;
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            
            // Attack if adjacent
            if (dist <= 1) {
              // Slimes don't have attack animations, so they just idle when adjacent
              if (slime.state !== 'idle' || slime.anims.currentAnim.key !== `slime_idle_${slime.dir}`) {
                slime.state = 'idle';
                slime.play(`slime_idle_${slime.dir}`);
              }
            } else if (dist <= 10) {
              // Only chase player if within 10 tiles
              if (!slime.anims.currentAnim || slime.anims.currentAnim.key !== `slime_walk_${slime.dir}`) {
                slime.state = 'chase';
                slime.play(`slime_walk_${slime.dir}`);
              }
              
              // Move toward player with longer cooldown (slower than skeletons)
              const SLIME_MOVE_COOLDOWN = 400; // Slower movement than skeletons
              if (!slime.lastMoveTime || time - slime.lastMoveTime > SLIME_MOVE_COOLDOWN) {
                // Calculate direction toward player
                const moveDx = Math.sign(dx);
                const moveDy = Math.sign(dy);
                
                // Update slime direction based on movement
                if (moveDx > 0 && moveDy === 0) slime.dir = 'E';
                else if (moveDx < 0 && moveDy === 0) slime.dir = 'W';
                else if (moveDx === 0 && moveDy > 0) slime.dir = 'S';
                else if (moveDx === 0 && moveDy < 0) slime.dir = 'N';
                else if (moveDx > 0 && moveDy > 0) slime.dir = 'SE';
                else if (moveDx > 0 && moveDy < 0) slime.dir = 'NE';
                else if (moveDx < 0 && moveDy > 0) slime.dir = 'SW';
                else if (moveDx < 0 && moveDy < 0) slime.dir = 'NW';
                
                // Move one tile toward player
                const newX = Phaser.Math.Clamp(slime.tileX + moveDx, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
                const newY = Phaser.Math.Clamp(slime.tileY + moveDy, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
                
                // Don't move onto player and respect 3-enemy stacking limit
                if (!(newX === this.knightTileX && newY === this.knightTileY) && 
                    this.countEnemiesOnTile(newX, newY) < 3) {
                  slime.tileX = newX;
                  slime.tileY = newY;
                }
                slime.lastMoveTime = time;
              }
            } else {
              // Idle if too far from player
              if (!slime.anims.currentAnim || slime.anims.currentAnim.key !== `slime_idle_${slime.dir}`) {
                slime.state = 'idle';
                slime.play(`slime_idle_${slime.dir}`);
              }
            }
            
            // Update sprite position
            if (slime.alive) {
              const { x, y } = this.getIsoPos(slime.tileX, slime.tileY);
              slime.x = x;
              slime.y = y;
            }
            
            // Attack player if adjacent (with cooldown)
            if (dist <= 1 && (!slime.lastAttackTime || time - slime.lastAttackTime > 3000)) {
                          // Deal damage to player
            let damage = 8; // Slime damage (less than skeleton)
            if (this.shieldActive || this.temporaryBuffs.shield.active) {
              damage = 0; // Block all damage when shield is active
              this.shieldActive = false; // Consume shield effect
            } else if (this.holyAuraProtection) {
              damage = Math.floor(damage * 0.5); // Reduce damage by 50% when Holy Aura is active
            }
            this.playerHealth = Math.max(0, this.playerHealth - damage);
              
              // Show damage popup above player
              if (damage > 0) {
                const { x: playerX, y: playerY } = this.getKnightIsoPos();
                const damageText = this.add.text(playerX, playerY - 80, `-${damage}`, {
                  font: 'bold 20px Arial',
                  fill: '#ffffff',
                  stroke: '#000000',
                  strokeThickness: 3,
                }).setOrigin(0.5, 0.5).setDepth(100);
                
                // Animate damage text
                this.tweens.add({
                  targets: damageText,
                  y: playerY - 120,
                  alpha: 0,
                  duration: 1000,
                  ease: 'Power2',
                  onComplete: () => damageText.destroy()
                });
              }
              
              slime.lastAttackTime = time;
            }
          }
        }
        
        // --- Skeleton spawn point spawning ---
        for (let i = 0; i < this.skeletonSpawnPoints.length; i++) {
          const sp = this.skeletonSpawnPoints[i];
          const spd = this.skeletonSpawnData[i];
          if (spd.active && spd.count < spd.max) {
            if (!spd.timer || time - spd.timer > 4000) { // 4 second spawn interval
              // Try to spawn at spawn point, or within 3-tile radius if occupied
              let spawnX = sp.x, spawnY = sp.y;
              let found = false;
              
              // Quick check for spawn point availability
              const spawnOccupied = this.skeletons.some(s => s.alive && s.tileX === spawnX && s.tileY === spawnY) ||
                                   this.slimes.some(s => s.alive && s.tileX === spawnX && s.tileY === spawnY);
              
              if (!spawnOccupied) {
                  found = true;
              } else {
                // Try a random tile within 3-tile radius (limited tries for performance)
                for (let tries = 0; tries < 5 && !found; tries++) {
                  const dx = Phaser.Math.Between(-3, 3);
                  const dy = Phaser.Math.Between(-3, 3);
                const tx = Phaser.Math.Clamp(sp.x + dx, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
                const ty = Phaser.Math.Clamp(sp.y + dy, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
                  
                  const tileOccupied = this.skeletons.some(s => s.alive && s.tileX === tx && s.tileY === ty) ||
                                       this.slimes.some(s => s.alive && s.tileX === tx && s.tileY === ty);
                  
                  if (!tileOccupied) {
                  spawnX = tx;
                  spawnY = ty;
                  found = true;
                  break;
                }
              }
              }
              
              if (found) {
              const { x, y } = this.getIsoPos(spawnX, spawnY);
              const skeleton = this.add.sprite(x, y, 'skeleton_idle_S_0');
              skeleton.setOrigin(0.5, 1);
              skeleton.setPipeline('Light2D');
              skeleton.play(`skeleton_idle_S`);
              skeleton.tileX = spawnX;
              skeleton.tileY = spawnY;
              skeleton.alive = true;
              skeleton.state = 'idle';
              skeleton.lastMoveTime = 0;
              skeleton.dir = 'S';
              skeleton.roamCooldown = 0;
              skeleton.isInitial = false;
                skeleton.type = 'skeleton';
                skeleton.spawnPointIndex = i; // Track which spawn point created this enemy
              this.skeletons.push(skeleton);
              spd.count++;
              spd.timer = time;
                
                // Update counters (cached for performance)
                if (!this._cachedAliveSkeletons || time % 1000 < 16) { // Update cache every ~1 second
                  this._cachedAliveSkeletons = this.skeletons.filter(s => s.alive).length;
                  this._cachedAliveSlimes = this.slimes.filter(s => s.alive).length;
                }

              }
            }
          }
        }
        
        // --- Slime spawn point spawning ---
        for (let i = 0; i < this.slimeSpawnPoints.length; i++) {
          const sp = this.slimeSpawnPoints[i];
          const spd = this.slimeSpawnData[i];
          if (spd.active && spd.count < spd.max) {
            if (!spd.timer || time - spd.timer > 6000) { // 6 second spawn interval (slower than skeletons)
              // Try to spawn at spawn point, or within 3-tile radius if occupied
              let spawnX = sp.x, spawnY = sp.y;
              let found = false;
              
              // Quick check for spawn point availability
              const spawnOccupied = this.skeletons.some(s => s.alive && s.tileX === spawnX && s.tileY === spawnY) ||
                                   this.slimes.some(s => s.alive && s.tileX === spawnX && s.tileY === spawnY);
              
              if (!spawnOccupied) {
                found = true;
              } else {
                // Try a random tile within 3-tile radius (limited tries for performance)
                for (let tries = 0; tries < 5 && !found; tries++) {
                  const dx = Phaser.Math.Between(-3, 3);
                  const dy = Phaser.Math.Between(-3, 3);
                  const tx = Phaser.Math.Clamp(sp.x + dx, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
                  const ty = Phaser.Math.Clamp(sp.y + dy, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
                  
                  const tileOccupied = this.skeletons.some(s => s.alive && s.tileX === tx && s.tileY === ty) ||
                                       this.slimes.some(s => s.alive && s.tileX === tx && s.tileY === ty);
                  
                  if (!tileOccupied) {
                    spawnX = tx;
                    spawnY = ty;
                    found = true;
                    break;
                  }
                }
              }
              
              if (found) {
                const { x, y } = this.getIsoPos(spawnX, spawnY);
                const slime = this.add.sprite(x, y, 'slime_idle_S_0');
                slime.setOrigin(0.5, 1);
                slime.setPipeline('Light2D');
                slime.play(`slime_idle_S`);
                slime.tileX = spawnX;
                slime.tileY = spawnY;
                slime.alive = true;
                slime.state = 'idle';
                slime.lastMoveTime = 0;
                slime.dir = 'S';
                slime.roamCooldown = 0;
                slime.isInitial = false;
                slime.type = 'slime';
                slime.spawnPointIndex = i; // Track which spawn point created this enemy
                this.slimes.push(slime);
                spd.count++;
                spd.timer = time;
                
                // Update counters (cached for performance)
                if (!this._cachedAliveSkeletons || time % 1000 < 16) { // Update cache every ~1 second
                  this._cachedAliveSkeletons = this.skeletons.filter(s => s.alive).length;
                  this._cachedAliveSlimes = this.slimes.filter(s => s.alive).length;
                }

              }
            }
          }
        }
        // Update health bar (in case health changes)
        this.updateHealthBar();
        if (this.playerMode === 'multiplayer') {
          this.updatePlayer2HealthBar();
        }
        // Gold drop and item pickup logic
        if (this.goldDrops && this.goldDrops.length > 0) {
          // Safety check: limit number of drops to prevent memory issues
          if (this.goldDrops.length > 50) {
            console.warn('Too many gold drops, cleaning up old ones');
            for (let i = 0; i < 10; i++) {
              if (this.goldDrops[i]) {
                this.goldDrops[i].sprite.destroy();
                if (this.goldDrops[i].amountText) this.goldDrops[i].amountText.destroy();
              }
            }
            this.goldDrops.splice(0, 10);
          }
          
          for (let i = this.goldDrops.length - 1; i >= 0; i--) {
            const drop = this.goldDrops[i];
            if (!drop || !drop.sprite) continue; // Safety check
            
            const dist = Math.abs(drop.tileX - this.knightTileX) + Math.abs(drop.tileY - this.knightTileY);
            if (dist <= 2) {
              drop.sprite.destroy();
              if (drop.amountText) drop.amountText.destroy();
              this.goldDrops.splice(i, 1);
              
              if (drop.item) {
                // Special item pickup
                console.log(`Attempting to pick up item: ${drop.item}`);
                if (drop.item === 'blueGem' || drop.item === 'greenGem' || drop.item === 'redGem') {
                  // Gem pickup
                  console.log(`Gem pickup detected! Item: ${drop.item}`);
                  
                  const gemType = drop.item.replace('Gem', '');
                  const gemColor = gemType === 'blue' ? '#0080ff' : gemType === 'green' ? '#00ff00' : '#ff0000';
                  const gemName = gemType.charAt(0).toUpperCase() + gemType.slice(1);
                  
                  // Update the appropriate gem counter
                  if (gemType === 'blue') {
                    this.blueGemCount += 1;
                    console.log(`Blue gem count updated to: ${this.blueGemCount}`);
                  } else if (gemType === 'green') {
                    this.greenGemCount += 1;
                    console.log(`Green gem count updated to: ${this.greenGemCount}`);
                  } else if (gemType === 'red') {
                    this.redGemCount += 1;
                    console.log(`Red gem count updated to: ${this.redGemCount}`);
                  }
                  
                  console.log(`Picked up a ${gemType} gem! Counts: Blue=${this.blueGemCount}, Green=${this.greenGemCount}, Red=${this.redGemCount}`);
                  
                  // Show pickup notification
                  const cam = this.cameras.main;
                  const centerX = cam.worldView.centerX;
                  const centerY = cam.worldView.centerY - 100;
                  const pickupText = this.add.text(centerX, centerY, `Picked up ${gemName} Gem!`, {
                    font: 'bold 24px Arial',
                    fill: gemColor,
                    stroke: '#000',
                    strokeThickness: 4,
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
                  this.time.delayedCall(2000, () => pickupText.destroy());
                } else {
                  // Other special items
                console.log(`Picked up ${drop.item}!`);
                this.applyItemEffect(drop.item);
                
                // Show pickup notification
                const cam = this.cameras.main;
                const centerX = cam.worldView.centerX;
                const centerY = cam.worldView.centerY - 100;
                const pickupText = this.add.text(centerX, centerY, `Picked up ${drop.item}!`, {
                  font: 'bold 24px Arial',
                  fill: '#00ff00',
                  stroke: '#000',
                  strokeThickness: 4,
                }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
                this.time.delayedCall(2000, () => pickupText.destroy());
                }
              } else {
                // Gold pickup
                this.goldCount += drop.amount;
                if (this.goldText) this.goldText.setText(`Gold: ${this.goldCount}`);
                console.log(`Picked up ${drop.amount} gold!`);
              }
            }
          }
        }
        // --- Boss incoming popup ---
        if (!this.bossIncomingShown && this.skeletons.every(s => !s.alive) && this.slimes.every(s => !s.alive)) {
          console.log('=== BOSS SPAWNING ===');
          console.log('Boss incoming shown:', this.bossIncomingShown);
          console.log('Skeletons alive:', this.skeletons.filter(s => s.alive).length);
          console.log('Slimes alive:', this.slimes.filter(s => s.alive).length);
          console.log('All enemies dead:', this.skeletons.every(s => !s.alive) && this.slimes.every(s => !s.alive));
          
          this.bossIncomingShown = true;
          const cam = this.cameras.main;
          const centerX = cam.worldView.centerX;
          const centerY = cam.worldView.centerY;
          this.bossIncomingText = this.add.text(centerX, centerY, 'BOSS INCOMING', {
            font: 'bold 64px Arial',
            fill: '#ff4444',
            align: 'center',
            stroke: '#000',
            strokeThickness: 10,
          }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100);
          this.time.delayedCall(2000, () => {
            if (this.bossIncomingText) this.bossIncomingText.destroy();
            // Spawn boss in center of map
            if (!this.bossSprite) {
              const bossTileX = Math.floor((MAP_WIDTH + MAP_RIGHT_BUFFER) / 2);
              const bossTileY = Math.floor((MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER) / 2);
              const { x, y } = this.getIsoPos(bossTileX, bossTileY);
              this.bossSprite = this.add.sprite(x, y, 'demonlord_idle_S_0');
              this.bossSprite.setOrigin(0.5, 1);
              this.bossSprite.setDepth(50);
              this.bossSprite.play('demonlord_idle_S');
              this.bossAlive = true;
              this.bossTileX = bossTileX;
              this.bossTileY = bossTileY;
              // Boss starts facing South
              this.bossDir = 'S';
              // Boss health bar
              this.bossHealthBarBg = this.add.graphics();
              this.bossHealthBarBg.fillStyle(0x222222, 0.8);
              this.bossHealthBarBg.fillRect(20, 90, 404, 34);
              this.bossHealthBarBg.setScrollFactor(0);
              this.bossHealthBar = this.add.graphics();
              this.bossHealthBar.setScrollFactor(0);
              this.bossHealthText = this.add.text(24, 94, 'Boss: 200', { font: '20px Arial', fill: '#fff' }).setScrollFactor(0);
            }
          });
        }
        // --- Boss logic ---
        if (this.bossAlive && this.bossSprite) {
          // Boss movement (every 1s)
          if (!this.bossMoveTimer || time - this.bossMoveTimer > 1000) {
            let dx = this.knightTileX - this.bossTileX;
            let dy = this.knightTileY - this.bossTileY;
            // Pick direction
            const bossDir = getClosestDirection(dx, dy);
            this.bossDir = bossDir;
            let moveDx = Math.sign(dx);
            let moveDy = Math.sign(dy);
            const newX = Phaser.Math.Clamp(this.bossTileX + moveDx, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
            const newY = Phaser.Math.Clamp(this.bossTileY + moveDy, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
            this.bossTileX = newX;
            this.bossTileY = newY;
            const { x, y } = this.getIsoPos(newX, newY);
            this.bossSprite.x = x;
            this.bossSprite.y = y;
            // Play walk animation in correct direction
            if (!this.bossSprite.anims.currentAnim || this.bossSprite.anims.currentAnim.key !== `demonlord_walk_${bossDir}`) {
              this.bossSprite.play(`demonlord_walk_${bossDir}`);
            }
            this.bossMoveTimer = time;
          }
          // Boss attack if adjacent (with cooldown)
          const dist = Math.max(Math.abs(this.knightTileX - this.bossTileX), Math.abs(this.knightTileY - this.bossTileY));
          if (dist === 1 && (!this.bossAttackTimer || time - this.bossAttackTimer > 1000)) {
            // Play attack animation in correct direction
            if (!this.bossSprite.anims.currentAnim || this.bossSprite.anims.currentAnim.key !== `demonlord_attack1_${this.bossDir}`) {
              this.bossSprite.play(`demonlord_attack1_${this.bossDir}`);
              // Boss attacks player - reduce player health
              let damage = 15;
              if (this.shieldActive || this.temporaryBuffs.shield.active) {
                damage = 0; // Block all damage when shield is active
                this.shieldActive = false; // Consume shield effect
                // Note: temporary shield buff is handled in updateTemporaryBuffs
              } else if (this.holyAuraProtection) {
                damage = Math.floor(damage * 0.5); // Reduce damage by 50% when Holy Aura is active
              }
              this.playerHealth = Math.max(0, this.playerHealth - damage);
              
              // Show damage popup above player
              if (damage > 0) {
                const { x: playerX, y: playerY } = this.getKnightIsoPos();
                const damageText = this.add.text(playerX, playerY - 80, `-${damage}`, {
                  font: 'bold 20px Arial',
                  fill: '#ffffff',
                  stroke: '#000000',
                  strokeThickness: 3,
                }).setOrigin(0.5, 0.5).setDepth(100);
                
                // Animate damage text
                this.tweens.add({
                  targets: damageText,
                  y: playerY - 120,
                  alpha: 0,
                  duration: 1000,
                  ease: 'Power2',
                  onComplete: () => damageText.destroy()
                });
              }
              this.bossAttackTimer = time;
              // Use a timeout as fallback in case animationcomplete doesn't fire
              this.time.delayedCall(800, () => {
                if (this.bossSprite && this.bossSprite.anims.currentAnim && this.bossSprite.anims.currentAnim.key.startsWith('demonlord_attack1')) {
                  this.bossSprite.play(`demonlord_idle_${this.bossDir}`);
                }
              });
              this.bossSprite.once('animationcomplete', () => {
                if (this.bossSprite) {
                this.bossSprite.play(`demonlord_idle_${this.bossDir}`);
                }
              });
            }
          } else {
            // If not attacking, play idle animation in correct direction
            if (!this.bossSprite.anims.currentAnim || !this.bossSprite.anims.currentAnim.key.startsWith('demonlord_idle')) {
              this.bossSprite.play(`demonlord_idle_${this.bossDir}`);
            }
          }
          // Update boss health bar
          this.bossHealthBar && this.bossHealthBar.clear();
          this.bossHealthBar && this.bossHealthBar.fillStyle(0xff4444, 1);
          this.bossHealthBar && this.bossHealthBar.fillRect(22, 92, 2 * this.bossHealth, 30);
          this.bossHealthText && this.bossHealthText.setText(`Boss: ${this.bossHealth}`);
          // Boss death
          if (this.bossHealth <= 0 && !this.victoryShown) {
            this.bossAlive = false;
            
            // Create boss drops
            this.createBossDrops();
            
            // Play death animation in correct direction, then destroy
            this.bossSprite.play(`demonlord_death_${this.bossDir}`);
            this.bossSprite.once('animationcomplete', () => {
              this.bossSprite.destroy();
            });
            this.bossHealthBar && this.bossHealthBar.destroy();
            this.bossHealthBarBg && this.bossHealthBarBg.destroy();
            this.bossHealthText && this.bossHealthText.destroy();
            this.victoryShown = true;
            const cam = this.cameras.main;
            const centerX = cam.worldView.centerX;
            const centerY = cam.worldView.centerY;
            const victoryText = this.add.text(centerX, centerY, 'VICTORY!', {
              font: 'bold 64px Arial',
              fill: '#fff',
              align: 'center',
              stroke: '#000',
              strokeThickness: 10,
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100);
            this.time.delayedCall(3000, () => victoryText.destroy());
          }
        }
      }
      createBossDrops() {
        // Boss always drops 3-5 piles of gold
        const goldPileCount = Phaser.Math.Between(3, 5);
        for (let i = 0; i < goldPileCount; i++) {
          const dropTileX = this.bossTileX + Phaser.Math.Between(-2, 2);
          const dropTileY = this.bossTileY + Phaser.Math.Between(-2, 2);
          const { x, y } = this.getIsoPos(dropTileX, dropTileY);
          
          // Create gold drop sprite
          const goldSprite = this.add.sprite(x, y, 'gold_drop');
          goldSprite.setOrigin(0.5, 1);
          goldSprite.setDepth(10);
          
          // Random gold amount between 50 and 500
          const goldAmount = Phaser.Math.Between(50, 500);
          
          // Add gold amount text
          const amountText = this.add.text(x, y - 20, `+${goldAmount}`, {
            font: 'bold 16px Arial',
            fill: '#ffd700',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0.5).setDepth(11);
          
          // Add to gold drops array
          this.goldDrops.push({
            sprite: goldSprite,
            amountText: amountText,
            tileX: dropTileX,
            tileY: dropTileY,
            amount: goldAmount
          });
        }
        
        // Boss drops 3-6 crates
        const crateCount = Phaser.Math.Between(3, 6);
        for (let i = 0; i < crateCount; i++) {
          const dropTileX = this.bossTileX + Phaser.Math.Between(-3, 3);
          const dropTileY = this.bossTileY + Phaser.Math.Between(-3, 3);
          const { x, y } = this.getIsoPos(dropTileX, dropTileY);
          
          // Create crate sprite
          const crateSprite = this.add.sprite(x, y, 'crate');
          crateSprite.setOrigin(0.5, 1);
          crateSprite.setDepth(10);
          
          // Add crate label
          const crateText = this.add.text(x, y - 20, 'Crate', {
            font: 'bold 14px Arial',
            fill: '#8B4513',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0.5).setDepth(11);
          
          // Add to crates array
          this.crates.push({
            sprite: crateSprite,
            labelText: crateText,
            tileX: dropTileX,
            tileY: dropTileY
          });
        }
        
        console.log(`Boss drops created: ${goldPileCount} gold piles, ${crateCount} crates`);
      }
      
      createCrateDrops(tileX, tileY) {
        const { x, y } = this.getIsoPos(tileX, tileY);
        
        // Crates always drop a gold pile (100% chance)
        const goldAmount = Phaser.Math.Between(25, 100);
        const goldSprite = this.add.sprite(x, y, 'gold_drop');
        goldSprite.setOrigin(0.5, 1);
        goldSprite.setDepth(10);
        
        const goldText = this.add.text(x, y - 20, `+${goldAmount}`, {
          font: 'bold 16px Arial',
          fill: '#ffd700',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(11);
        
        this.goldDrops.push({
          sprite: goldSprite,
          amountText: goldText,
          tileX: tileX,
          tileY: tileY,
          amount: goldAmount
        });
        
        // 80% chance to drop a gemstone (blue, green, or red)
        let gemDropped = false;
        if (Math.random() < 0.8) {
          gemDropped = true;
          const gemTypes = ['blue', 'green', 'red'];
          const randomGem = gemTypes[Phaser.Math.Between(0, 2)];
          console.log(`Creating ${randomGem} gem drop`);
          const gemSprite = this.add.sprite(x + 20, y, `gem_${randomGem}`);
          gemSprite.setOrigin(0.5, 1);
          gemSprite.setDepth(10);
          
          const gemText = this.add.text(x + 20, y - 20, `${randomGem.charAt(0).toUpperCase() + randomGem.slice(1)} Gem`, {
            font: 'bold 14px Arial',
            fill: randomGem === 'blue' ? '#0080ff' : randomGem === 'green' ? '#00ff00' : '#ff0000',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0.5).setDepth(11);
          
          this.goldDrops.push({
            sprite: gemSprite,
            amountText: gemText,
            tileX: tileX,
            tileY: tileY,
            amount: 0, // No gold value for gems
            item: `${randomGem}Gem` // Special item type
          });
        }
        
        console.log(`Crate broken! Dropped ${goldAmount} gold and ${gemDropped ? 'a gem' : 'no gem'}`);
      }
      
      updateKnightPosition() {
        const { x, y } = this.getKnightIsoPos();
        this.knight.x = x;
        this.knight.y = y;
        
        // Update buff visual effects to follow player
        this.updateBuffVisualEffects(x, y);
      }
      getKnightIsoPos() {
        // Staggered isometric
        const x = this.knightTileX * (ISO_TILE_WIDTH / 2) + (this.knightTileY % 2 ? ISO_TILE_WIDTH / 4 : 0);
        const y = this.knightTileY * (ISO_TILE_HEIGHT / 2);
        return { x, y };
      }
      getIsoPos(tileX, tileY) {
        // Staggered isometric
        const x = tileX * (ISO_TILE_WIDTH / 2) + (tileY % 2 ? ISO_TILE_WIDTH / 4 : 0);
        const y = tileY * (ISO_TILE_HEIGHT / 2);
        return { x, y };
      }
      
      getPushDirection(enemyTileX, enemyTileY, playerTileX, playerTileY) {
        // Calculate direction from player to enemy for knockback
        const dx = enemyTileX - playerTileX;
        const dy = enemyTileY - playerTileY;
        
        // Normalize to get push direction
        if (dx === 0 && dy === 0) {
          return { x: 0, y: 1 }; // Default push down if same position
        }
        
        const length = Math.sqrt(dx * dx + dy * dy);
        return {
          x: Math.round(dx / length),
          y: Math.round(dy / length)
        };
      }
      
      updateKnight2Position() {
        if (this.knight2) {
          const { x, y } = this.getKnight2IsoPos();
          this.knight2.x = x;
          this.knight2.y = y;
        }
      }
      
      getKnight2IsoPos() {
        return this.getIsoPos(this.knight2TileX, this.knight2TileY);
      }
      updateHealthBar() {
        // Draw the health bar (red, shrinks as health drops)
        const health = Math.max(0, this.playerHealth);
        const maxHealth = this.playerMaxHealth;
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff4444, 1);
        this.healthBar.fillRect(22, 22, 2 * health, 30);
        this.healthBarText.setText(`${health}/${maxHealth}`);
      }
      
      updatePlayer2HealthBar() {
        if (this.playerMode === 'multiplayer' && this.knight2HealthBar) {
          // Draw player 2 health bar (blue, positioned below player 1)
          const health = Math.max(0, this.knight2Health);
          const maxHealth = this.knight2MaxHealth;
          this.knight2HealthBar.clear();
          this.knight2HealthBar.fillStyle(0x4444ff, 1);
          this.knight2HealthBar.fillRect(22, 62, 2 * health, 30);
          
          // Update health text
          if (this.knight2HealthBarText) {
            this.knight2HealthBarText.setText(`P2 Health: ${health}/${maxHealth}`);
          }
        }
      }
      
      activateAbility(time) {
        this.abilityTimer = time;
        this.abilityActive = true;
        
        // Reduce movement speed by 50% during ability
        this.characterStats.movementSpeed *= 0.5;
        
        const effect = this.characterStats.ability.effect;
        const character = this.selectedCharacter;
        
        // Get player position and direction
        const { x, y } = this.getKnightIsoPos();
        const playerDir = this.knightDir;
        
        // Calculate direction vector based on player facing direction
        let dirX = 0, dirY = 0;
        switch (playerDir) {
          case 'N': dirY = -1; break;
          case 'S': dirY = 1; break;
          case 'E': dirX = 1; break;
          case 'W': dirX = -1; break;
          case 'NE': dirX = 1; dirY = -1; break;
          case 'NW': dirX = -1; dirY = -1; break;
          case 'SE': dirX = 1; dirY = 1; break;
          case 'SW': dirX = -1; dirY = 1; break;
        }
        
        switch (effect) {
          case 'shield':
            // Knight: Shield Bash - creates protective barrier and pushes enemies back
            this.shieldActive = true;
            
            // Create directional shield effect
            const shieldEffect = this.add.graphics();
            shieldEffect.lineStyle(6, 0x00ffff, 0.9);
            shieldEffect.strokeCircle(x, y, 20);
            shieldEffect.setDepth(5);
            
            // Animate shield expansion in facing direction
            this.tweens.add({
              targets: shieldEffect,
              x: x + (dirX * 60),
              y: y + (dirY * 60),
              scaleX: 2,
              scaleY: 2,
              alpha: 0,
              duration: 1500,
              ease: 'Power2',
              onComplete: () => {
              shieldEffect.destroy();
              }
            });
            
            // Add directional shield particles
            for (let i = 0; i < 12; i++) {
              const particle = this.add.graphics();
              particle.fillStyle(0x00ffff, 0.8);
              particle.fillCircle(0, 0, 3);
              particle.setDepth(5);
              
              // Spread particles in a cone in the facing direction
              const spreadAngle = Math.PI / 3; // 60 degree spread
              const baseAngle = Math.atan2(dirY, dirX);
              const angle = baseAngle + (spreadAngle * (i - 6) / 6); // Spread particles
              const distance = 30;
              particle.x = x + Math.cos(angle) * distance;
              particle.y = y + Math.sin(angle) * distance;
              
              this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 80,
                y: y + Math.sin(angle) * 80,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => particle.destroy()
              });
            }
            
            // Push back enemies in the direction player is facing
            for (const skeleton of this.skeletons) {
              if (!skeleton.alive) continue;
              const dx = skeleton.tileX - this.knightTileX;
              const dy = skeleton.tileY - this.knightTileY;
              const dist = Math.max(Math.abs(dx), Math.abs(dy));
              
              // Check if enemy is in the direction player is facing
              let inDirection = false;
              if (dist <= 3) { // 3 tile range
                if (dirX > 0 && dx > 0) inDirection = true; // Facing East
                else if (dirX < 0 && dx < 0) inDirection = true; // Facing West
                else if (dirY > 0 && dy > 0) inDirection = true; // Facing South
                else if (dirY < 0 && dy < 0) inDirection = true; // Facing North
                else if (dirX > 0 && dirY < 0 && dx > 0 && dy < 0) inDirection = true; // Facing NE
                else if (dirX < 0 && dirY < 0 && dx < 0 && dy < 0) inDirection = true; // Facing NW
                else if (dirX > 0 && dirY > 0 && dx > 0 && dy > 0) inDirection = true; // Facing SE
                else if (dirX < 0 && dirY > 0 && dx < 0 && dy > 0) inDirection = true; // Facing SW
              }
              
              if (inDirection) {
                // Push enemy away
                const pushDir = this.getPushDirection(skeleton.tileX, skeleton.tileY, this.knightTileX, this.knightTileY);
                const newTileX = skeleton.tileX + pushDir.x;
                const newTileY = skeleton.tileY + pushDir.y;
                
                if (newTileX >= 0 && newTileX < MAP_WIDTH && newTileY >= 0 && newTileY < MAP_HEIGHT) {
                  skeleton.tileX = newTileX;
                  skeleton.tileY = newTileY;
                  const newPos = this.getIsoPos(newTileX, newTileY);
                  this.tweens.add({
                    targets: skeleton,
                    x: newPos.x,
                    y: newPos.y,
                    duration: 500,
                    ease: 'Power2'
                  });
                }
              }
            }
            
            this.time.delayedCall(2000, () => {
              this.abilityActive = false;
              this.shieldActive = false;
              // Restore movement speed
              this.characterStats.movementSpeed = CHARACTER_STATS[this.selectedCharacter].movementSpeed;
            });
            break;
            
          case 'rage':
            // Fighter: Rage Strike - next attack deals massive damage with fire effects
            this.rageActive = true;
            
            // Create directional fire aura effect
            const rageEffect = this.add.graphics();
            rageEffect.lineStyle(8, 0xff4400, 0.9);
            rageEffect.strokeCircle(x, y, 30);
            rageEffect.setDepth(5);
            
            // Animate fire aura in facing direction
            this.tweens.add({
              targets: rageEffect,
              x: x + (dirX * 45),
              y: y + (dirY * 45),
              scaleX: 1.5,
              scaleY: 1.5,
              alpha: 0.5,
              duration: 2000,
              yoyo: true,
              repeat: 1,
              onComplete: () => {
              rageEffect.destroy();
              }
            });
            
            // Add directional fire particles
            for (let i = 0; i < 20; i++) {
              const particle = this.add.graphics();
              particle.fillStyle(0xff6600, 0.9);
              particle.fillCircle(0, 0, 2);
              particle.setDepth(5);
              
              // Spread particles in a cone in the facing direction
              const spreadAngle = Math.PI / 2; // 90 degree spread
              const baseAngle = Math.atan2(dirY, dirX);
              const angle = baseAngle + (spreadAngle * (Math.random() - 0.5));
              const distance = 30 + Math.random() * 30;
              particle.x = x + Math.cos(angle) * distance;
              particle.y = y + Math.sin(angle) * distance;
              
              this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * (distance + 40),
                y: y + Math.sin(angle) * (distance + 40),
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
              });
            }
            
            // Add screen shake effect
            this.cameras.main.shake(300, 0.01);
            
            this.time.delayedCall(3000, () => {
              this.abilityActive = false;
              if (this.rageActive) {
                this.rageActive = false; // Expire if not used
              }
              // Restore movement speed
              this.characterStats.movementSpeed = CHARACTER_STATS[this.selectedCharacter].movementSpeed;
            });
            break;
            
          case 'slam':
            // Warrior: Ground Slam - massive area attack with earthquake effect
            this.abilityActive = false;
            
            // Create directional earthquake effect
            const slamEffect = this.add.graphics();
            slamEffect.lineStyle(10, 0x8B4513, 0.9);
            slamEffect.strokeCircle(x, y, 100);
            slamEffect.setDepth(5);
            
            // Animate earthquake expansion in facing direction
            this.tweens.add({
              targets: slamEffect,
              x: x + (dirX * 100),
              y: y + (dirY * 100),
              scaleX: 1.5,
              scaleY: 1.5,
              alpha: 0,
              duration: 2000,
              ease: 'Power2',
              onComplete: () => {
                slamEffect.destroy();
              }
            });
            
            // Add directional shockwave particles
            for (let i = 0; i < 16; i++) {
              const particle = this.add.graphics();
              particle.fillStyle(0x8B4513, 0.8);
              particle.fillCircle(0, 0, 4);
              particle.setDepth(5);
              
              // Spread particles in a cone in the facing direction
              const spreadAngle = Math.PI / 1.5; // 120 degree spread
              const baseAngle = Math.atan2(dirY, dirX);
              const angle = baseAngle + (spreadAngle * (i - 8) / 8); // Spread particles
              const distance = 50;
              particle.x = x + Math.cos(angle) * distance;
              particle.y = y + Math.sin(angle) * distance;
              
              this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 150,
                y: y + Math.sin(angle) * 150,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
              });
            }
            
            // Add screen shake effect
            this.cameras.main.shake(800, 0.02);
            
            // Damage enemies in the direction player is facing
            for (const skeleton of this.skeletons) {
              if (!skeleton.alive) continue;
              const dx = skeleton.tileX - this.knightTileX;
              const dy = skeleton.tileY - this.knightTileY;
              const dist = Math.max(Math.abs(dx), Math.abs(dy));
              
              // Check if enemy is in the direction player is facing
              let inDirection = false;
              if (dist <= 4) { // 4 tile range
                if (dirX > 0 && dx > 0) inDirection = true; // Facing East
                else if (dirX < 0 && dx < 0) inDirection = true; // Facing West
                else if (dirY > 0 && dy > 0) inDirection = true; // Facing South
                else if (dirY < 0 && dy < 0) inDirection = true; // Facing North
                else if (dirX > 0 && dirY < 0 && dx > 0 && dy < 0) inDirection = true; // Facing NE
                else if (dirX < 0 && dirY < 0 && dx < 0 && dy < 0) inDirection = true; // Facing NW
                else if (dirX > 0 && dirY > 0 && dx > 0 && dy > 0) inDirection = true; // Facing SE
                else if (dirX < 0 && dirY > 0 && dx < 0 && dy > 0) inDirection = true; // Facing SW
              }
              
              if (inDirection) {
                skeleton.alive = false;
                skeleton.play(`skeleton_death_${skeleton.dir}`);
                
                // Add knockback effect
                const knockbackDir = this.getPushDirection(skeleton.tileX, skeleton.tileY, this.knightTileX, this.knightTileY);
                const knockbackDistance = Math.max(0, 3 - dist); // Closer enemies get knocked back further
                const newTileX = skeleton.tileX + knockbackDir.x * knockbackDistance;
                const newTileY = skeleton.tileY + knockbackDir.y * knockbackDistance;
                
                if (newTileX >= 0 && newTileX < MAP_WIDTH && newTileY >= 0 && newTileY < MAP_HEIGHT) {
                  const newPos = this.getIsoPos(newTileX, newTileY);
                  this.tweens.add({
                    targets: skeleton,
                    x: newPos.x,
                    y: newPos.y,
                    duration: 600,
                    ease: 'Power2',
                    onComplete: () => skeleton.destroy()
                  });
                } else {
                this.time.delayedCall(800, () => skeleton.destroy());
              }
            }
            }
            
            // Also damage slimes in direction
            for (const slime of this.slimes) {
              if (!slime.alive) continue;
              const dx = slime.tileX - this.knightTileX;
              const dy = slime.tileY - this.knightTileY;
              const dist = Math.max(Math.abs(dx), Math.abs(dy));
              
              // Check if enemy is in the direction player is facing
              let inDirection = false;
              if (dist <= 4) { // 4 tile range
                if (dirX > 0 && dx > 0) inDirection = true; // Facing East
                else if (dirX < 0 && dx < 0) inDirection = true; // Facing West
                else if (dirY > 0 && dy > 0) inDirection = true; // Facing South
                else if (dirY < 0 && dy < 0) inDirection = true; // Facing North
                else if (dirX > 0 && dirY < 0 && dx > 0 && dy < 0) inDirection = true; // Facing NE
                else if (dirX < 0 && dirY < 0 && dx < 0 && dy < 0) inDirection = true; // Facing NW
                else if (dirX > 0 && dirY > 0 && dx > 0 && dy > 0) inDirection = true; // Facing SE
                else if (dirX < 0 && dirY > 0 && dx < 0 && dy > 0) inDirection = true; // Facing SW
              }
              
              if (inDirection) {
                slime.alive = false;
                slime.play(`slime_death_${slime.dir}`);
                
                // Add knockback effect for slimes too
                const knockbackDir = this.getPushDirection(slime.tileX, slime.tileY, this.knightTileX, this.knightTileY);
                const knockbackDistance = Math.max(0, 3 - dist);
                const newTileX = slime.tileX + knockbackDir.x * knockbackDistance;
                const newTileY = slime.tileY + knockbackDir.y * knockbackDistance;
                
                if (newTileX >= 0 && newTileX < MAP_WIDTH && newTileY >= 0 && newTileY < MAP_HEIGHT) {
                  const newPos = this.getIsoPos(newTileX, newTileY);
                  this.tweens.add({
                    targets: slime,
                    x: newPos.x,
                    y: newPos.y,
                    duration: 600,
                    ease: 'Power2',
                    onComplete: () => slime.destroy()
                  });
                } else {
                  this.time.delayedCall(800, () => slime.destroy());
                }
              }
            }
            
            this.time.delayedCall(2000, () => {
              // Effect complete
              // Restore movement speed
              this.characterStats.movementSpeed = CHARACTER_STATS[this.selectedCharacter].movementSpeed;
            });
            break;
        }
      }
      
      activateMagic(time) {
        this.magicTimer = time;
        this.magicActive = true;
        this.mana -= 25; // Cost 25 mana
        
        // Get player position and direction
        const { x, y } = this.getKnightIsoPos();
        const playerDir = this.knightDir;
        
        // Calculate direction vector based on player facing direction
        let dirX = 0, dirY = 0;
        switch (playerDir) {
          case 'N': dirY = -1; break;
          case 'S': dirY = 1; break;
          case 'E': dirX = 1; break;
          case 'W': dirX = -1; break;
          case 'NE': dirX = 1; dirY = -1; break;
          case 'NW': dirX = -1; dirY = -1; break;
          case 'SE': dirX = 1; dirY = 1; break;
          case 'SW': dirX = -1; dirY = 1; break;
        }
        
        // Create magic spell effect at player position
        const magicSpell = this.add.sprite(x, y, 'magic_spell');
        magicSpell.setOrigin(0.5, 0.5);
        magicSpell.setDepth(5);
        magicSpell.setScale(2); // Make it larger
        
        // Play the magic animation
        magicSpell.play('magic_spell');
        
        // Add screen shake effect
        this.cameras.main.shake(500, 0.02);
        
        // Create directional magic circle effect
        const magicCircle = this.add.graphics();
        magicCircle.lineStyle(4, 0x00ffff, 0.8);
        magicCircle.strokeCircle(x, y, 30);
        magicCircle.setDepth(4);
        
        // Animate the magic circle in the direction player is facing
        this.tweens.add({
          targets: magicCircle,
          x: x + (dirX * 90), // Move in facing direction
          y: y + (dirY * 90),
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 1500,
          ease: 'Power2',
          onComplete: () => {
            magicCircle.destroy();
          }
        });
        
        // Add directional magic particles
        for (let i = 0; i < 15; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0x00ffff, 0.8);
          particle.fillCircle(0, 0, 2);
          particle.setDepth(5);
          
          // Start particles in a cone shape in the facing direction
          const spreadAngle = Math.PI / 4; // 45 degree spread
          const baseAngle = Math.atan2(dirY, dirX);
          const angle = baseAngle + (spreadAngle * (i - 7) / 7); // Spread particles
          const distance = 40;
          particle.x = x + Math.cos(angle) * distance;
          particle.y = y + Math.sin(angle) * distance;
          
          this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * 120,
            y: y + Math.sin(angle) * 120,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          });
        }
        
        // Damage enemies in the direction player is facing
        const magicDamage = 50; // High magic damage
        
        // Damage skeletons
        for (const skeleton of this.skeletons) {
          if (!skeleton.alive) continue;
          const dx = skeleton.tileX - this.knightTileX;
          const dy = skeleton.tileY - this.knightTileY;
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          
          // Check if enemy is in the direction player is facing
          let inDirection = false;
          if (dist <= 3) { // 3 tile range
            if (dirX > 0 && dx > 0) inDirection = true; // Facing East
            else if (dirX < 0 && dx < 0) inDirection = true; // Facing West
            else if (dirY > 0 && dy > 0) inDirection = true; // Facing South
            else if (dirY < 0 && dy < 0) inDirection = true; // Facing North
            else if (dirX > 0 && dirY < 0 && dx > 0 && dy < 0) inDirection = true; // Facing NE
            else if (dirX < 0 && dirY < 0 && dx < 0 && dy < 0) inDirection = true; // Facing NW
            else if (dirX > 0 && dirY > 0 && dx > 0 && dy > 0) inDirection = true; // Facing SE
            else if (dirX < 0 && dirY > 0 && dx < 0 && dy > 0) inDirection = true; // Facing SW
          }
          
          if (inDirection) {
            skeleton.alive = false;
            skeleton.play(`skeleton_death_${skeleton.dir}`);
            
            // Show magic damage popup
            const { x: enemyX, y: enemyY } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
            const damageText = this.add.text(enemyX, enemyY - 60, `-${magicDamage}`, {
              font: 'bold 18px Arial',
              fill: '#00ffff',
              stroke: '#000000',
              strokeThickness: 2,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            this.tweens.add({
              targets: damageText,
              y: enemyY - 90,
              alpha: 0,
              duration: 800,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
            
            this.time.delayedCall(800, () => skeleton.destroy());
            this.handleEnemyDeath(skeleton, 'skeleton');
          }
        }
        
        // Damage slimes
        for (const slime of this.slimes) {
          if (!slime.alive) continue;
          const dx = slime.tileX - this.knightTileX;
          const dy = slime.tileY - this.knightTileY;
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          
          // Check if enemy is in the direction player is facing
          let inDirection = false;
          if (dist <= 3) { // 3 tile range
            if (dirX > 0 && dx > 0) inDirection = true; // Facing East
            else if (dirX < 0 && dx < 0) inDirection = true; // Facing West
            else if (dirY > 0 && dy > 0) inDirection = true; // Facing South
            else if (dirY < 0 && dy < 0) inDirection = true; // Facing North
            else if (dirX > 0 && dirY < 0 && dx > 0 && dy < 0) inDirection = true; // Facing NE
            else if (dirX < 0 && dirY < 0 && dx < 0 && dy < 0) inDirection = true; // Facing NW
            else if (dirX > 0 && dirY > 0 && dx > 0 && dy > 0) inDirection = true; // Facing SE
            else if (dirX < 0 && dirY > 0 && dx < 0 && dy > 0) inDirection = true; // Facing SW
          }
          
          if (inDirection) {
            slime.alive = false;
            slime.play(`slime_death_${slime.dir}`);
            
            // Show magic damage popup
            const { x: enemyX, y: enemyY } = this.getIsoPos(slime.tileX, slime.tileY);
            const damageText = this.add.text(enemyX, enemyY - 60, `-${magicDamage}`, {
              font: 'bold 18px Arial',
              fill: '#00ffff',
              stroke: '#000000',
              strokeThickness: 2,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            this.tweens.add({
              targets: damageText,
              y: enemyY - 90,
              alpha: 0,
              duration: 800,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
            
            this.time.delayedCall(800, () => slime.destroy());
            this.handleEnemyDeath(slime, 'slime');
          }
        }
        
        // Damage boss if in range and direction
        if (this.bossAlive && this.bossSprite) {
          const dx = this.bossTileX - this.knightTileX;
          const dy = this.bossTileY - this.knightTileY;
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          
          // Check if boss is in the direction player is facing
          let inDirection = false;
          if (dist <= 3) { // 3 tile range
            if (dirX > 0 && dx > 0) inDirection = true; // Facing East
            else if (dirX < 0 && dx < 0) inDirection = true; // Facing West
            else if (dirY > 0 && dy > 0) inDirection = true; // Facing South
            else if (dirY < 0 && dy < 0) inDirection = true; // Facing North
            else if (dirX > 0 && dirY < 0 && dx > 0 && dy < 0) inDirection = true; // Facing NE
            else if (dirX < 0 && dirY < 0 && dx < 0 && dy < 0) inDirection = true; // Facing NW
            else if (dirX > 0 && dirY > 0 && dx > 0 && dy > 0) inDirection = true; // Facing SE
            else if (dirX < 0 && dirY > 0 && dx < 0 && dy > 0) inDirection = true; // Facing SW
          }
          
          if (inDirection) {
            this.bossHealth -= magicDamage;
            
            // Show magic damage popup on boss
            const { x: bossX, y: bossY } = this.getIsoPos(this.bossTileX, this.bossTileY);
            const damageText = this.add.text(bossX, bossY - 80, `-${magicDamage}`, {
              font: 'bold 24px Arial',
              fill: '#00ffff',
              stroke: '#000000',
              strokeThickness: 3,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            this.tweens.add({
              targets: damageText,
              y: bossY - 110,
              alpha: 0,
              duration: 1000,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
            
            // Update boss health bar
            if (this.bossHealthBar && this.bossHealthText) {
              const healthPercent = this.bossHealth / 200;
              this.bossHealthBar.setScale(healthPercent, 1);
              this.bossHealthText.setText(`Boss: ${this.bossHealth}/200`);
            }
            
            // Check if boss is dead
            if (this.bossHealth <= 0) {
              this.bossAlive = false;
              this.bossSprite.play(`demonlord_death_${this.bossDir}`);
              this.time.delayedCall(2000, () => {
                this.bossSprite.destroy();
                this.createBossDrops();
              });
            }
          }
        }
        
        // Clean up magic spell sprite after animation
        magicSpell.once('animationcomplete', () => {
          magicSpell.destroy();
          this.magicActive = false;
        });
        
        // Mana regeneration over time
        this.time.delayedCall(1000, () => {
          if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + 5);
          }
        });
      }
      activateHolyAura(time) {
        this.magicTimer = time;
        this.holyAuraTimer = time;
        this.holyAuraActive = true;
        this.magicActive = true;
        
        // Get player position
        const { x, y } = this.getKnightIsoPos();
        
        // Create Holy Light Aura sprite that hovers over the player
        this.holyAuraSprite = this.add.sprite(x, y - 20, 'holy_light_aura'); // Position slightly above player
        this.holyAuraSprite.setOrigin(0.5, 0.5);
        this.holyAuraSprite.setDepth(6); // Above other effects
        this.holyAuraSprite.setScale(1.5); // Make it larger
        
        // Play the Holy Light Aura animation
        this.holyAuraSprite.play('holy_light_aura');
        
        // Add screen shake effect
        this.cameras.main.shake(300, 0.01);
        
        // Add holy light particles around the player
        for (let i = 0; i < 12; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0x00ffff, 0.8);
          particle.fillCircle(0, 0, 3);
          particle.setDepth(5);
          
          const angle = (i / 12) * Math.PI * 2;
          const distance = 40;
          particle.x = x + Math.cos(angle) * distance;
          particle.y = y + Math.sin(angle) * distance;
          
          // Create floating animation for particles
          this.tweens.add({
            targets: particle,
            y: particle.y - 20,
            alpha: 0.3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
        
        // Add healing effect - restore health over time
        this.time.delayedCall(1000, () => {
          if (this.holyAuraActive && this.playerHealth < this.playerMaxHealth) {
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 5);
            this.updateHealthBar();
          }
        });
        
        // Add protection effect - reduce damage taken
        this.holyAuraProtection = true;
        
        console.log('Holy Light Aura activated!');
      }
      
      deactivateHolyAura() {
        this.holyAuraActive = false;
        this.magicActive = false;
        this.holyAuraProtection = false;
        
        // Remove Holy Light Aura sprite
        if (this.holyAuraSprite) {
          this.holyAuraSprite.destroy();
          this.holyAuraSprite = null;
        }
        
        // Add deactivation effect
        const { x, y } = this.getKnightIsoPos();
        const deactivationEffect = this.add.graphics();
        deactivationEffect.lineStyle(4, 0x00ffff, 0.8);
        deactivationEffect.strokeCircle(x, y, 50);
        deactivationEffect.setDepth(5);
        
        this.tweens.add({
          targets: deactivationEffect,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => deactivationEffect.destroy()
        });
        
        console.log('Holy Light Aura deactivated!');
      }
      
      activateFireExplosion(time) {
        this.magicTimer = time;
        this.fireExplosionTimer = time;
        this.fireExplosionActive = true;
        this.magicActive = true;
        
        // Get player position
        const { x, y } = this.getKnightIsoPos();
        
        // Create Fire Explosion sprite at player position
        const fireExplosionSprite = this.add.sprite(x, y, 'fire_explosion');
        fireExplosionSprite.setOrigin(0.5, 0.5);
        fireExplosionSprite.setDepth(6); // Above other effects
        fireExplosionSprite.setScale(2.0); // Make it larger for impact
        
        // Play the Fire Explosion animation
        fireExplosionSprite.play('fire_explosion');
        
        // Add intense screen shake effect
        this.cameras.main.shake(500, 0.02);
        
        // Add fire particles around the explosion
        for (let i = 0; i < 20; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0xff6600, 0.9);
          particle.fillCircle(0, 0, 4);
          particle.setDepth(5);
          
          const angle = (i / 20) * Math.PI * 2;
          const distance = 60;
          particle.x = x + Math.cos(angle) * distance;
          particle.y = y + Math.sin(angle) * distance;
          
          // Create expanding animation for particles
          this.tweens.add({
            targets: particle,
            x: particle.x + Math.cos(angle) * 40,
            y: particle.y + Math.sin(angle) * 40,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          });
        }
        
        // Deal massive damage to all enemies in range
        const explosionRange = 3; // 3 tile radius
        const playerTileX = this.knightTileX;
        const playerTileY = this.knightTileY;
        
        // Damage skeletons
        this.skeletons.forEach(skeleton => {
          if (skeleton.alive) {
            const dx = Math.abs(skeleton.tileX - playerTileX);
            const dy = Math.abs(skeleton.tileY - playerTileY);
            const distance = Math.max(dx, dy);
            
            if (distance <= explosionRange) {
              // Deal massive damage (50 damage)
              skeleton.health = Math.max(0, skeleton.health - 50);
              
              // Show damage popup
              const { x: enemyX, y: enemyY } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
              const damageText = this.add.text(enemyX, enemyY - 60, '-50', {
                font: 'bold 24px Arial',
                fill: '#ff6600',
                stroke: '#000000',
                strokeThickness: 4,
              }).setOrigin(0.5, 0.5).setDepth(100);
              
              // Animate damage text
              this.tweens.add({
                targets: damageText,
                y: enemyY - 100,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => damageText.destroy()
              });
              
              // Check if skeleton dies
              if (skeleton.health <= 0) {
                this.handleEnemyDeath(skeleton, 'skeleton');
              }
            }
          }
        });
        
        // Damage slimes
        this.slimes.forEach(slime => {
          if (slime.alive) {
            const dx = Math.abs(slime.tileX - playerTileX);
            const dy = Math.abs(slime.tileY - playerTileY);
            const distance = Math.max(dx, dy);
            
            if (distance <= explosionRange) {
              // Deal massive damage (50 damage)
              slime.health = Math.max(0, slime.health - 50);
              
              // Show damage popup
              const { x: enemyX, y: enemyY } = this.getIsoPos(slime.tileX, slime.tileY);
              const damageText = this.add.text(enemyX, enemyY - 60, '-50', {
                font: 'bold 24px Arial',
                fill: '#ff6600',
                stroke: '#000000',
                strokeThickness: 4,
              }).setOrigin(0.5, 0.5).setDepth(100);
              
              // Animate damage text
              this.tweens.add({
                targets: damageText,
                y: enemyY - 100,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => damageText.destroy()
              });
              
              // Check if slime dies
              if (slime.health <= 0) {
                this.handleEnemyDeath(slime, 'slime');
              }
            }
          }
        });
        
        // Damage boss if in range
        if (this.bossAlive && this.bossSprite) {
          const dx = Math.abs(this.bossTileX - playerTileX);
          const dy = Math.abs(this.bossTileY - playerTileY);
          const distance = Math.max(dx, dy);
          
          if (distance <= explosionRange) {
            // Deal significant damage to boss (25 damage)
            this.bossHealth = Math.max(0, this.bossHealth - 25);
            
            // Show damage popup
            const { x: bossX, y: bossY } = this.getIsoPos(this.bossTileX, this.bossTileY);
            const damageText = this.add.text(bossX, bossY - 80, '-25', {
              font: 'bold 28px Arial',
              fill: '#ff6600',
              stroke: '#000000',
              strokeThickness: 4,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            // Animate damage text
            this.tweens.add({
              targets: damageText,
              y: bossY - 120,
              alpha: 0,
              duration: 1500,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
          }
        }
        
        // Remove explosion sprite after animation completes and reset magic active
        fireExplosionSprite.once('animationcomplete', () => {
          fireExplosionSprite.destroy();
          this.magicActive = false; // Reset magic active after animation completes
        });
        
        console.log('Fire Explosion activated!');
      }
      
      deactivateFireExplosion() {
        this.fireExplosionActive = false;
        // magicActive is reset in animation completion callback
        
        console.log('Fire Explosion deactivated!');
      }
      
      activatePawPrint(time) {
        this.magicTimer = time;
        this.pawPrintTimer = time;
        this.pawPrintActive = true;
        this.magicActive = true;
        
        // Get player position
        const { x, y } = this.getKnightIsoPos();
        
        // Create Paw Print sprite at player position
        const pawPrintSprite = this.add.sprite(x, y, 'paw_print');
        pawPrintSprite.setOrigin(0.5, 0.5);
        pawPrintSprite.setDepth(6); // Above other effects
        pawPrintSprite.setScale(1.5); // Make it larger for visibility
        
        // Play the Paw Print animation
        pawPrintSprite.play('paw_print');
        
        // Add subtle screen shake effect
        this.cameras.main.shake(200, 0.005);
        
        // Add dust particles around the paw print
        for (let i = 0; i < 8; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0x8B4513, 0.7); // Brown color
          particle.fillCircle(0, 0, 2);
          particle.setDepth(5);
          
          const angle = (i / 8) * Math.PI * 2;
          const distance = 30;
          particle.x = x + Math.cos(angle) * distance;
          particle.y = y + Math.sin(angle) * distance;
          
          // Create floating animation for particles
          this.tweens.add({
            targets: particle,
            y: particle.y - 15,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          });
        }
        
        // Increase movement speed temporarily
        this.pawPrintSpeedBoost = true;
        
        // Remove paw print sprite after animation completes
        pawPrintSprite.once('animationcomplete', () => {
          pawPrintSprite.destroy();
          this.magicActive = false; // Reset magic active after animation completes
        });
        
        console.log('Paw Print activated!');
      }
      
      deactivatePawPrint() {
        this.pawPrintActive = false;
        this.pawPrintSpeedBoost = false;
        
        console.log('Paw Print deactivated!');
      }
      
      activateFireStreak(time) {
        console.log('activateFireStreak called!', { time, fireStreakActive: this.fireStreakActive });
        this.fireStreakTimer = time;
        this.fireStreakActive = true;
        // Don't set magicActive since Fire Streak is independent
        
        // Get player position and direction
        const { x, y } = this.getKnightIsoPos();
        
        // Calculate direction vector based on player facing direction
        let dirX = 0, dirY = 0;
        switch (this.knightDir) {
          case 'N': dirY = -1; break;
          case 'S': dirY = 1; break;
          case 'E': dirX = 1; break;
          case 'W': dirX = -1; break;
          case 'NE': dirX = 1; dirY = -1; break;
          case 'NW': dirX = -1; dirY = -1; break;
          case 'SE': dirX = 1; dirY = 1; break;
          case 'SW': dirX = -1; dirY = 1; break;
        }
        
        // Create Fire Streak sprite in the direction the player is facing
        const streakDistance = 80; // Distance from player
        const streakX = x + (dirX * streakDistance);
        const streakY = y + (dirY * streakDistance);
        
        const fireStreakSprite = this.add.sprite(streakX, streakY, 'fire_streak');
        fireStreakSprite.setOrigin(0.5, 0.5);
        fireStreakSprite.setDepth(6); // Above other effects
        fireStreakSprite.setScale(1.2); // Make it slightly larger
        
        // Rotate the sprite to face the direction
        const angle = Math.atan2(dirY, dirX) * (180 / Math.PI);
        fireStreakSprite.setRotation(angle * (Math.PI / 180));
        
        // Play the Fire Streak animation
        fireStreakSprite.play('fire_streak');
        
        // Add screen shake effect
        this.cameras.main.shake(300, 0.01);
        
        // Add fire particles around the streak
        for (let i = 0; i < 12; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0xff6600, 0.8);
          particle.fillCircle(0, 0, 3);
          particle.setDepth(5);
          
          const angle = (i / 12) * Math.PI * 2;
          const distance = 40;
          particle.x = streakX + Math.cos(angle) * distance;
          particle.y = streakY + Math.sin(angle) * distance;
          
          // Create expanding animation for particles
          this.tweens.add({
            targets: particle,
            x: particle.x + Math.cos(angle) * 30,
            y: particle.y + Math.sin(angle) * 30,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          });
        }
        
        // Deal damage to enemies in the streak direction
        const streakRange = 2; // 2 tile radius
        const playerTileX = this.knightTileX;
        const playerTileY = this.knightTileY;
        
        // Damage skeletons in streak direction
        this.skeletons.forEach(skeleton => {
          if (skeleton.alive) {
            const dx = skeleton.tileX - playerTileX;
            const dy = skeleton.tileY - playerTileY;
            const distance = Math.max(Math.abs(dx), Math.abs(dy));
            
            // Check if skeleton is in the direction of the streak
            const inDirection = (dirX === 0 || Math.sign(dx) === Math.sign(dirX)) && 
                               (dirY === 0 || Math.sign(dy) === Math.sign(dirY));
            
            if (distance <= streakRange && inDirection) {
              // Deal damage (30 damage)
              skeleton.health = Math.max(0, skeleton.health - 30);
              
              // Show damage popup
              const { x: enemyX, y: enemyY } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
              const damageText = this.add.text(enemyX, enemyY - 60, '-30', {
                font: 'bold 20px Arial',
                fill: '#ff6600',
                stroke: '#000000',
                strokeThickness: 3,
              }).setOrigin(0.5, 0.5).setDepth(100);
              
              // Animate damage text
              this.tweens.add({
                targets: damageText,
                y: enemyY - 90,
                alpha: 0,
                duration: 1200,
                ease: 'Power2',
                onComplete: () => damageText.destroy()
              });
              
              // Check if skeleton dies
              if (skeleton.health <= 0) {
                this.handleEnemyDeath(skeleton, 'skeleton');
              }
            }
          }
        });
        
        // Damage slimes in streak direction
        this.slimes.forEach(slime => {
          if (slime.alive) {
            const dx = slime.tileX - playerTileX;
            const dy = slime.tileY - playerTileY;
            const distance = Math.max(Math.abs(dx), Math.abs(dy));
            
            // Check if slime is in the direction of the streak
            const inDirection = (dirX === 0 || Math.sign(dx) === Math.sign(dirX)) && 
                               (dirY === 0 || Math.sign(dy) === Math.sign(dirY));
            
            if (distance <= streakRange && inDirection) {
              // Deal damage (30 damage)
              slime.health = Math.max(0, slime.health - 30);
              
              // Show damage popup
              const { x: enemyX, y: enemyY } = this.getIsoPos(slime.tileX, slime.tileY);
              const damageText = this.add.text(enemyX, enemyY - 60, '-30', {
                font: 'bold 20px Arial',
                fill: '#ff6600',
                stroke: '#000000',
                strokeThickness: 3,
              }).setOrigin(0.5, 0.5).setDepth(100);
              
              // Animate damage text
              this.tweens.add({
                targets: damageText,
                y: enemyY - 90,
                alpha: 0,
                duration: 1200,
                ease: 'Power2',
                onComplete: () => damageText.destroy()
              });
              
              // Check if slime dies
              if (slime.health <= 0) {
                this.handleEnemyDeath(slime, 'slime');
              }
            }
          }
        });
        
        // Remove fire streak sprite after animation completes
        fireStreakSprite.once('animationcomplete', () => {
          fireStreakSprite.destroy();
          // Don't reset magicActive since Fire Streak is independent
        });
        
        console.log('Fire Streak activated!');
      }
      
      deactivateFireStreak() {
        this.fireStreakActive = false;
        // Fire Streak is independent, no magicActive to reset
        
        console.log('Fire Streak deactivated!');
      }
      
      activateDash(time) {
        this.dashTimer = time;
        this.dashActive = true;
        this.dashPhase = 'burst';
        
        // Get player position
        const { x, y } = this.getKnightIsoPos();
        
        // Add screen shake effect for burst
        this.cameras.main.shake(200, 0.01);
        
        // Add burst particles around the player
        for (let i = 0; i < 16; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0xff8800, 0.9);
          particle.fillCircle(0, 0, 4);
          particle.setDepth(5);
          
          const angle = (i / 16) * Math.PI * 2;
          const distance = 50;
          particle.x = x + Math.cos(angle) * distance;
          particle.y = y + Math.sin(angle) * distance;
          
          // Create expanding animation for particles
          this.tweens.add({
            targets: particle,
            x: particle.x + Math.cos(angle) * 60,
            y: particle.y + Math.sin(angle) * 60,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          });
        }
        
        // Add dash trail effect
        const dashTrail = this.add.graphics();
        dashTrail.lineStyle(3, 0xff8800, 0.6);
        dashTrail.lineBetween(x - 20, y, x + 20, y);
        dashTrail.setDepth(4);
        
        this.tweens.add({
          targets: dashTrail,
          alpha: 0,
          scaleX: 2,
          scaleY: 0.5,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => dashTrail.destroy()
        });
        
        console.log('Dash activated - Burst phase!');
      }
      
      deactivateDash(time) {
        this.dashActive = false;
        this.dashPhase = 'none';
        this.dashCooldownTimer = time;
        
        // Add deactivation effect
        const { x, y } = this.getKnightIsoPos();
        const deactivationEffect = this.add.graphics();
        deactivationEffect.lineStyle(2, 0xff8800, 0.8);
        deactivationEffect.strokeCircle(x, y, 40);
        deactivationEffect.setDepth(5);
        
        this.tweens.add({
          targets: deactivationEffect,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 500,
          ease: 'Power2',
          onComplete: () => deactivationEffect.destroy()
        });
        
        console.log('Dash deactivated!');
      }
      
      openStore() {
        // Close any existing quantity menu
        this.closeQuantityMenu();
        
        this.storeOpen = true;
        
        // Create store background
        const storeBg = this.add.graphics();
        storeBg.fillStyle(0x000000, 0.8);
        storeBg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        storeBg.setScrollFactor(0);
        storeBg.setDepth(50);
        
        // Store title
        const title = this.add.text(GAME_WIDTH / 2, 100, 'STORE', {
          font: 'bold 48px Arial',
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 8,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
        
        // Gold display
        const goldDisplay = this.add.text(GAME_WIDTH / 2, 150, `Gold: ${this.goldCount}`, {
          font: 'bold 32px Arial',
          fill: '#ffd700',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
        
        // Store items
        const storeItems = [];
        STORE_ITEMS.forEach((item, index) => {
          const yPos = 250 + (index * 60);
          const canAfford = this.goldCount >= item.price;
          const color = canAfford ? '#fff' : '#666';
          
          const itemText = this.add.text(GAME_WIDTH / 2, yPos, `${item.name} - ${item.price} Gold`, {
            font: '20px Arial',
            fill: color,
            backgroundColor: '#333',
            padding: { x: 20, y: 10 },
          }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
          
          const descText = this.add.text(GAME_WIDTH / 2, yPos + 25, item.description, {
            font: '16px Arial',
            fill: '#ccc',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
          
          // Make all items interactive for mouse clicking
          itemText.setInteractive({ useHandCursor: true });
          itemText.on('pointerdown', () => {
            console.log('Item clicked:', item.name);
            // Close any existing quantity menu before showing new one
            this.closeQuantityMenu();
            this.showQuantityMenu(item);
          });
          
          storeItems.push(itemText, descText);
        });
        
        // No controls info text - users know to use SHIFT to close
        
        // Store UI elements
        this.storeUI = {
          background: storeBg,
          title,
          goldDisplay,
          storeItems
        };
        
        // Note: Store closing is handled in the update loop with the global SHIFT listener
      }
      
      closeStore() {
        console.log('=== CLOSING STORE ===');
        
        // Force close quantity menu directly
        if (this.quantityMenu) {
          console.log('Force closing quantity menu from closeStore...');
          
          // Destroy each element directly
          if (this.quantityMenu.background) {
            this.quantityMenu.background.setVisible(false);
            this.quantityMenu.background.setActive(false);
            this.quantityMenu.background.destroy();
          }
          if (this.quantityMenu.title) {
            this.quantityMenu.title.setVisible(false);
            this.quantityMenu.title.setActive(false);
            this.quantityMenu.title.destroy();
          }
          if (this.quantityMenu.priceInfo) {
            this.quantityMenu.priceInfo.setVisible(false);
            this.quantityMenu.priceInfo.setActive(false);
            this.quantityMenu.priceInfo.destroy();
          }
          if (this.quantityMenu.buttons) {
            this.quantityMenu.buttons.forEach(button => {
              if (button && button.destroy) {
                button.setVisible(false);
                button.setActive(false);
                button.destroy();
              }
            });
          }
          if (this.quantityMenu.cancelBtn) {
            this.quantityMenu.cancelBtn.setVisible(false);
            this.quantityMenu.cancelBtn.setActive(false);
            this.quantityMenu.cancelBtn.destroy();
          }
          
          this.quantityMenu = null;
          console.log('Quantity menu force closed from closeStore');
        }
        
        this.storeOpen = false;
        
        // Force close store UI directly
        if (this.storeUI) {
          console.log('Force closing store UI...');
          
          // Destroy each store element individually
          if (this.storeUI.background) {
            console.log('Destroying store background');
            this.storeUI.background.setVisible(false);
            this.storeUI.background.setActive(false);
            this.storeUI.background.destroy();
          }
          if (this.storeUI.title) {
            console.log('Destroying store title');
            this.storeUI.title.setVisible(false);
            this.storeUI.title.setActive(false);
            this.storeUI.title.destroy();
          }
          if (this.storeUI.goldDisplay) {
            console.log('Destroying store gold display');
            this.storeUI.goldDisplay.setVisible(false);
            this.storeUI.goldDisplay.setActive(false);
            this.storeUI.goldDisplay.destroy();
          }
          if (this.storeUI.storeItems) {
            console.log('Destroying store items');
            this.storeUI.storeItems.forEach(item => {
              if (item && item.destroy) {
                item.setVisible(false);
                item.setActive(false);
                item.destroy();
              }
            });
          }
          
          this.storeUI = null;
          console.log('Store UI force closed');
        }
      }
      
      updateTemporaryBuffs(time) {
        // Check speed buff
        if (this.temporaryBuffs.speed.active && time > this.temporaryBuffs.speed.endTime) {
          this.temporaryBuffs.speed.active = false;
          this.temporaryBuffs.speed.multiplier = 1.0;
          // Remove speed buff visual effect if any
          if (this.speedBuffEffect) {
            this.speedBuffEffect.destroy();
            this.speedBuffEffect = null;
          }
        }
        
        // Check damage buff
        if (this.temporaryBuffs.damage.active && time > this.temporaryBuffs.damage.endTime) {
          this.temporaryBuffs.damage.active = false;
          this.temporaryBuffs.damage.multiplier = 1.0;
          // Remove damage buff visual effect if any
          if (this.damageBuffEffect) {
            this.damageBuffEffect.destroy();
            this.damageBuffEffect = null;
          }
        }
        
        // Check shield buff
        if (this.temporaryBuffs.shield.active && time > this.temporaryBuffs.shield.endTime) {
          this.temporaryBuffs.shield.active = false;
          // Remove shield visual effect
          if (this.shieldEffect) {
            this.shieldEffect.destroy();
            this.shieldEffect = null;
          }
        }
      }
      createInventoryUI() {
        // Inventory background
        const inventoryBg = this.add.graphics();
        inventoryBg.fillStyle(0x000000, 0.7);
        inventoryBg.fillRect(GAME_WIDTH - 200, 20, 180, 120);
        inventoryBg.setScrollFactor(0).setDepth(15);
        
        // Inventory title
        const inventoryTitle = this.add.text(GAME_WIDTH - 110, 30, 'ACTIVE BUFFS', {
          font: 'bold 16px Arial',
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(16);
        
        // Buff display texts
        const speedBuffText = this.add.text(GAME_WIDTH - 190, 55, '', {
          font: '14px Arial',
          fill: '#00ff00',
        }).setScrollFactor(0).setDepth(16);
        
        const damageBuffText = this.add.text(GAME_WIDTH - 190, 75, '', {
          font: '14px Arial',
          fill: '#ff0000',
        }).setScrollFactor(0).setDepth(16);
        
        const shieldBuffText = this.add.text(GAME_WIDTH - 190, 95, '', {
          font: '14px Arial',
          fill: '#0088ff',
        }).setScrollFactor(0).setDepth(16);
        
        this.inventoryUI = {
          background: inventoryBg,
          title: inventoryTitle,
          speedBuff: speedBuffText,
          damageBuff: damageBuffText,
          shieldBuff: shieldBuffText
        };
      }
      
      updateBuffVisualEffects(x, y) {
        if (this.speedBuffEffect) {
          this.speedBuffEffect.clear();
          this.speedBuffEffect.lineStyle(4, 0x00ff00, 0.7);
          this.speedBuffEffect.strokeCircle(x, y, 40);
        }
        if (this.damageBuffEffect) {
          this.damageBuffEffect.clear();
          this.damageBuffEffect.lineStyle(4, 0xff0000, 0.7);
          this.damageBuffEffect.strokeCircle(x, y, 45);
        }
        if (this.shieldEffect) {
          this.shieldEffect.clear();
          this.shieldEffect.lineStyle(6, 0x0088ff, 0.8);
          this.shieldEffect.strokeCircle(x, y, 50);
        }
      }
      
      updateInventoryUI(time) {
        if (!this.inventoryUI) return;
        
        // Update speed buff display
        if (this.temporaryBuffs.speed.active) {
          const remaining = Math.ceil((this.temporaryBuffs.speed.endTime - time) / 1000);
          this.inventoryUI.speedBuff.setText(`Speed: ${remaining}s`);
        } else {
          this.inventoryUI.speedBuff.setText('');
        }
        
        // Update damage buff display
        if (this.temporaryBuffs.damage.active) {
          const remaining = Math.ceil((this.temporaryBuffs.damage.endTime - time) / 1000);
          this.inventoryUI.damageBuff.setText(`Damage: ${remaining}s`);
        } else {
          this.inventoryUI.damageBuff.setText('');
        }
        
        // Update shield buff display
        if (this.temporaryBuffs.shield.active) {
          const remaining = Math.ceil((this.temporaryBuffs.shield.endTime - time) / 1000);
          this.inventoryUI.shieldBuff.setText(`Shield: ${remaining}s`);
        } else {
          this.inventoryUI.shieldBuff.setText('');
        }
      }
      
      toggleInventory() {
        if (!this.inventoryUI) return;
        
        const isVisible = this.inventoryUI.background.visible;
        this.inventoryUI.background.setVisible(!isVisible);
        this.inventoryUI.title.setVisible(!isVisible);
        this.inventoryUI.speedBuff.setVisible(!isVisible);
        this.inventoryUI.damageBuff.setVisible(!isVisible);
        this.inventoryUI.shieldBuff.setVisible(!isVisible);
      }
      
      showQuantityMenu(item) {
        console.log('=== SHOWING QUANTITY MENU ===');
        console.log('Item:', item.name, 'Price:', item.price);
        console.log('Current gold:', this.goldCount);
        
        // Close any existing quantity menu
        this.closeQuantityMenu();
        
        // Calculate max quantity based on gold
        const maxQuantity = Math.floor(this.goldCount / item.price);
        console.log('Max quantity calculation:', this.goldCount, '/', item.price, '=', maxQuantity);
        if (maxQuantity <= 0) {
          // Show message that they can't afford even 1
          const noGoldText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Not enough gold!', {
            font: 'bold 24px Arial',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 4,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
          
          this.time.delayedCall(1500, () => {
            noGoldText.destroy();
          });
          return;
        }
        
        // Create quantity menu background on the right side
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0x000000, 0.9);
        menuBg.fillRect(GAME_WIDTH - 350, 200, 300, 400);
        menuBg.setScrollFactor(0).setDepth(55);
        
        // Menu title
        const title = this.add.text(GAME_WIDTH - 200, 220, `Buy ${item.name}`, {
          font: 'bold 24px Arial',
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(56);
        
        // Price info
        const priceInfo = this.add.text(GAME_WIDTH - 200, 250, `${item.price} Gold each`, {
          font: '18px Arial',
          fill: '#ffd700',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(56);
        
        // Quantity buttons
        const quantities = [1, 5, 10, 25, 50, 100];
        const buttons = [];
        
        quantities.forEach((qty, index) => {
          console.log('Checking quantity:', qty, 'Max:', maxQuantity, 'Can afford:', qty <= maxQuantity);
          if (qty <= maxQuantity) {
            const x = GAME_WIDTH - 320 + (index % 3) * 80;
            const y = 290 + Math.floor(index / 3) * 50;
            
            const button = this.add.text(x, y, qty.toString(), {
              font: 'bold 20px Arial',
              fill: '#fff',
              backgroundColor: '#333',
              padding: { x: 15, y: 10 },
            }).setOrigin(0.5).setScrollFactor(0).setDepth(56);
            
            button.setInteractive({ useHandCursor: true });
            button.on('pointerdown', () => {
              console.log('Quantity button clicked:', qty);
              this.purchaseItemQuantity(item, qty);
            });
            
            buttons.push(button);
          }
        });
        
        // Cancel button
        const cancelBtn = this.add.text(GAME_WIDTH - 200, 520, 'Cancel', {
          font: 'bold 18px Arial',
          fill: '#fff',
          backgroundColor: '#666',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(56);
        
        cancelBtn.setInteractive({ useHandCursor: true });
        cancelBtn.on('pointerdown', () => {
          this.closeQuantityMenu();
        });
        
        this.quantityMenu = {
          background: menuBg,
          title,
          priceInfo,
          buttons,
          cancelBtn
        };
      }
      
      closeQuantityMenu() {
        console.log('=== CLOSING QUANTITY MENU ===');
        if (this.quantityMenu) {
          console.log('Quantity menu exists, destroying elements...');
          
          // Use Phaser's scene methods to properly remove elements
          if (this.quantityMenu.background) {
            console.log('Destroying background');
            this.quantityMenu.background.setVisible(false);
            this.quantityMenu.background.setActive(false);
            this.quantityMenu.background.destroy();
            this.quantityMenu.background = null;
          }
          if (this.quantityMenu.title) {
            console.log('Destroying title');
            this.quantityMenu.title.setVisible(false);
            this.quantityMenu.title.setActive(false);
            this.quantityMenu.title.destroy();
            this.quantityMenu.title = null;
          }
          if (this.quantityMenu.priceInfo) {
            console.log('Destroying price info');
            this.quantityMenu.priceInfo.setVisible(false);
            this.quantityMenu.priceInfo.setActive(false);
            this.quantityMenu.priceInfo.destroy();
            this.quantityMenu.priceInfo = null;
          }
          if (this.quantityMenu.buttons) {
            console.log('Destroying buttons');
            this.quantityMenu.buttons.forEach(button => {
              if (button && button.destroy) {
                button.setVisible(false);
                button.setActive(false);
                button.destroy();
              }
            });
            this.quantityMenu.buttons = [];
          }
          if (this.quantityMenu.cancelBtn) {
            console.log('Destroying cancel button');
            this.quantityMenu.cancelBtn.setVisible(false);
            this.quantityMenu.cancelBtn.setActive(false);
            this.quantityMenu.cancelBtn.destroy();
            this.quantityMenu.cancelBtn = null;
          }
          
          this.quantityMenu = null;
          console.log('Quantity menu set to null');
        } else {
          console.log('No quantity menu to close');
        }
        console.log('=== QUANTITY MENU CLOSED ===');
      }
      
      updateStoreItemAvailability() {
        if (!this.storeUI || !this.storeUI.storeItems) return;
        
        // Update each item's availability based on current gold
        STORE_ITEMS.forEach((item, index) => {
          const itemIndex = index * 2; // Each item has 2 elements (itemText, descText)
          const itemText = this.storeUI.storeItems[itemIndex];
          const descText = this.storeUI.storeItems[itemIndex + 1];
          
          if (itemText && descText) {
            const canAfford = this.goldCount >= item.price;
            const color = canAfford ? '#fff' : '#666';
            
            itemText.setColor(color);
            
            // Update interactivity - keep all items interactive but change color
            itemText.setInteractive({ useHandCursor: true });
            itemText.off('pointerdown');
            itemText.on('pointerdown', () => {
              // Close any existing quantity menu before showing new one
              this.closeQuantityMenu();
              this.showQuantityMenu(item);
            });
          }
        });
      }
      
      purchaseItemQuantity(item, quantity) {
        const totalCost = item.price * quantity;
        console.log('=== PURCHASE ATTEMPT ===');
        console.log('Item:', item.name);
        console.log('Quantity:', quantity);
        console.log('Price per item:', item.price, 'gold');
        console.log('Total cost:', totalCost, 'gold');
        console.log('Current gold:', this.goldCount, 'gold');
        console.log('Can afford:', this.goldCount >= totalCost);
        console.log('=======================');
        
        if (this.goldCount >= totalCost) {
          console.log('✅ PURCHASE SUCCESSFUL!');
          console.log('Gold before:', this.goldCount, 'gold');
          this.goldCount -= totalCost;
          console.log('Gold after:', this.goldCount, 'gold');
          console.log('Gold spent:', totalCost, 'gold');
          
          // Apply the item effect multiple times
          for (let i = 0; i < quantity; i++) {
            this.applyItemEffect(item);
          }
          
          // Update gold display
          if (this.goldText) this.goldText.setText(`Gold: ${this.goldCount}`);
          
          // Show purchase confirmation
          const purchaseText = this.add.text(GAME_WIDTH / 2, 200, `Purchased: ${quantity}x ${item.name}!`, {
            font: 'bold 24px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 4,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(52);
          
          this.time.delayedCall(1500, () => {
            purchaseText.destroy();
          });
          
          // Close quantity menu
          this.closeQuantityMenu();
          
          // Update store gold display
          if (this.storeUI && this.storeUI.goldDisplay) {
            this.storeUI.goldDisplay.setText(`Gold: ${this.goldCount}`);
          }
          
          // Update item availability
          this.updateStoreItemAvailability();
        } else {
          console.log('❌ PURCHASE FAILED - Not enough gold!');
          console.log('Required:', totalCost, 'gold');
          console.log('Available:', this.goldCount, 'gold');
          console.log('Shortage:', totalCost - this.goldCount, 'gold');
        }
      }
      
      applyItemEffect(item) {
        // Handle both item.id (for store items) and item (for direct item strings like gems)
        const itemId = item.id || item;
        
        switch (itemId) {
          case 'healthPotion':
            // Restore 25 health
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 25);
            this.updateHealthBar();
            break;
            
          case 'speedPotion':
            // Speed buff for 15 seconds
            this.temporaryBuffs.speed.active = true;
            this.temporaryBuffs.speed.multiplier = 1.5; // 50% speed increase
            this.temporaryBuffs.speed.endTime = this.time.now + 15000; // 15 seconds
            
            // Add visual effect
            this.speedBuffEffect = this.add.graphics();
            this.speedBuffEffect.lineStyle(4, 0x00ff00, 0.7);
            this.speedBuffEffect.strokeCircle(this.knight.x, this.knight.y, 40);
            this.speedBuffEffect.setDepth(4);
            break;
            
          case 'damagePotion':
            // Damage buff for 20 seconds
            this.temporaryBuffs.damage.active = true;
            this.temporaryBuffs.damage.multiplier = 1.5; // 50% damage increase
            this.temporaryBuffs.damage.endTime = this.time.now + 20000; // 20 seconds
            
            // Add visual effect
            this.damageBuffEffect = this.add.graphics();
            this.damageBuffEffect.lineStyle(4, 0xff0000, 0.7);
            this.damageBuffEffect.strokeCircle(this.knight.x, this.knight.y, 45);
            this.damageBuffEffect.setDepth(4);
            break;
            
          case 'shieldPotion':
            // Shield buff for 5 seconds
            this.temporaryBuffs.shield.active = true;
            this.temporaryBuffs.shield.endTime = this.time.now + 5000; // 5 seconds
            
            // Add visual effect
            this.shieldEffect = this.add.graphics();
            this.shieldEffect.lineStyle(6, 0x0088ff, 0.8);
            this.shieldEffect.strokeCircle(this.knight.x, this.knight.y, 50);
            this.shieldEffect.setDepth(4);
            break;
            
          case 'damageUpgrade':
            // Permanent damage upgrade
            this.upgrades.damage++;
            break;
            
          case 'healthUpgrade':
            // Permanent health upgrade
            this.upgrades.health++;
            this.playerMaxHealth = this.characterStats.health + (this.upgrades.health * 25);
            this.playerHealth = this.playerMaxHealth; // Restore to full health
            this.updateHealthBar();
            break;
            
          case 'cooldownUpgrade':
            // Permanent ability cooldown reduction
            this.upgrades.abilityCooldown++;
            break;
            
          // Gem effects
          case 'blueGem':
            // Blue gem: Restore health
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 50);
            this.updateHealthBar();
            break;
            
          case 'greenGem':
            // Green gem: Speed boost
            this.temporaryBuffs.speed.active = true;
            this.temporaryBuffs.speed.multiplier = 2.0; // 100% speed increase
            this.temporaryBuffs.speed.endTime = this.time.now + 10000; // 10 seconds
            
            // Add visual effect
            this.speedBuffEffect = this.add.graphics();
            this.speedBuffEffect.lineStyle(4, 0x00ff00, 0.7);
            this.speedBuffEffect.strokeCircle(this.knight.x, this.knight.y, 40);
            this.speedBuffEffect.setDepth(4);
            break;
            
          case 'redGem':
            // Red gem: Damage boost
            this.temporaryBuffs.damage.active = true;
            this.temporaryBuffs.damage.multiplier = 2.0; // 100% damage increase
            this.temporaryBuffs.damage.endTime = this.time.now + 15000; // 15 seconds
            
            // Add visual effect
            this.damageBuffEffect = this.add.graphics();
            this.damageBuffEffect.lineStyle(4, 0xff0000, 0.7);
            this.damageBuffEffect.strokeCircle(this.knight.x, this.knight.y, 45);
            this.damageBuffEffect.setDepth(4);
            break;
        }
      }
      
      // Save game function
      saveGame(saveName = null) {
        // Check save limit
        const saves = this.getAllSaveGames();
        if (saves.length >= 3 && !this.saveName) {
          // Show save limit message
          const cam = this.cameras.main;
          const centerX = cam.worldView.centerX;
          const centerY = cam.worldView.centerY;
          
          const limitBg = this.add.graphics();
          limitBg.fillStyle(0x000000, 0.9);
          limitBg.fillRoundedRect(centerX - 200, centerY - 50, 400, 100, 10);
          limitBg.setScrollFactor(0).setDepth(99);
          
          const limitText = this.add.text(centerX, centerY, 'Maximum 3 saves allowed!\nDelete a save to create a new one.', {
            font: 'bold 20px Arial',
            fill: '#ff4444',
            align: 'center',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          this.time.delayedCall(3000, () => {
            limitBg.destroy();
            limitText.destroy();
          });
          return false;
        }
        
        // If no save name provided, show save name popup
        if (!saveName) {
          this.showSaveNamePopup();
          return false;
        }
        
        // Update the save key for this specific save
        const currentSaveKey = this.getSaveKey(saveName);
        const saveData = {
          timestamp: Date.now(),
          player: {
            health: this.playerHealth,
            maxHealth: this.playerMaxHealth,
            gold: this.goldCount,
            blueGems: this.blueGemCount,
            greenGems: this.greenGemCount,
            redGems: this.redGemCount,
            position: {
              tileX: this.knightTileX,
              tileY: this.knightTileY
            },
            character: this.selectedCharacter,
            upgrades: this.upgrades,
            inventory: this.inventory || {}
          },
          gameState: {
            currentLevel: this.currentLevel,
            bossAlive: this.bossAlive,
            bossHealth: this.bossHealth,
            bossIncomingShown: this.bossIncomingShown,
            victoryShown: this.victoryShown,
            spawnData: {
              skeletonSpawnData: this.skeletonSpawnData,
              slimeSpawnData: this.slimeSpawnData
            }
          },
          enemies: {
            skeletons: this.skeletons.filter(s => s.alive).map(s => ({
              tileX: s.tileX,
              tileY: s.tileY,
              dir: s.dir
            })),
            slimes: this.slimes.filter(s => s.alive).map(s => ({
              tileX: s.tileX,
              tileY: s.tileY,
              dir: s.dir
            }))
          },
          drops: {
            goldDrops: this.goldDrops.map(drop => ({
              tileX: drop.tileX,
              tileY: drop.tileY,
              amount: drop.amount,
              item: drop.item
            })),
            crates: this.crates.map(crate => ({
              tileX: crate.tileX,
              tileY: crate.tileY
            }))
          }
        };
        
        try {
          localStorage.setItem(currentSaveKey, JSON.stringify(saveData));
          console.log('Game saved successfully:', saveData);
          
          // Update current save name
          this.saveName = saveName;
          
          // Show save notification
          const cam = this.cameras.main;
          const centerX = cam.worldView.centerX;
          const centerY = cam.worldView.centerY - 150;
          
          // Create background for better visibility
          const saveBg = this.add.graphics();
          saveBg.fillStyle(0x000000, 0.8);
          saveBg.fillRoundedRect(centerX - 120, centerY - 30, 240, 60, 10);
          saveBg.setScrollFactor(0).setDepth(99);
          
          // Create border
          const saveBorder = this.add.graphics();
          saveBorder.lineStyle(3, 0x00ff00, 1);
          saveBorder.strokeRoundedRect(centerX - 120, centerY - 30, 240, 60, 10);
          saveBorder.setScrollFactor(0).setDepth(99);
          
          // Main save text
          const saveText = this.add.text(centerX, centerY, 'GAME SAVED!', {
            font: 'bold 28px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 4,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          // Add save icon (floppy disk symbol)
          const saveIcon = this.add.text(centerX - 80, centerY, '💾', {
            font: '24px Arial',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          // Add timestamp
          const now = new Date();
          const timeString = now.toLocaleTimeString();
          const timeText = this.add.text(centerX, centerY + 20, timeString, {
            font: '14px Arial',
            fill: '#cccccc',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          // Animate the announcement
          saveText.setScale(0.5);
          saveIcon.setScale(0.5);
          timeText.setScale(0.5);
          
          this.tweens.add({
            targets: [saveText, saveIcon, timeText],
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Fade out after 2 seconds
              this.time.delayedCall(2000, () => {
                this.tweens.add({
                  targets: [saveText, saveIcon, timeText, saveBg, saveBorder],
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    saveText.destroy();
                    saveIcon.destroy();
                    timeText.destroy();
                    saveBg.destroy();
                    saveBorder.destroy();
                  }
                });
              });
            }
          });
          
          return true;
        } catch (error) {
          console.error('Failed to save game:', error);
          return false;
        }
      }
      
      // Load game function
      loadGame(saveName = null) {
        try {
          // If no save name provided, use current save name or try to find any save
          if (!saveName) {
            saveName = this.saveName;
            if (!saveName) {
              const saves = this.getAllSaveGames();
              if (saves.length > 0) {
                saveName = saves[0].name; // Use the most recent save
              }
            }
          }
          
          if (!saveName) {
            console.log('No save name provided and no saves found');
            return false;
          }
          
          const currentSaveKey = this.getSaveKey(saveName);
          const saveData = localStorage.getItem(currentSaveKey);
          if (!saveData) {
            console.log('No save data found for:', saveName);
            return false;
          }
          
          const data = JSON.parse(saveData);
          console.log('Loading save data:', data);
          
          // Load player data
          if (data.player) {
            this.playerHealth = data.player.health || this.playerHealth;
            this.playerMaxHealth = data.player.maxHealth || this.playerMaxHealth;
            this.goldCount = data.player.gold || this.goldCount;
            this.blueGemCount = data.player.blueGems || this.blueGemCount;
            this.greenGemCount = data.player.greenGems || this.greenGemCount;
            this.redGemCount = data.player.redGems || this.redGemCount;
            this.knightTileX = data.player.position?.tileX || this.knightTileX;
            this.knightTileY = data.player.position?.tileY || this.knightTileY;
            this.selectedCharacter = data.player.character || this.selectedCharacter;
            this.upgrades = data.player.upgrades || this.upgrades;
            this.inventory = data.player.inventory || {};
          }
          
          // Load game state
          if (data.gameState) {
            this.currentLevel = data.gameState.currentLevel || 1;
            this.bossAlive = data.gameState.bossAlive || false;
            this.bossHealth = data.gameState.bossHealth || 200;
            this.bossIncomingShown = data.gameState.bossIncomingShown || false;
            this.victoryShown = data.gameState.victoryShown || false;
            this.skeletonSpawnData = data.gameState.spawnData?.skeletonSpawnData || this.skeletonSpawnData;
            this.slimeSpawnData = data.gameState.spawnData?.slimeSpawnData || this.slimeSpawnData;
          }
          
          // Update UI
          this.updateHealthBar();
          if (this.goldText) this.goldText.setText(`Gold: ${this.goldCount}`);
          this.updateLevelDisplay();
          
          // Show load notification
          const cam = this.cameras.main;
          const centerX = cam.worldView.centerX;
          const centerY = cam.worldView.centerY - 150;
          
          // Create background for better visibility
          const loadBg = this.add.graphics();
          loadBg.fillStyle(0x000000, 0.8);
          loadBg.fillRoundedRect(centerX - 120, centerY - 30, 240, 60, 10);
          loadBg.setScrollFactor(0).setDepth(99);
          
          // Create border
          const loadBorder = this.add.graphics();
          loadBorder.lineStyle(3, 0x00aaff, 1);
          loadBorder.strokeRoundedRect(centerX - 120, centerY - 30, 240, 60, 10);
          loadBorder.setScrollFactor(0).setDepth(99);
          
          // Main load text
          const loadText = this.add.text(centerX, centerY, 'GAME LOADED!', {
            font: 'bold 28px Arial',
            fill: '#00aaff',
            stroke: '#000',
            strokeThickness: 4,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          // Add load icon (folder symbol)
          const loadIcon = this.add.text(centerX - 80, centerY, '📁', {
            font: '24px Arial',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          // Add timestamp
          const now = new Date();
          const timeString = now.toLocaleTimeString();
          const timeText = this.add.text(centerX, centerY + 20, timeString, {
            font: '14px Arial',
            fill: '#cccccc',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
          
          // Animate the announcement
          loadText.setScale(0.5);
          loadIcon.setScale(0.5);
          timeText.setScale(0.5);
          
          this.tweens.add({
            targets: [loadText, loadIcon, timeText],
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Fade out after 2 seconds
              this.time.delayedCall(2000, () => {
                this.tweens.add({
                  targets: [loadText, loadIcon, timeText, loadBg, loadBorder],
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    loadText.destroy();
                    loadIcon.destroy();
                    timeText.destroy();
                    loadBg.destroy();
                    loadBorder.destroy();
                  }
                });
              });
            }
          });
          
          return true;
        } catch (error) {
          console.error('Failed to load game:', error);
          return false;
        }
      }
      
      // Auto-save functions removed as requested
      
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
      
      // Check if save exists
      hasSaveGame() {
        try {
          const saves = this.getAllSaveGames();
          return saves.length > 0;
        } catch (error) {
          console.error('Error checking save games:', error);
          return false;
        }
      }
      
      // Get save key for a specific save name
      getSaveKey(saveName) {
        return `isometricGameSave_${saveName}`;
      }
      // Count enemies on a specific tile
      countEnemiesOnTile(tileX, tileY) {
        // Cache key for this tile
        const cacheKey = `${tileX},${tileY}`;
        
        // Return cached result if available and recent
        if (this._tileCountCache && this._tileCountCache[cacheKey] && 
            this._tileCountCache[cacheKey].time > this.time.now - 100) {
          return this._tileCountCache[cacheKey].count;
        }
        
        let count = 0;
        
        // Count skeletons on this tile
        for (const skeleton of this.skeletons) {
          if (skeleton.alive && skeleton.tileX === tileX && skeleton.tileY === tileY) {
            count++;
          }
        }
        
        // Count slimes on this tile
        for (const slime of this.slimes) {
          if (slime.alive && slime.tileX === tileX && slime.tileY === tileY) {
            count++;
          }
        }
        
        // Cache the result
        if (!this._tileCountCache) this._tileCountCache = {};
        this._tileCountCache[cacheKey] = { count, time: this.time.now };
        
        return count;
      }
      
      // Deactivate spawn point and remove visual indicators
      deactivateSpawnPoint(type, index) {
        if (type === 'skeleton') {
          if (this.skeletonSpawnData[index]) {
            this.skeletonSpawnData[index].active = false;
          }
          if (this.skeletonSpawnIndicators[index]) {
            this.skeletonSpawnIndicators[index].circle.destroy();
            this.skeletonSpawnIndicators[index].label.destroy();
            this.skeletonSpawnIndicators[index] = null;
          }
        } else if (type === 'slime') {
          if (this.slimeSpawnData[index]) {
            this.slimeSpawnData[index].active = false;
          }
          if (this.slimeSpawnIndicators[index]) {
            this.slimeSpawnIndicators[index].circle.destroy();
            this.slimeSpawnIndicators[index].label.destroy();
            this.slimeSpawnIndicators[index] = null;
          }
        }
      }
      
      // Check if all enemies from spawn points are dead and deactivate completed spawn points
      checkSpawnPointCompletion() {
        // Check skeleton spawn points
        for (let i = 0; i < this.skeletonSpawnData.length; i++) {
          const spd = this.skeletonSpawnData[i];
          if (spd.active) {
            // Count alive enemies from this spawn point
            let aliveFromSpawn = 0;
            for (const skeleton of this.skeletons) {
              if (skeleton.alive && skeleton.spawnPointIndex === i) {
                aliveFromSpawn++;
              }
            }
            
            // If no enemies alive from this spawn point and we've spawned the max, deactivate
            if (aliveFromSpawn === 0 && spd.count >= spd.max) {
              this.deactivateSpawnPoint('skeleton', i);
              console.log(`Skeleton spawn point ${i + 1} deactivated - all enemies killed`);
            }
          }
        }
        
        // Check slime spawn points
        for (let i = 0; i < this.slimeSpawnData.length; i++) {
          const spd = this.slimeSpawnData[i];
          if (spd.active) {
            // Count alive enemies from this spawn point
            let aliveFromSpawn = 0;
            for (const slime of this.slimes) {
              if (slime.alive && slime.spawnPointIndex === i) {
                aliveFromSpawn++;
              }
            }
            
            // If no enemies alive from this spawn point and we've spawned the max, deactivate
            if (aliveFromSpawn === 0 && spd.count >= spd.max) {
              this.deactivateSpawnPoint('slime', i);
              console.log(`Slime spawn point ${i + 1} deactivated - all enemies killed`);
            }
          }
        }
        
        // Check if level is complete
        this.checkLevelCompletion();
      }
      
      checkLevelCompletion() {
        // Check if all spawn points are deactivated
        const allSkeletonSpawnsInactive = this.skeletonSpawnData.every(spd => !spd.active);
        const allSlimeSpawnsInactive = this.slimeSpawnData.every(spd => !spd.active);
        
        // Check if all enemies are dead
        const allSkeletonsDead = this.skeletons.every(skeleton => !skeleton.alive);
        const allSlimesDead = this.slimes.every(slime => !slime.alive);
        
        // Check if boss should spawn
        if (allSkeletonSpawnsInactive && allSlimeSpawnsInactive && allSkeletonsDead && allSlimesDead && !this.bossSpawnData.spawned && !this.bossAlive) {
          this.spawnBoss();
        }
        
        // Check if boss is dead and level is complete
        if (this.bossSpawnData.spawned && !this.bossAlive && !this.levelCompleted) {
          this.levelCompleted = true;
          this.advanceToNextLevel();
        }
      }
      
      spawnBoss() {
        if (this.bossSpawnData.spawned) return;
        
        this.bossSpawnData.spawned = true;
        this.bossSpawnData.active = true;
        this.bossHealth = this.bossSpawnData.health;
        
        // Spawn boss at center position
        const { x, y } = this.getIsoPos(this.bossSpawnData.position.x, this.bossSpawnData.position.y);
        this.bossTileX = this.bossSpawnData.position.x;
        this.bossTileY = this.bossSpawnData.position.y;
        
        this.bossSprite = this.add.sprite(x, y, 'demonlord_idle_S_0');
        this.bossSprite.setDepth(5);
        this.bossAlive = true;
        this.bossDir = 'S';
        
        // Create boss animations
        BOSS_DIRECTIONS.forEach(dir => {
          this.anims.create({
            key: `demonlord_idle_${dir.folder}`,
            frames: [{ key: `demonlord_idle_${dir.folder}_0` }],
            frameRate: 1,
            repeat: -1
          });
        });
        
        this.bossSprite.play('demonlord_idle_S');
        
        // Show boss incoming message
        if (!this.bossIncomingShown) {
          this.showBossIncomingMessage();
        }
        
        console.log(`Boss spawned at level ${this.currentLevel} with ${this.bossHealth} health`);
      }
      
      showBossIncomingMessage() {
        this.bossIncomingShown = true;
        
        const { width, height } = this.sys.game.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(100);
        
        // Boss incoming text
        const bossText = this.add.text(centerX, centerY - 50, 'BOSS INCOMING!', {
          font: 'bold 48px Arial',
          fill: '#ff0000',
          stroke: '#000',
          strokeThickness: 8,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        // Level info
        const levelText = this.add.text(centerX, centerY + 20, `Level ${this.currentLevel} Boss`, {
          font: 'bold 32px Arial',
          fill: '#ffff00',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        // Store UI elements for cleanup
        this.bossIncomingUI = { overlay, bossText, levelText };
        
        // Remove after 3 seconds
        this.time.delayedCall(3000, () => {
          if (this.bossIncomingUI) {
            Object.values(this.bossIncomingUI).forEach(element => {
              if (element && element.destroy) {
                element.destroy();
              }
            });
            this.bossIncomingUI = null;
          }
        });
      }
      
      openGameInfoMenu() {
        console.log('openGameInfoMenu called, current state:', this.gameInfoMenuOpen);
        if (this.gameInfoMenuOpen) {
          console.log('Game info menu already open, returning');
          return;
        }
        
        this.gameInfoMenuOpen = true;
        console.log('Opening game info menu...');
        const { width, height } = this.sys.game.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRoundedRect(centerX - 300, centerY - 200, 600, 400, 10);
        bg.setScrollFactor(0).setDepth(90);
        
        // Border
        const border = this.add.graphics();
        border.lineStyle(3, 0x00ff00, 1);
        border.strokeRoundedRect(centerX - 300, centerY - 200, 600, 400, 10);
        border.setScrollFactor(0).setDepth(90);
        
        // Title
        const title = this.add.text(centerX, centerY - 170, 'GAME INFORMATION', {
          font: 'bold 32px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        // Left column - Gems and Resources
        const leftColumnX = centerX - 250;
        const leftColumnY = centerY - 120;
        
        const gemsTitle = this.add.text(leftColumnX, leftColumnY, 'GEMS COLLECTED:', {
          font: 'bold 20px Arial',
          fill: '#ffff00',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        const blueGemInfo = this.add.text(leftColumnX, leftColumnY + 30, `💎 Blue Gems: ${this.blueGemCount || 0}`, {
          font: '18px Arial',
          fill: '#0080ff',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        const greenGemInfo = this.add.text(leftColumnX, leftColumnY + 55, `💎 Green Gems: ${this.greenGemCount || 0}`, {
          font: '18px Arial',
          fill: '#00ff00',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        const redGemInfo = this.add.text(leftColumnX, leftColumnY + 80, `💎 Red Gems: ${this.redGemCount || 0}`, {
          font: '18px Arial',
          fill: '#ff0000',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        const goldInfo = this.add.text(leftColumnX, leftColumnY + 110, `💰 Gold: ${this.goldCount || 0}`, {
          font: '18px Arial',
          fill: '#ffd700',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        // Right column - Enemy and Boss Info
        const rightColumnX = centerX + 50;
        const rightColumnY = centerY - 120;
        
        const enemyTitle = this.add.text(rightColumnX, rightColumnY, 'ENEMY STATUS:', {
          font: 'bold 20px Arial',
          fill: '#ff6666',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        // Use cached values for performance
        const aliveSkeletons = this._cachedAliveSkeletons || this.skeletons.filter(s => s.alive).length;
        const aliveSlimes = this._cachedAliveSlimes || this.slimes.filter(s => s.alive).length;
        const totalAlive = aliveSkeletons + aliveSlimes;
        
        const enemyCountInfo = this.add.text(rightColumnX, rightColumnY + 30, `Total Enemies: ${totalAlive}`, {
          font: '18px Arial',
          fill: '#ffffff',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        const skeletonInfo = this.add.text(rightColumnX, rightColumnY + 55, `Skeletons: ${aliveSkeletons}`, {
          font: '18px Arial',
          fill: '#ffaa66',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        const slimeInfo = this.add.text(rightColumnX, rightColumnY + 80, `Slimes: ${aliveSlimes}`, {
          font: '18px Arial',
          fill: '#66ff66',
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        
        // Boss info
        let bossInfo;
        if (this.bossAlive) {
          const bossHealthPercent = Math.round((this.bossHealth / this.bossSpawnData.health) * 100);
          bossInfo = this.add.text(rightColumnX, rightColumnY + 110, `👹 Boss: ${bossHealthPercent}% HP`, {
            font: 'bold 18px Arial',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        } else if (this.bossSpawnData.spawned) {
          bossInfo = this.add.text(rightColumnX, rightColumnY + 110, `👹 Boss: DEFEATED`, {
            font: 'bold 18px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        } else {
          bossInfo = this.add.text(rightColumnX, rightColumnY + 110, `👹 Boss: PENDING`, {
            font: 'bold 18px Arial',
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0, 0).setScrollFactor(0).setDepth(91);
        }
        
        // Close button background
        const closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0x333333, 1);
        closeBtnBg.fillRoundedRect(centerX - 60, centerY + 130, 120, 40, 5);
        closeBtnBg.lineStyle(2, 0xff0000, 1);
        closeBtnBg.strokeRoundedRect(centerX - 60, centerY + 130, 120, 40, 5);
        closeBtnBg.setScrollFactor(0).setDepth(91);
        
        // Close button
        const closeBtn = this.add.text(centerX, centerY + 150, 'CLOSE', {
          font: 'bold 20px Arial',
          fill: '#ff0000',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(92);
        
        closeBtn.setInteractive();
        closeBtn.on('pointerdown', () => {
          console.log('Close button clicked');
          this.closeGameInfoMenu();
        });
        
        // Store UI elements for cleanup
        this.gameInfoMenuUI = {
          bg, border, title, gemsTitle, blueGemInfo, greenGemInfo, redGemInfo, goldInfo,
          enemyTitle, enemyCountInfo, skeletonInfo, slimeInfo, bossInfo, closeBtnBg, closeBtn
        };
        
        console.log('Game info menu created with', Object.keys(this.gameInfoMenuUI).length, 'elements');
        
        closeBtn.on('pointerover', () => {
          closeBtn.setStyle({ fill: '#ffff00' });
        });
        
        closeBtn.on('pointerout', () => {
          closeBtn.setStyle({ fill: '#ff0000' });
        });
      }
      
      closeGameInfoMenu() {
        console.log('closeGameInfoMenu called, gameInfoMenuOpen:', this.gameInfoMenuOpen, 'gameInfoMenuUI:', !!this.gameInfoMenuUI);
        if (!this.gameInfoMenuOpen || !this.gameInfoMenuUI) {
          console.log('Early return from closeGameInfoMenu');
          return;
        }
        
        this.gameInfoMenuOpen = false;
        console.log('Destroying game info menu UI elements');
        
        // Destroy all UI elements
        Object.values(this.gameInfoMenuUI).forEach(element => {
          if (element && element.destroy) {
            element.destroy();
          }
        });
        
        this.gameInfoMenuUI = null;
        console.log('Game info menu closed successfully');
      }
      
      // Pause menu functions
      togglePauseMenu() {
        if (this.pauseMenuOpen) {
          this.closePauseMenu();
        } else {
          this.openPauseMenu();
        }
      }
      
      openPauseMenu() {
        if (this.pauseMenuOpen) return;
        
        this.pauseMenuOpen = true;
        // Don't pause the game, just show the menu overlay
        
        const { width, height } = this.sys.game.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background overlay
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, width, height);
        bg.setScrollFactor(0).setDepth(80);
        
        // Main menu container
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0x222222, 0.95);
        menuBg.fillRoundedRect(centerX - 250, centerY - 200, 500, 400, 10);
        menuBg.lineStyle(3, 0x00ff00, 1);
        menuBg.strokeRoundedRect(centerX - 250, centerY - 200, 500, 400, 10);
        menuBg.setScrollFactor(0).setDepth(81);
        
        // Title
        const title = this.add.text(centerX, centerY - 170, 'PAUSE MENU', {
          font: 'bold 32px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82);
        
        // Menu buttons
        const buttonY = centerY - 100;
        const buttonSpacing = 50;
        
        // Save Game button
        const saveBtn = this.add.text(centerX, buttonY, '💾 SAVE GAME', {
          font: 'bold 20px Arial',
          fill: '#00aaff',
          stroke: '#000',
          strokeThickness: 2,
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82).setInteractive({ useHandCursor: true });
        
        saveBtn.on('pointerdown', () => {
          this.closePauseMenu();
          this.openSaveMenu();
        });
        
        saveBtn.on('pointerover', () => {
          saveBtn.setStyle({ fill: '#00ffff' });
        });
        
        saveBtn.on('pointerout', () => {
          saveBtn.setStyle({ fill: '#00aaff' });
        });
        
        // Load Game button
        const loadBtn = this.add.text(centerX, buttonY + buttonSpacing, '📁 LOAD GAME', {
          font: 'bold 20px Arial',
          fill: '#00aaff',
          stroke: '#000',
          strokeThickness: 2,
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82).setInteractive({ useHandCursor: true });
        
        loadBtn.on('pointerdown', () => {
          this.closePauseMenu();
          this.openLoadMenu();
        });
        
        loadBtn.on('pointerover', () => {
          loadBtn.setStyle({ fill: '#00ffff' });
        });
        
        loadBtn.on('pointerout', () => {
          loadBtn.setStyle({ fill: '#00aaff' });
        });
        
        // Game Info button
        const infoBtn = this.add.text(centerX, buttonY + buttonSpacing * 2, '📊 GAME INFO', {
          font: 'bold 20px Arial',
          fill: '#00ffff',
          stroke: '#000',
          strokeThickness: 2,
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82).setInteractive({ useHandCursor: true });
        
        infoBtn.on('pointerdown', () => {
          this.closePauseMenu();
          this.openGameInfoMenu();
        });
        
        infoBtn.on('pointerover', () => {
          infoBtn.setStyle({ fill: '#ffff00' });
        });
        
        infoBtn.on('pointerout', () => {
          infoBtn.setStyle({ fill: '#00ffff' });
        });
        
        // Store button
        const storeBtn = this.add.text(centerX, buttonY + buttonSpacing * 3, '🏪 STORE', {
          font: 'bold 20px Arial',
          fill: '#ffaa00',
          stroke: '#000',
          strokeThickness: 2,
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82).setInteractive({ useHandCursor: true });
        
        storeBtn.on('pointerdown', () => {
          this.closePauseMenu();
          if (!this.storeOpen) {
            this.openStore();
          }
        });
        
        storeBtn.on('pointerover', () => {
          storeBtn.setStyle({ fill: '#ffff00' });
        });
        
        storeBtn.on('pointerout', () => {
          storeBtn.setStyle({ fill: '#ffaa00' });
        });
        
        // Active Buffs section
        const buffsTitle = this.add.text(centerX, buttonY + buttonSpacing * 4 + 20, 'ACTIVE BUFFS:', {
          font: 'bold 16px Arial',
          fill: '#ffff00',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82);
        
        // Display active buffs
        const activeBuffs = [];
        if (this.temporaryBuffs.damage.active) {
          activeBuffs.push(`⚔️ Damage +${Math.round((this.temporaryBuffs.damage.multiplier - 1) * 100)}%`);
        }
        if (this.temporaryBuffs.speed.active) {
          activeBuffs.push(`⚡ Speed +${Math.round((this.temporaryBuffs.speed.multiplier - 1) * 100)}%`);
        }
        if (this.temporaryBuffs.shield.active) {
          activeBuffs.push(`🛡️ Shield Active`);
        }
        if (this.rageActive) {
          activeBuffs.push(`😤 Rage Active`);
        }
        if (this.shieldActive) {
          activeBuffs.push(`🛡️ Shield Active`);
        }
        
        let buffsText = activeBuffs.length > 0 ? activeBuffs.join('\n') : 'No active buffs';
        const buffsDisplay = this.add.text(centerX, buttonY + buttonSpacing * 4 + 50, buffsText, {
          font: '14px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 1,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82);
        
        // Enemy Information section
        const enemyTitle = this.add.text(centerX, buttonY + buttonSpacing * 4 + 100, 'ENEMY STATUS:', {
          font: 'bold 16px Arial',
          fill: '#ff6666',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82);
        
        // Get current enemy counts
        const aliveSkeletons = this.skeletons ? this.skeletons.filter(s => s.alive).length : 0;
        const aliveSlimes = this.slimes ? this.slimes.filter(s => s.alive).length : 0;
        const totalEnemies = aliveSkeletons + aliveSlimes;
        
        // Display enemy information
        const enemyInfo = [
          `💀 Skeletons: ${aliveSkeletons}`,
          `🟢 Slimes: ${aliveSlimes}`,
          `⚔️ Total Enemies: ${totalEnemies}`
        ].join('\n');
        
        const enemyDisplay = this.add.text(centerX, buttonY + buttonSpacing * 4 + 130, enemyInfo, {
          font: '14px Arial',
          fill: '#ffaa00',
          stroke: '#000',
          strokeThickness: 1,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82);
        
        // Resume button
        const resumeBtn = this.add.text(centerX, centerY + 150, '▶️ RESUME GAME', {
          font: 'bold 24px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 3,
          backgroundColor: '#333333',
          padding: { x: 30, y: 15 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82).setInteractive({ useHandCursor: true });
        
        resumeBtn.on('pointerdown', () => {
          this.closePauseMenu();
        });
        
        resumeBtn.on('pointerover', () => {
          resumeBtn.setStyle({ fill: '#ffff00' });
        });
        
        resumeBtn.on('pointerout', () => {
          resumeBtn.setStyle({ fill: '#00ff00' });
        });
        
        // Back to Site button
        const backToSiteBtn = this.add.text(centerX, centerY + 200, '🏠 BACK TO SITE', {
          font: 'bold 20px Arial',
          fill: '#ff6666',
          stroke: '#000',
          strokeThickness: 2,
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(82).setInteractive({ useHandCursor: true });
        
        backToSiteBtn.on('pointerdown', () => {
          // Navigate back to the main site
          window.location.href = '/';
        });
        
        backToSiteBtn.on('pointerover', () => {
          backToSiteBtn.setStyle({ fill: '#ff9999' });
        });
        
        backToSiteBtn.on('pointerout', () => {
          backToSiteBtn.setStyle({ fill: '#ff6666' });
        });
        
        // Store UI elements for cleanup
        this.pauseMenuUI = {
          bg, menuBg, title, saveBtn, loadBtn, infoBtn, storeBtn, buffsTitle, buffsDisplay, enemyTitle, enemyDisplay, resumeBtn, backToSiteBtn
        };
      }
      
      closePauseMenu() {
        if (!this.pauseMenuOpen || !this.pauseMenuUI) return;
        
        this.pauseMenuOpen = false;
        // Game wasn't paused, so no need to resume
        
        // Destroy all UI elements
        Object.values(this.pauseMenuUI).forEach(element => {
          if (element && element.destroy) {
            element.destroy();
          }
        });
        
        this.pauseMenuUI = null;
      }
      
      // Load menu function (separate from save menu)
      openLoadMenu() {
        if (this.loadMenuOpen) return;
        
        this.loadMenuOpen = true;
        const { width, height } = this.sys.game.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background overlay
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(0, 0, width, height);
        bg.setScrollFactor(0).setDepth(90);
        
        // Menu background
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0x222222, 0.95);
        menuBg.fillRoundedRect(centerX - 300, centerY - 250, 600, 500, 10);
        menuBg.lineStyle(3, 0x00aaff, 1);
        menuBg.strokeRoundedRect(centerX - 300, centerY - 250, 600, 500, 10);
        menuBg.setScrollFactor(0).setDepth(91);
        
        // Title
        const title = this.add.text(centerX, centerY - 200, 'LOAD GAME', {
          font: 'bold 32px Arial',
          fill: '#00aaff',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(92);
        
        // Get save games
        const saveGames = this.getAllSaveGames();
        const loadMenuElements = [bg, menuBg, title];
        
        if (saveGames.length > 0) {
          // Display save games (max 5)
          saveGames.slice(0, 5).forEach((save, index) => {
            const yPos = centerY - 120 + (index * 60);
            const saveText = `${save.name} - ${save.date.toLocaleDateString()} ${save.date.toLocaleTimeString()}`;
            
            // Save button container
            const container = this.add.container(centerX, yPos);
            container.setScrollFactor(0).setDepth(92);
            
            // Save button background
            const saveBg = this.add.graphics();
            saveBg.fillStyle(0x333333, 1);
            saveBg.fillRoundedRect(-250, -20, 500, 40, 5);
            saveBg.lineStyle(2, 0x00aaff, 1);
            saveBg.strokeRoundedRect(-250, -20, 500, 40, 5);
            
            // Save text
            const saveBtn = this.add.text(0, 0, saveText, {
              font: '18px Arial',
              fill: '#00aaff',
            }).setOrigin(0.5);
            
            // Delete button (X)
            const deleteBtn = this.add.text(220, -10, '✕', {
              font: 'bold 16px Arial',
              fill: '#ff4444',
              backgroundColor: '#333',
              padding: { x: 8, y: 4 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            // Add all elements to container
            container.add([saveBg, saveBtn, deleteBtn]);
            container.setInteractive(new Phaser.Geom.Rectangle(-250, -20, 500, 40), Phaser.Geom.Rectangle.Contains);
            
            // Load save on click
            container.on('pointerdown', () => {
              this.closeLoadMenu();
              this.loadGame(save.name);
            });
            
            // Delete save on X click
            deleteBtn.on('pointerdown', (pointer) => {
              // Prevent event from bubbling up to parent container
              pointer.event.stopPropagation();
              console.log('Delete button clicked for save:', save.name);
              if (confirm(`Are you sure you want to delete save "${save.name}"?`)) {
                console.log('Deleting save game:', save.name);
                const success = this.deleteSaveGame(save.name);
                console.log('Delete result:', success);
                if (success) {
                  this.closeLoadMenu();
                  // Small delay to ensure cleanup is complete
                  this.time.delayedCall(100, () => {
                    this.openLoadMenu();
                  });
                }
              }
            });
            
            loadMenuElements.push(container);
          });
        } else {
          // No saves message
          const noSavesText = this.add.text(centerX, centerY, 'No save games found', {
            font: '24px Arial',
            fill: '#666',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(92);
          
          loadMenuElements.push(noSavesText);
        }
        
        // Back button
        const backBtn = this.add.text(centerX, centerY + 200, 'BACK', {
          font: 'bold 20px Arial',
          fill: '#ff0000',
          stroke: '#000',
          strokeThickness: 2,
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(92).setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerdown', () => {
          this.closeLoadMenu();
        });
        
        loadMenuElements.push(backBtn);
        
        // Store UI elements for cleanup
        this.loadMenuUI = loadMenuElements;
      }
      
      closeLoadMenu() {
        if (!this.loadMenuOpen || !this.loadMenuUI) return;
        
        this.loadMenuOpen = false;
        
        // Destroy all UI elements
        this.loadMenuUI.forEach(element => {
          if (element && element.destroy) {
            element.destroy();
          }
        });
        
        this.loadMenuUI = null;
      }
      advanceToNextLevel() {
        if (this.levelAdvancementShown) return;
        this.levelAdvancementShown = true;
        
        // Show level completion message
        const { width, height } = this.sys.game.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(100);
        
        // Level complete text
        const levelCompleteText = this.add.text(centerX, centerY - 50, `LEVEL ${this.currentLevel} COMPLETE!`, {
          font: 'bold 48px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 8,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        // Next level text
        const nextLevelText = this.add.text(centerX, centerY + 20, `Advancing to Level ${this.currentLevel + 1}...`, {
          font: 'bold 32px Arial',
          fill: '#ffff00',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        // Store UI elements for cleanup
        this.levelCompleteUI = { overlay, levelCompleteText, nextLevelText };
        
        // Advance to next level after 3 seconds
        this.time.delayedCall(3000, () => {
          this.currentLevel++;
          this.generateNewLevel();
        });
      }
      
      generateNewLevel() {
        // Clean up level complete UI
        if (this.levelCompleteUI) {
          Object.values(this.levelCompleteUI).forEach(element => {
            if (element && element.destroy) {
              element.destroy();
            }
          });
          this.levelCompleteUI = null;
        }
        
        // Reset level state
        this.levelCompleted = false;
        this.levelAdvancementShown = false;
        
        // Clear all existing enemies
        this.skeletons.forEach(skeleton => {
          if (skeleton.sprite) skeleton.sprite.destroy();
        });
        this.slimes.forEach(slime => {
          if (slime.sprite) slime.sprite.destroy();
        });
        this.skeletons = [];
        this.slimes = [];
        
        // Clear boss if exists
        if (this.bossSprite) {
          this.bossSprite.destroy();
          this.bossSprite = null;
        }
        this.bossAlive = false;
        this.bossIncomingShown = false;
        
        // Clear boss incoming UI
        if (this.bossIncomingUI) {
          Object.values(this.bossIncomingUI).forEach(element => {
            if (element && element.destroy) {
              element.destroy();
            }
          });
          this.bossIncomingUI = null;
        }
        
        // Clear spawn point indicators
        this.skeletonSpawnIndicators.forEach(indicator => {
          if (indicator && indicator.circle) indicator.circle.destroy();
          if (indicator && indicator.label) indicator.label.destroy();
        });
        this.slimeSpawnIndicators.forEach(indicator => {
          if (indicator && indicator.circle) indicator.circle.destroy();
          if (indicator && indicator.label) indicator.label.destroy();
        });
        
        // Generate new random spawn points
        this.generateRandomSpawnPoints();
        
        // Update level display
        this.updateLevelDisplay();
        
        console.log(`Advanced to Level ${this.currentLevel}`);
      }
      
      generateRandomSpawnPoints() {
        // Clear existing spawn points
        this.skeletonSpawnPoints = [];
        this.slimeSpawnPoints = [];
        this.skeletonSpawnIndicators = [];
        this.slimeSpawnIndicators = [];
        
        // Generate random number of spawn points (3-6 total)
        const totalSpawnPoints = Math.floor(Math.random() * 4) + 3; // 3-6 spawn points
        const skeletonSpawnCount = Math.floor(totalSpawnPoints / 2);
        const slimeSpawnCount = totalSpawnPoints - skeletonSpawnCount;
        
        // Get all possible spawn positions
        const allPossible = [];
        for (let x = 5; x < MAP_WIDTH - 5; x++) {
          for (let y = 5; y < MAP_HEIGHT - 5; y++) {
            allPossible.push({ x, y });
          }
        }
        
        // Shuffle and pick random spawn points
        const shuffled = allPossible.sort(() => Math.random() - 0.5);
        const usedPositions = new Set();
        
        // Pick skeleton spawn points
        for (let i = 0; i < skeletonSpawnCount; i++) {
          let spawnPoint;
          do {
            spawnPoint = shuffled.pop();
          } while (usedPositions.has(`${spawnPoint.x},${spawnPoint.y}`));
          
          this.skeletonSpawnPoints.push(spawnPoint);
          usedPositions.add(`${spawnPoint.x},${spawnPoint.y}`);
        }
        
        // Pick slime spawn points
        for (let i = 0; i < slimeSpawnCount; i++) {
          let spawnPoint;
          do {
            spawnPoint = shuffled.pop();
          } while (usedPositions.has(`${spawnPoint.x},${spawnPoint.y}`));
          
          this.slimeSpawnPoints.push(spawnPoint);
          usedPositions.add(`${spawnPoint.x},${spawnPoint.y}`);
        }
        
        // Initialize spawn data with random enemy counts
        this.skeletonSpawnData = this.skeletonSpawnPoints.map(() => ({
          active: true,
          count: 0,
          max: Math.floor(Math.random() * 10) + 15, // 15-24 enemies per spawn point
          timer: 0,
          spawnInterval: Math.random() * 2000 + 1000 // 1-3 seconds
        }));
        
        this.slimeSpawnData = this.slimeSpawnPoints.map(() => ({
          active: true,
          count: 0,
          max: Math.floor(Math.random() * 8) + 12, // 12-19 enemies per spawn point
          timer: 0,
          spawnInterval: Math.random() * 2000 + 1000 // 1-3 seconds
        }));
        
        // Boss spawn data - boss appears when all regular enemies are defeated
        this.bossSpawnData = {
          active: false,
          spawned: false,
          health: 200 + (this.currentLevel * 50), // Boss health scales with level
          damage: 30 + (this.currentLevel * 5), // Boss damage scales with level
          position: { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) }
        };
        
        // Add visual indicators for new spawn points
        this.skeletonSpawnPoints.forEach((sp, index) => {
          const { x, y } = this.getIsoPos(sp.x, sp.y);
          
          // Draw orange circle for skeleton spawn points
          const circle = this.add.graphics();
          circle.lineStyle(3, 0xff8800, 1);
          circle.strokeCircle(x, y, 20);
          circle.setDepth(10);
          
          // Add label
          const label = this.add.text(x, y - 40, `S${index + 1}`, {
            font: 'bold 16px Arial',
            fill: '#ff8800',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0.5).setDepth(10);
          
          this.skeletonSpawnIndicators[index] = { circle, label };
        });
        
        this.slimeSpawnPoints.forEach((sp, index) => {
          const { x, y } = this.getIsoPos(sp.x, sp.y);
          
          // Draw green circle for slime spawn points
          const circle = this.add.graphics();
          circle.lineStyle(3, 0x00ff00, 1);
          circle.strokeCircle(x, y, 20);
          circle.setDepth(10);
          
          // Add label
          const label = this.add.text(x, y - 40, `L${index + 1}`, {
            font: 'bold 16px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2,
          }).setOrigin(0.5).setDepth(10);
          
          this.slimeSpawnIndicators[index] = { circle, label };
        });
      }
      
      updateLevelDisplay() {
        // Update level text in UI
        if (this.levelText) {
          this.levelText.setText(`Level: ${this.currentLevel}`);
        }
      }
      
      updateGemDisplay() {
        console.log('updateGemDisplay called with counts:', { blue: this.blueGemCount, green: this.greenGemCount, red: this.redGemCount, white: this.whiteGemCount });
        console.log('Gem display elements exist:', { 
          blue: !!this.blueGemDisplay, 
          green: !!this.greenGemDisplay, 
          red: !!this.redGemDisplay, 
          white: !!this.whiteGemDisplay 
        });
        
        if (this.blueGemDisplay) {
          this.blueGemDisplay.setText(`💎 ${this.blueGemCount || 0}`);
          console.log('Updated blue gem display to:', `💎 ${this.blueGemCount || 0}`);
        } else {
          console.log('WARNING: blueGemDisplay is null/undefined');
        }
        if (this.greenGemDisplay) {
          this.greenGemDisplay.setText(`💎 ${this.greenGemCount || 0}`);
          console.log('Updated green gem display to:', `💎 ${this.greenGemCount || 0}`);
        } else {
          console.log('WARNING: greenGemDisplay is null/undefined');
        }
        if (this.redGemDisplay) {
          this.redGemDisplay.setText(`💎 ${this.redGemCount || 0}`);
          console.log('Updated red gem display to:', `💎 ${this.redGemCount || 0}`);
        } else {
          console.log('WARNING: redGemDisplay is null/undefined');
        }
        if (this.whiteGemDisplay) {
          this.whiteGemDisplay.setText(`💎 ${this.whiteGemCount || 0}`);
          console.log('Updated white gem display to:', `💎 ${this.whiteGemCount || 0}`);
        } else {
          console.log('WARNING: whiteGemDisplay is null/undefined');
        }
      }
      
      updateUIScaling() {
        // Calculate UI scale based on zoom level (inverse relationship)
        const uiScale = 1 / this.cameraZoom;
        
        // Scale all UI text elements
        const uiElements = [
          this.healthBarText,
          this.knight2HealthBarText,
          this.goldText,
          this.levelText,
          this.gameInfoButton
        ];
        
        uiElements.forEach(element => {
          if (element) {
            element.setScale(uiScale);
          }
        });
        
        // Scale health bar backgrounds
        if (this.healthBarBg) {
          this.healthBarBg.setScale(uiScale);
        }
        if (this.knight2HealthBarBg) {
          this.knight2HealthBarBg.setScale(uiScale);
        }
      }
      
      // Delete save game
      deleteSaveGame(saveName = null) {
        try {
          console.log('deleteSaveGame called with:', saveName);
          
          if (!saveName) {
            saveName = this.saveName;
            console.log('Using current save name:', saveName);
          }
          
          if (!saveName) {
            console.log('No save name provided for deletion');
            return false;
          }
          
          const currentSaveKey = this.getSaveKey(saveName);
          console.log('Deleting save with key:', currentSaveKey);
          
          // Check if save exists before deleting
          const existingSave = localStorage.getItem(currentSaveKey);
          if (!existingSave) {
            console.log('Save does not exist:', saveName);
            return false;
          }
          
          localStorage.removeItem(currentSaveKey);
          console.log('Save game deleted successfully:', saveName);
          
          // If we deleted the current save, clear the current save name
          if (saveName === this.saveName) {
            this.saveName = '';
            console.log('Current save name cleared');
          }
          
          return true;
        } catch (error) {
          console.error('Failed to delete save game:', error);
          return false;
        }
      }
      
      // Delete all save games
      deleteAllSaveGames() {
        try {
          // Get all save games
          const saveGames = this.getAllSaveGames();
          
          // Delete each save game
          saveGames.forEach(save => {
            localStorage.removeItem(this.getSaveKey(save.name));
            console.log(`Deleted save game: ${save.name}`);
          });
          
          // Also delete the default save
          localStorage.removeItem(this.getSaveKey());
          
          // Clear current save name
          this.saveName = '';
          
          console.log('All save games deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete all save games:', error);
          return false;
        }
      }
      
      // Open save menu
      openSaveMenu() {
        if (this.saveMenuOpen) return;
        
        this.saveMenuOpen = true;
        const cam = this.cameras.main;
        const centerX = cam.worldView.centerX;
        const centerY = cam.worldView.centerY;
        
        // Create background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(centerX - 300, centerY - 250, 600, 500, 10);
        bg.setScrollFactor(0).setDepth(90);
        
        // Create border
        const border = this.add.graphics();
        border.lineStyle(3, 0x00ff00, 1);
        border.strokeRoundedRect(centerX - 300, centerY - 250, 600, 500, 10);
        border.setScrollFactor(0).setDepth(90);
        
        // Title
        const title = this.add.text(centerX, centerY - 200, 'SAVE GAME', {
          font: 'bold 32px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        // Save name input
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0x333333, 1);
        inputBg.fillRoundedRect(centerX - 200, centerY - 120, 400, 40, 5);
        inputBg.setScrollFactor(0).setDepth(91);
        
        const inputLabel = this.add.text(centerX - 200, centerY - 140, 'Save Name:', {
          font: '16px Arial',
          fill: '#ffffff',
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(91);
        
        // Create a simple input field using DOM
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = this.saveName || '';
        inputElement.style.position = 'absolute';
        inputElement.style.left = `${centerX - 190}px`;
        inputElement.style.top = `${centerY - 110}px`;
        inputElement.style.width = '380px';
        inputElement.style.height = '30px';
        inputElement.style.fontSize = '16px';
        inputElement.style.padding = '5px';
        inputElement.style.border = '2px solid #00ff00';
        inputElement.style.borderRadius = '5px';
        inputElement.style.backgroundColor = '#333333';
        inputElement.style.color = '#ffffff';
        inputElement.style.zIndex = '1000';
        
        document.body.appendChild(inputElement);
        inputElement.focus();
        
        // Save button
        const saveBtn = this.add.text(centerX - 100, centerY + 50, 'SAVE', {
          font: 'bold 20px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        saveBtn.setInteractive();
        saveBtn.on('pointerdown', () => {
          const saveName = inputElement.value.trim();
          if (saveName) {
            this.saveGame(saveName);
            this.closeSaveMenu();
          }
        });
        
        // Cancel button
        const cancelBtn = this.add.text(centerX + 100, centerY + 50, 'CANCEL', {
          font: 'bold 20px Arial',
          fill: '#ff0000',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        cancelBtn.setInteractive();
        cancelBtn.on('pointerdown', () => {
          this.closeSaveMenu();
        });
        
        // Delete All Saves button
        const deleteAllBtn = this.add.text(centerX, centerY + 100, 'DELETE ALL SAVES', {
          font: 'bold 16px Arial',
          fill: '#ff6666',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        deleteAllBtn.setInteractive();
        deleteAllBtn.on('pointerdown', () => {
          if (confirm('Are you sure you want to delete ALL save games? This action cannot be undone.')) {
            console.log('Deleting all save games from save menu');
            const success = this.deleteAllSaveGames();
            console.log('Delete all result:', success);
            if (success) {
              this.closeSaveMenu();
            }
          }
        });
        
        // Store UI elements for cleanup
        this.saveMenuUI = {
          bg, border, title, inputBg, inputLabel, saveBtn, cancelBtn, deleteAllBtn, inputElement
        };
      }
      
      // Close save menu
      closeSaveMenu() {
        if (!this.saveMenuOpen || !this.saveMenuUI) return;
        
        this.saveMenuOpen = false;
        
        // Remove DOM input element
        if (this.saveMenuUI.inputElement) {
          document.body.removeChild(this.saveMenuUI.inputElement);
        }
        
        // Destroy all UI elements
        Object.values(this.saveMenuUI).forEach(element => {
          if (element && element.destroy) {
            element.destroy();
          }
        });
        
        this.saveMenuUI = null;
      }
      
      // Show save name popup
      showSaveNamePopup() {
        if (this.saveMenuOpen) return;
        
        this.saveMenuOpen = true;
        const cam = this.cameras.main;
        const centerX = cam.worldView.centerX;
        const centerY = cam.worldView.centerY;
        
        // Create background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(centerX - 250, centerY - 100, 500, 200, 10);
        bg.setScrollFactor(0).setDepth(90);
        
        // Create border
        const border = this.add.graphics();
        border.lineStyle(3, 0x00ff00, 1);
        border.strokeRoundedRect(centerX - 250, centerY - 100, 500, 200, 10);
        border.setScrollFactor(0).setDepth(90);
        
        // Title
        const title = this.add.text(centerX, centerY - 60, 'SAVE GAME', {
          font: 'bold 28px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        // Save name input
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0x333333, 1);
        inputBg.fillRoundedRect(centerX - 200, centerY - 20, 400, 40, 5);
        inputBg.setScrollFactor(0).setDepth(91);
        
        const inputLabel = this.add.text(centerX - 200, centerY - 40, 'Save Name:', {
          font: '16px Arial',
          fill: '#ffffff',
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(91);
        
        // Create a simple input field using DOM
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = this.saveName || '';
        inputElement.style.position = 'absolute';
        inputElement.style.left = `${centerX - 190}px`;
        inputElement.style.top = `${centerY - 10}px`;
        inputElement.style.width = '380px';
        inputElement.style.height = '30px';
        inputElement.style.fontSize = '16px';
        inputElement.style.padding = '5px';
        inputElement.style.border = '2px solid #00ff00';
        inputElement.style.borderRadius = '5px';
        inputElement.style.backgroundColor = '#333333';
        inputElement.style.color = '#ffffff';
        inputElement.style.zIndex = '1000';
        
        document.body.appendChild(inputElement);
        inputElement.focus();
        
        // Save button
        const saveBtn = this.add.text(centerX - 80, centerY + 40, 'SAVE', {
          font: 'bold 20px Arial',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        saveBtn.setInteractive();
        saveBtn.on('pointerdown', () => {
          const saveName = inputElement.value.trim();
          if (saveName) {
            this.saveGame(saveName);
            this.closeSaveMenu();
          }
        });
        
        // Cancel button
        const cancelBtn = this.add.text(centerX + 80, centerY + 40, 'CANCEL', {
          font: 'bold 20px Arial',
          fill: '#ff0000',
          stroke: '#000',
          strokeThickness: 2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        cancelBtn.setInteractive();
        cancelBtn.on('pointerdown', () => {
          this.closeSaveMenu();
        });
        
        // Store UI elements for cleanup
        this.saveMenuUI = {
          bg, border, title, inputBg, inputLabel, saveBtn, cancelBtn, inputElement
        };
      }
      
      // Cursor system methods
      createCursorSystem() {
        console.log('Creating cursor system...');
        
        // Check if cursor assets are loaded
        if (!this.textures.exists('cursor_normal')) {
          console.log('ERROR: Cursor assets not loaded! Available textures:', Object.keys(this.textures.list));
          return;
        }
        
        // Create cursor sprite
        this.cursor = this.add.image(0, 0, 'cursor_normal');
        this.cursor.setDepth(1000);
        this.cursor.setScrollFactor(0);
        
        // Hide default cursor
        this.input.setDefaultCursor('none');
        
        // Add pointer move event
        this.input.on('pointermove', (pointer) => {
          if (this.cursor) {
            this.cursor.x = pointer.x;
            this.cursor.y = pointer.y;
            this.updateCursorMode(pointer);
          }
        });
        
        // Add click event for movement
        this.input.on('pointerdown', (pointer) => {
          console.log('Click detected at:', pointer.x, pointer.y);
          this.handleClick(pointer);
        });
        
        // Movement mode toggle disabled for now - will be re-enabled for Android app
        // this.input.keyboard.on('keydown-TAB', () => {
        //   console.log('TAB pressed - toggling movement mode');
        //   this.toggleMovementMode();
        // });
        
        console.log('Cursor system created successfully');
      }
      
      updateCursorMode(pointer) {
        if (!this.cursor) return;
        
        // Convert screen coordinates to world coordinates
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Check if clicking on an enemy
        const enemyAtPosition = this.getEnemyAtPosition(worldPoint.x, worldPoint.y);
        if (enemyAtPosition) {
          this.cursor.setTexture('cursor_attack');
          return;
        }
        
        // Check if clicking on an interactable (crate, gold drop, etc.)
        const interactableAtPosition = this.getInteractableAtPosition(worldPoint.x, worldPoint.y);
        if (interactableAtPosition) {
          this.cursor.setTexture('cursor_interact');
          return;
        }
        
        // Default to move cursor
        this.cursor.setTexture('cursor_move');
      }
      
      getEnemyAtPosition(worldX, worldY) {
        // Check skeletons
        for (const skeleton of this.skeletons) {
          if (!skeleton.alive) continue;
          const { x, y } = this.getIsoPos(skeleton.tileX, skeleton.tileY);
          const distance = Phaser.Math.Distance.Between(worldX, worldY, x, y);
          if (distance < 32) {
            return skeleton;
          }
        }
        
        // Check slimes
        for (const slime of this.slimes) {
          if (!slime.alive) continue;
          const { x, y } = this.getIsoPos(slime.tileX, slime.tileY);
          const distance = Phaser.Math.Distance.Between(worldX, worldY, x, y);
          if (distance < 32) {
            return slime;
          }
        }
        
        // Check boss
        if (this.bossAlive && this.bossSprite) {
          const { x, y } = this.getIsoPos(this.bossTileX, this.bossTileY);
          const distance = Phaser.Math.Distance.Between(worldX, worldY, x, y);
          if (distance < 48) {
            return this.bossSprite;
          }
        }
        
        return null;
      }
      
      getInteractableAtPosition(worldX, worldY) {
        // Check gold drops
        for (const drop of this.goldDrops) {
          const { x, y } = this.getIsoPos(drop.tileX, drop.tileY);
          const distance = Phaser.Math.Distance.Between(worldX, worldY, x, y);
          if (distance < 32) {
            return drop;
          }
        }
        
        // Check crates
        for (const crate of this.crates) {
          const { x, y } = this.getIsoPos(crate.tileX, crate.tileY);
          const distance = Phaser.Math.Distance.Between(worldX, worldY, x, y);
          if (distance < 32) {
            return crate;
          }
        }
        
        return null;
      }
      
      handleClick(pointer) {
        console.log('Handling click, menus status:', {
          pauseMenuOpen: this.pauseMenuOpen,
          storeOpen: this.storeOpen,
          saveMenuOpen: this.saveMenuOpen,
          loadMenuOpen: this.loadMenuOpen
        });
        
        if (this.pauseMenuOpen || this.storeOpen || this.saveMenuOpen || this.loadMenuOpen) {
          console.log('Click blocked by menu');
          return; // Don't handle clicks when menus are open
        }
        
        // Convert screen coordinates to world coordinates
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Check if clicking on an enemy
        const enemy = this.getEnemyAtPosition(worldPoint.x, worldPoint.y);
        if (enemy) {
          this.attackEnemy(enemy);
          return;
        }
        
        // Check if clicking on an interactable
        const interactable = this.getInteractableAtPosition(worldPoint.x, worldPoint.y);
        if (interactable) {
          console.log('Interactable found:', interactable);
          this.interactWithObject(interactable);
          return;
        }
        
        // Click-to-move disabled for now - will be re-enabled for Android app
        console.log('Click-to-move disabled - use keyboard controls');
      }
      
      attackEnemy(enemy) {
        if (this.isKnightAttacking) return;
        
        this.isKnightAttacking = true;
        const dir = this.knightDir;
        this.knight.play(`${this.selectedCharacter}_attack_${dir}`);
        
        // Check if enemy is adjacent
        let enemyTileX, enemyTileY;
        if (enemy === this.bossSprite) {
          enemyTileX = this.bossTileX;
          enemyTileY = this.bossTileY;
        } else {
          enemyTileX = enemy.tileX;
          enemyTileY = enemy.tileY;
        }
        
        const dx = Math.abs(enemyTileX - this.knightTileX);
        const dy = Math.abs(enemyTileY - this.knightTileY);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
          // Enemy is adjacent, attack it
          this.performAttack(enemy);
        } else {
          // Enemy is not adjacent, move towards it first
          this.moveTowardsEnemy(enemyTileX, enemyTileY);
        }
      }
      
      moveTowardsEnemy(enemyTileX, enemyTileY) {
        // Calculate direction to enemy
        const dx = enemyTileX - this.knightTileX;
        const dy = enemyTileY - this.knightTileY;
        
        // Move one step towards enemy
        const moveX = Math.sign(dx);
        const moveY = Math.sign(dy);
        
        const newX = Phaser.Math.Clamp(this.knightTileX + moveX, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
        const newY = Phaser.Math.Clamp(this.knightTileY + moveY, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
        
        if (newX !== this.knightTileX || newY !== this.knightTileY) {
          this.moveToTile(newX, newY);
        }
      }
      
      moveToPosition(worldX, worldY) {
        // Convert world position to tile coordinates
        const tileCoords = this.worldToTile(worldX, worldY);
        if (tileCoords) {
          this.moveToTile(tileCoords.x, tileCoords.y);
        }
      }
      worldToTile(worldX, worldY) {
        // Simple conversion from world coordinates to tile coordinates
        // This is a basic implementation - you might need to adjust based on your isometric setup
        const tileX = Math.floor((worldX + worldY) / (ISO_TILE_WIDTH * 2));
        const tileY = Math.floor((worldY - worldX) / (ISO_TILE_HEIGHT * 2));
        
        // Clamp to map bounds
        const clampedX = Phaser.Math.Clamp(tileX, 0, MAP_WIDTH + MAP_RIGHT_BUFFER - 1);
        const clampedY = Phaser.Math.Clamp(tileY, 0, MAP_HEIGHT + MAP_TOP_BUFFER + MAP_BOTTOM_BUFFER - 1);
        
        return { x: clampedX, y: clampedY };
      }
      
      moveToTile(targetTileX, targetTileY) {
        if (this.isKnightTweening) return;
        
        this.clickToMoveTarget = { x: targetTileX, y: targetTileY };
        this.isMovingToTarget = true;
      }
      
      toggleMovementMode() {
        this.movementMode = this.movementMode === 'keyboard' ? 'click' : 'keyboard';
        console.log('Movement mode toggled to:', this.movementMode);
        
        // Show mode indicator
        const modeText = this.movementMode === 'click' ? 'Click-to-Move Mode' : 'Keyboard Mode';
        const modeIndicator = this.add.text(400, 24, modeText, {
          font: '16px Arial',
          fill: '#ffff00',
          stroke: '#000',
          strokeThickness: 2
        }).setScrollFactor(0).setDepth(1000);
        
        this.time.delayedCall(2000, () => {
          modeIndicator.destroy();
        });
      }
      
      moveKnightToTile(newX, newY, dir, time) {
        if (this.isKnightTweening) return;
        
        // Tween movement
        this.isKnightTweening = true;
        const { x: startX, y: startY } = this.getKnightIsoPos();
        this.knightTileX = newX;
        this.knightTileY = newY;
        this.knightDir = dir;
        const { x: endX, y: endY } = this.getKnightIsoPos();
        
        // Set sprite to start position (in case of desync)
        this.knight.x = startX;
        this.knight.y = startY;
        this.tweens && this.tweens.killTweensOf(this.knight);
        this.tweens.add({
          targets: this.knight,
          x: endX,
          y: endY,
          duration: 120,
          onComplete: () => {
            this.isKnightTweening = false;
            // Return to idle animation when movement completes
            if (!this.isKnightAttacking) {
              this.knight.play(`${this.selectedCharacter}_idle_${this.knightDir}`);
            }
          },
        });
        
        // Play walk animation
        if (!this.knight.anims.currentAnim || this.knight.anims.currentAnim.key !== `${this.selectedCharacter}_walk_${dir}`) {
          this.knight.play(`${this.selectedCharacter}_walk_${dir}`);
        }
        this.lastMoveTime = time;
      }
      
      performAttack(enemy) {
        // This method will be called when attacking an enemy
        // The actual attack logic is already in the SPACE key handler
        // We just need to trigger the same logic here
        
        try {
          // Calculate base damage
          let damage = this.characterStats.damage + (this.upgrades.damage * 5);
          
          // Apply temporary damage buff
          if (this.temporaryBuffs.damage.active) {
            damage *= this.temporaryBuffs.damage.multiplier;
          }
          
          // Apply rage effect (Fighter special move)
          let isRageAttack = false;
          if (this.rageActive && this.selectedCharacter === 'fighter') {
            damage *= 2; // Double damage
            this.rageActive = false; // Consume rage
            isRageAttack = true;
            
            // Add fire effect to rage attack
            const fireEffect = this.add.graphics();
            fireEffect.fillStyle(0xff4400, 0.8);
            fireEffect.fillCircle(enemy.x, enemy.y, 25);
            fireEffect.setDepth(5);
            
            this.tweens.add({
              targets: fireEffect,
              scaleX: 1.5,
              scaleY: 1.5,
              alpha: 0,
              duration: 500,
              ease: 'Power2',
              onComplete: () => fireEffect.destroy()
            });
          }
          
          // Check if enemy is a skeleton
          if (this.skeletons.includes(enemy)) {
            enemy.alive = false;
            enemy.play(`skeleton_death_${enemy.dir}`);
            
            // Show damage popup with different color for rage attacks
            const { x: enemyX, y: enemyY } = this.getIsoPos(enemy.tileX, enemy.tileY);
            const damageColor = isRageAttack ? '#ff4400' : '#ffffff';
            const damageText = this.add.text(enemyX, enemyY - 60, `-${damage}`, {
              font: 'bold 18px Arial',
              fill: damageColor,
              stroke: '#000000',
              strokeThickness: 2,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            // Animate damage text
            this.tweens.add({
              targets: damageText,
              y: enemyY - 90,
              alpha: 0,
              duration: 800,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
            
            // Handle drops and cleanup
            this.handleEnemyDeath(enemy, 'skeleton');
          }
          // Check if enemy is a slime
          else if (this.slimes.includes(enemy)) {
            enemy.alive = false;
            enemy.play(`slime_death_${enemy.dir}`);
            
            // Show damage popup with different color for rage attacks
            const { x: enemyX, y: enemyY } = this.getIsoPos(enemy.tileX, enemy.tileY);
            const damageColor = isRageAttack ? '#ff4400' : '#ffffff';
            const damageText = this.add.text(enemyX, enemyY - 60, `-${damage}`, {
              font: 'bold 18px Arial',
              fill: damageColor,
              stroke: '#000000',
              strokeThickness: 2,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            // Animate damage text
            this.tweens.add({
              targets: damageText,
              y: enemyY - 90,
              alpha: 0,
              duration: 800,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
            
            // Handle drops and cleanup
            this.handleEnemyDeath(enemy, 'slime');
          }
          // Check if enemy is boss
          else if (enemy === this.bossSprite) {
            this.bossHealth -= damage;
            
            // Show damage popup with different color for rage attacks
            const { x: bossX, y: bossY } = this.getIsoPos(this.bossTileX, this.bossTileY);
            const damageColor = isRageAttack ? '#ff4400' : '#ff0000';
            const damageText = this.add.text(bossX, bossY - 80, `-${damage}`, {
              font: 'bold 24px Arial',
              fill: damageColor,
              stroke: '#000000',
              strokeThickness: 3,
            }).setOrigin(0.5, 0.5).setDepth(100);
            
            // Animate damage text
            this.tweens.add({
              targets: damageText,
              y: bossY - 110,
              alpha: 0,
              duration: 1000,
              ease: 'Power2',
              onComplete: () => damageText.destroy()
            });
            
            // Update boss health bar
            if (this.bossHealthBar && this.bossHealthText) {
              const healthPercent = this.bossHealth / 200;
              this.bossHealthBar.setScale(healthPercent, 1);
              this.bossHealthText.setText(`Boss: ${this.bossHealth}/200`);
            }
            
            // Check if boss is dead
            if (this.bossHealth <= 0) {
              this.bossAlive = false;
              this.bossSprite.play(`demonlord_death_${this.bossDir}`);
              this.time.delayedCall(2000, () => {
                this.bossSprite.destroy();
                this.createBossDrops();
              });
            }
          }
          
          // Reset attack state after animation
          this.time.delayedCall(800, () => {
            this.isKnightAttacking = false;
          });
        } catch (error) {
          console.error('Error in performAttack:', error);
          this.isKnightAttacking = false;
        }
      }
      
      handleEnemyDeath(enemy, type) {
        try {
          // Update enemy counters (for internal tracking only)
          const aliveSkeletons = this.skeletons.filter(s => s.alive).length;
          const aliveSlimes = this.slimes.filter(s => s.alive).length;
        
        // Create appropriate splat effect at enemy position based on enemy type
        const { x, y } = this.getIsoPos(enemy.tileX, enemy.tileY);
        if (type === 'skeleton') {
          this.createBloodSplatEffect(x, y);
        } else if (type === 'slime') {
          this.createSlimeSplatEffect(x, y);
        }
        
        // 80% chance to drop gold
        if (Math.random() < 0.8) {
          const amount = Phaser.Math.Between(5, 30);
          const drop = this.add.image(x, y, 'gold_drop');
          drop.setOrigin(0.5, 1);
          drop.setDepth(10);
          // Show amount above drop
          const amountText = this.add.text(x, y - 48, `+${amount}`, { font: '18px Arial', fill: '#ffd700', stroke: '#222', strokeThickness: 3 }).setOrigin(0.5, 1).setDepth(11);
          this.goldDrops.push({ tileX: enemy.tileX, tileY: enemy.tileY, sprite: drop, amount, amountText });
        }
        
        // 80% chance to drop gem
        if (Math.random() < 0.8) {
          const gemTypes = ['blue', 'green', 'red'];
          const randomGemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
          const gemSprite = this.add.image(x, y - 20, `gem_${randomGemType}`);
          gemSprite.setOrigin(0.5, 1);
          gemSprite.setDepth(10);
          
          const gemObject = { 
            tileX: enemy.tileX, 
            tileY: enemy.tileY, 
            sprite: gemSprite, 
            amount: 0, 
            item: `${randomGemType}Gem` 
          };
          
          this.goldDrops.push(gemObject);
          console.log(`Gem created: ${randomGemType}Gem at (${enemy.tileX}, ${enemy.tileY}), total drops: ${this.goldDrops.length}`);
        }
        
        this.time.delayedCall(800, () => enemy.destroy());
        
        // Check if all enemies from this spawn point are dead
        this.checkSpawnPointCompletion();
        } catch (error) {
          console.error('Error in handleEnemyDeath:', error);
        }
      }
      
      createBloodSplatEffect(x, y) {
        // Create main blood splat using graphics (for skeletons)
        const bloodSplat = this.add.graphics();
        bloodSplat.fillStyle(0xcc0000, 0.9); // Dark red color
        bloodSplat.fillCircle(x, y, 12); // Main splatter
        bloodSplat.setDepth(15); // Above enemies but below UI
        
        // Add smaller splatters around the main one (like the sprite sheet)
        const splatterCount = Phaser.Math.Between(3, 6);
        const smallSplatters = [];
        
        for (let i = 0; i < splatterCount; i++) {
          const offsetX = x + Phaser.Math.Between(-15, 15);
          const offsetY = y + Phaser.Math.Between(-15, 15);
          const smallSplat = this.add.graphics();
          smallSplat.fillStyle(0xcc0000, 0.7);
          smallSplat.fillCircle(offsetX, offsetY, Phaser.Math.Between(2, 6));
          smallSplat.setDepth(15);
          smallSplatters.push(smallSplat);
        }
        
        // Add even smaller droplets
        for (let i = 0; i < 4; i++) {
          const offsetX = x + Phaser.Math.Between(-20, 20);
          const offsetY = y + Phaser.Math.Between(-20, 20);
          const droplet = this.add.graphics();
          droplet.fillStyle(0xcc0000, 0.5);
          droplet.fillCircle(offsetX, offsetY, 1);
          droplet.setDepth(15);
          smallSplatters.push(droplet);
        }
        
        // Animate the main splatter (grow and fade)
        this.tweens.add({
          targets: bloodSplat,
          scaleX: 1.3,
          scaleY: 1.3,
          alpha: 0,
          duration: 6000, // Increased from 3000 to 6000ms (6 seconds)
          ease: 'Power2',
          onComplete: () => {
            bloodSplat.destroy();
          }
        });
        
        // Animate small splatters (fade out at different rates)
        smallSplatters.forEach((splat, index) => {
          this.tweens.add({
            targets: splat,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 5000 + (index * 400), // Increased from 2500+200 to 5000+400ms (5-9 seconds)
            ease: 'Power2',
            onComplete: () => {
              splat.destroy();
            }
          });
        });
      }
      
      createSlimeSplatEffect(x, y) {
        // Create main slime splat using graphics (green, viscous effect)
        const slimeSplat = this.add.graphics();
        slimeSplat.fillStyle(0x00cc00, 0.8); // Bright green color
        slimeSplat.fillCircle(x, y, 15); // Main slime blob
        slimeSplat.setDepth(15); // Above enemies but below UI
        
        // Add multiple smaller green blobs around the main one (viscous effect)
        const blobCount = Phaser.Math.Between(4, 8);
        const smallBlobs = [];
        
        for (let i = 0; i < blobCount; i++) {
          const offsetX = x + Phaser.Math.Between(-20, 20);
          const offsetY = y + Phaser.Math.Between(-20, 20);
          const smallBlob = this.add.graphics();
          smallBlob.fillStyle(0x00cc00, 0.6);
          smallBlob.fillCircle(offsetX, offsetY, Phaser.Math.Between(3, 8));
          smallBlob.setDepth(15);
          smallBlobs.push(smallBlob);
        }
        
        // Add some darker green blobs for depth
        for (let i = 0; i < 3; i++) {
          const offsetX = x + Phaser.Math.Between(-12, 12);
          const offsetY = y + Phaser.Math.Between(-12, 12);
          const darkBlob = this.add.graphics();
          darkBlob.fillStyle(0x008800, 0.7);
          darkBlob.fillCircle(offsetX, offsetY, Phaser.Math.Between(2, 5));
          darkBlob.setDepth(15);
          smallBlobs.push(darkBlob);
        }
        
        // Add tiny green droplets for extra detail
        for (let i = 0; i < 6; i++) {
          const offsetX = x + Phaser.Math.Between(-25, 25);
          const offsetY = y + Phaser.Math.Between(-25, 25);
          const droplet = this.add.graphics();
          droplet.fillStyle(0x00ff00, 0.5);
          droplet.fillCircle(offsetX, offsetY, 1);
          droplet.setDepth(15);
          smallBlobs.push(droplet);
        }
        
        // Animate the main slime blob (expand and fade like the sprite sheet)
        this.tweens.add({
          targets: slimeSplat,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0,
          duration: 7000, // Increased from 3500 to 7000ms (7 seconds)
          ease: 'Power2',
          onComplete: () => {
            slimeSplat.destroy();
          }
        });
        
        // Animate small blobs (staggered fade for viscous effect)
        smallBlobs.forEach((blob, index) => {
          this.tweens.add({
            targets: blob,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 6000 + (index * 300), // Increased from 3000+150 to 6000+300ms (6-10.5 seconds)
            ease: 'Power2',
            onComplete: () => {
              blob.destroy();
            }
          });
        });
      }
      
      interactWithObject(object) {
        // Handle interaction with objects like crates, gold drops, etc.
        if (object.sprite && object.sprite.texture && object.sprite.texture.key === 'gold_drop') {
          // Collect gold
          this.goldCount += object.amount;
          if (this.goldText) this.goldText.setText(`Gold: ${this.goldCount}`);
          
          // Remove from drops array
          const index = this.goldDrops.indexOf(object);
          if (index > -1) {
            this.goldDrops.splice(index, 1);
          }
          
          // Destroy sprite and text
          if (object.sprite) object.sprite.destroy();
          if (object.amountText) object.amountText.destroy();
          
          // Show collection message
          const { x, y } = this.getIsoPos(object.tileX, object.tileY);
          const collectText = this.add.text(x, y - 60, `+${object.amount} Gold`, {
            font: 'bold 16px Arial',
            fill: '#ffd700',
            stroke: '#000',
            strokeThickness: 2
          }).setOrigin(0.5).setDepth(100);
          
          this.tweens.add({
            targets: collectText,
            y: y - 90,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => collectText.destroy()
          });
        }
        else if (object.sprite && object.sprite.texture && object.sprite.texture.key.startsWith('gem_')) {
          // Collect gem
          const gemType = object.item;
          console.log('Collecting gem:', gemType, 'Current counts before:', { blue: this.blueGemCount, green: this.greenGemCount, red: this.redGemCount });
          
          if (gemType === 'blueGem') this.blueGemCount++;
          else if (gemType === 'greenGem') this.greenGemCount++;
          else if (gemType === 'redGem') this.redGemCount++;
          
          console.log('Gem counts after collection:', { blue: this.blueGemCount, green: this.greenGemCount, red: this.redGemCount });
          
          // Update gem display
          this.updateGemDisplay();
          
          // Remove from drops array
          const index = this.goldDrops.indexOf(object);
          if (index > -1) {
            this.goldDrops.splice(index, 1);
          }
          
          // Destroy sprite
          if (object.sprite) object.sprite.destroy();
          
          // Show collection message
          const { x, y } = this.getIsoPos(object.tileX, object.tileY);
          const collectText = this.add.text(x, y - 60, `+1 ${gemType.replace('Gem', '')} Gem`, {
            font: 'bold 16px Arial',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 2
          }).setOrigin(0.5).setDepth(100);
          
          this.tweens.add({
            targets: collectText,
            y: y - 90,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => collectText.destroy()
          });
        }
        else if (object.sprite && object.sprite.texture && object.sprite.texture.key === 'crate') {
          // Break crate
          this.breakCrate(object);
        }
      }
      
      // Cleanup when scene is destroyed
      shutdown() {
        // Auto-save cleanup removed
        this.closeSaveMenu();
      }
      
      // Old purchaseItem method removed - now using purchaseItemQuantity with quantity menu
    }

    // Register scenes and set StartMenu as the initial scene
    const config = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: gameRef.current,
      scene: [StartMenu, Highscores, CharacterSelect, IsoScene],
      physics: { default: 'arcade' },
      backgroundColor: '#000',
      pixelArt: true,
    };
    console.log('Creating Phaser game with config:', config);
    phaserRef.current = new Phaser.Game(config);
    console.log('Phaser game created successfully!');
    
    // Add scene tracking
    phaserRef.current.events.on('scenechange', (fromScene, toScene) => {
      setCurrentScene(toScene);
    });
    
    return () => {
      phaserRef.current && phaserRef.current.destroy(true);
      phaserRef.current = null;
    };
  }, [armedModeProp, onToggleArmed]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default IsoGame; 