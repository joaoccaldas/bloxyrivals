// landingPage.js

import { Game } from '../core/game.js';
import { GameRefactored } from './GameRefactored.js';
import { GameOverScreen } from './gameOverScreen.js';
import { MenuSystem } from './menuSystem.js';
import { Rivals } from './rivals.js';
import { ProfileSystem } from './profileSystem.js';
// import { RankingSystem } from '../systems/RankingSystem.js'; // Removed to avoid duplicate instantiation
import { RankingDisplay } from './RankingDisplay.js';

// Configuration to toggle between original and refactored systems
const USE_REFACTORED_SYSTEM = false; // Set to true to use the new modular system

// Global variables
let canvas, landing, btnStart, btnRivals, btnShop, btnGameMode, btnProfile;
let game = null;
let menu = null;
let rivalsUI = null;
let gameModeSelector = null;
let profileSystem = null;
let selectedCharacterId = 0;
let selectedGameMode = 'time_based'; // Default game mode
const canvasId = 'gameCanvas'; // Make canvasId global so it can be used in all functions

// Initialize DOM elements and event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Landing page initializing...');
    // Get DOM elements
  canvas = document.getElementById(canvasId);
  landing = document.getElementById('landingScreen');
  btnStart = document.getElementById('btnStart');
  btnRivals = document.getElementById('btnRivals');  btnShop = document.getElementById('btnShop');
  btnGameMode = document.getElementById('btnGameMode');
  btnProfile = document.getElementById('btnProfile');
  // Check if all required elements exist
  console.log('🔍 DOM Elements check:', {
    canvas: canvas ? '✓' : '✗',
    landing: landing ? '✓' : '✗',
    btnStart: btnStart ? '✓' : '✗',
    btnRivals: btnRivals ? '✓' : '✗',
    btnShop: btnShop ? '✓' : '✗',
    btnGameMode: btnGameMode ? '✓' : '✗',
    btnProfile: btnProfile ? '✓' : '✗'
  });  if (!canvas || !landing || !btnStart || !btnRivals || !btnShop) {
    console.error('❌ Required elements not found!');
    throw new Error('Required elements #gameCanvas, #landingScreen, #btnStart, #btnRivals, or #btnShop not found');
  }
  // Setup button event listeners
  btnStart.addEventListener('click', () => {
    console.log('✅ Start Game clicked!');
    startGame();
  });
  
  // Load game button has been removed
  
  btnRivals.addEventListener('click', () => {
    console.log('✅ Rivals clicked!');
    showRivals();
  });
  
  btnShop.addEventListener('click', (e) => {
    console.log('✅ Shop clicked!');
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    showShop();
  });
  if (btnGameMode) {
    btnGameMode.addEventListener('click', () => {
      console.log('✅ Game Mode clicked!');
      showGameMode();
    });
  }
  
  if (btnProfile) {
    btnProfile.addEventListener('click', () => {
      console.log('✅ Profile clicked!');
      showProfile();
    });
  }
  console.log('🎮 Button event listeners attached successfully!');
    // Listen for exit to menu events from the game
  document.addEventListener('game:exitToMenu', () => {
    console.log('🚪 Received exit to menu event');
    handleExitToMenu();
  });
    // Create a global function that can be called directly if event-based approach fails
  window.handleExitToMenu = function() {
    console.log('🏠 Handling exit to menu...');
    
    // Clean up game instance
    if (game) {
      console.log('🗑️ Cleaning up game instance...');
      if (typeof game.destroy === 'function') {
        game.destroy();
      }
      game = null;
    }
    
    // Clean up menu instance
    if (menu) {
      console.log('🗑️ Cleaning up menu instance...');
      if (typeof menu.destroy === 'function') {
        menu.destroy();
      }
      menu = null;
    }
    
    // Clean up rivals UI if active
    if (rivalsUI) {
      console.log('🗑️ Cleaning up rivals UI...');
      if (typeof rivalsUI.cleanup === 'function') {
        rivalsUI.cleanup();
      }
      rivalsUI = null;
    }
    
    // Show landing page
    showLanding();
    console.log('✅ Successfully returned to main menu');
  };
  
  // Initial setup
  showLanding();
  
  // Initialize ProfileSystem
  initializeProfileSystem();
});

/** Initialize the profile system */
function initializeProfileSystem() {
  console.log('👤 Initializing profile system...');
  try {
    profileSystem = new ProfileSystem(document.getElementById('profileScreen'), {
      onClose: () => {
        console.log('🚪 Profile closed');
      },
      onNameChange: (newName) => {
        console.log('✏️ Name changed to:', newName);
      }
    });
    
    console.log('✅ Profile system initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize profile system:', err);
  }
}

/** Show landing screen */
function showLanding() {
  console.log('🏠 Showing landing screen');
  landing.style.display = 'flex';
  landing.classList.add('visible'); // Add the visible class for proper opacity and interaction
  canvas.style.display = 'none';
}

/** Show game canvas */
function showCanvas() {
  console.log('🎮 Showing game canvas');
  landing.style.display = 'none';
  landing.classList.remove('visible'); // Remove the visible class when hiding
  canvas.style.display = 'block';
}

/** Get player name or default */
function getPlayerName() {
  // Check if we have a saved name in the ProfileSystem
  if (profileSystem) {
    const savedName = profileSystem.getPlayerName();
    if (savedName) {
      return savedName;
    }
  }
  
  // Return default player name
  return 'Player';
}

/** Pause menu overlay */
function startMenu() {
  if (menu) {
    menu.destroy();
    menu = null;
  }
  menu = new MenuSystem(canvas, {
    playerName: getPlayerName(),
    currentCharId: selectedCharacterId,
    onResumeGame: () => {
      menu.destroy();
      menu = null;
      if (game && typeof game.resume === 'function') {
        game.resume();
      }
    },
    onSaveGame: () => {
      if (game) game.save();
    },    onShop: () => {
      console.log('Shop button clicked from menu!');
      showShop();
      menu.destroy();
      menu = null;    },onExitGame: () => {
      console.log('🚪 Exiting to main menu...');
      menu.destroy();
      menu = null;
      if (game) {
        game.exitToMenu();
      } else {
        // Fallback if game is not available - use proper exit handler
        console.log('⚠️ Game instance not available, using direct exit handler');
        handleExitToMenu();
      }
    }
  });
}

/** Start a new game */
function startGame() {
  if (rivalsUI)  { rivalsUI.cleanup();  rivalsUI = null; }
  if (menu)      { menu.destroy();      menu = null; }
  if (game)      { game.destroy();      game = null; }

  showCanvas();
  
  if (USE_REFACTORED_SYSTEM) {
    // Use the new refactored system
    game = new GameRefactored(
      canvasId,
      selectedCharacterId,
      startMenu, // pause callback
      (charId) => { // game over callback
        showGameOverScreen(charId);
      }
    );
  } else {
    // Use the original system
    game = new Game(
      canvasId,
      selectedCharacterId,
      startMenu,
      (charId) => {
        showGameOverScreen(charId);
      }
    );
  }
    // Set the selected game mode before initializing
  if (game && typeof game.setGameMode === 'function') {
    game.setGameMode(selectedGameMode);
    console.log(`🎯 Game mode set to: ${selectedGameMode}`);
  }
    // Start ranking session if this is a time-based mode
  if (selectedGameMode === 'time_based' && game && game.rankingSystem) {
    game.rankingSystem.startSession('time_based', {
      duration: 180, // 3 minutes
      scoringMultiplier: 1.2
    });
    console.log('🏆 Ranking session started for time-based mode');
  }
  
  game.init(false);
}

/** Show rivals (character selection) UI */
function showRivals() {
  if (menu)      { menu.destroy();      menu = null; }
  if (game)      { game.destroy();      game = null; }
  if (rivalsUI)  { rivalsUI.cleanup();  rivalsUI = null; }

  showCanvas();
  rivalsUI = new Rivals(
    canvas,
    (charId) => {
      selectedCharacterId = charId;
      rivalsUI.cleanup();
      rivalsUI = null;
      showLanding();
    },
    () => {
      rivalsUI.cleanup();
      rivalsUI = null;
      showLanding();
    }
  );
}

/** Show shop interface */
async function showShop() {
  console.log('🛒 Opening shop interface...');
  
  try {
    // Dynamic import to avoid blocking initial script load
    const { ShopSystem } = await import('./shopSystem.js');
    console.log('✅ ShopSystem module loaded');
      // Create shop instance if it doesn't exist
    if (!window.shopSystem) {
      console.log('🏪 Creating new ShopSystem instance');
      window.shopSystem = new ShopSystem(document.getElementById('shopScreen'), {
        onClose: () => {
          console.log('🚪 Shop closed');
        },
        onPurchase: (purchaseInfo) => {
          console.log('💰 Purchase made:', purchaseInfo);
          // Could save purchase info to player profile here
        },
        initialCoins: 500 // Give player initial coins to test the shop
      });
    }
    
    // Show the shop
    window.shopSystem.show();
    
  } catch (err) {
    console.error('❌ Failed to load shop:', err);
    alert('Failed to load shop: ' + err.message);
  }
}

/** Show game mode selection */
async function showGameMode() {
  console.log('🎮 Showing game mode selection...');
  
  try {
    // Dynamic import to avoid blocking
    const { GameModeSelector } = await import('./gameModeSelector.js');
    console.log('✅ GameModeSelector module loaded');
    
    if (menu)             { menu.destroy();             menu = null; }
    if (game)             { game.destroy();             game = null; }
    if (rivalsUI)         { rivalsUI.cleanup();         rivalsUI = null; }
    if (gameModeSelector) { gameModeSelector.cleanup(); gameModeSelector = null; }

    showCanvas();
    
    gameModeSelector = new GameModeSelector(
      canvas,
      (selectedMode) => {
        console.log(`🎯 Game mode selected: ${selectedMode}`);
        selectedGameMode = selectedMode;
        gameModeSelector.cleanup();
        gameModeSelector = null;
        showLanding();
        
        // Show confirmation
        alert(`🎮 Game mode set to: ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1).replace('_', ' ')}\n\nYou can now start a new game with this mode!`);
      },
      () => {
        console.log('🔙 Game mode selection cancelled');
        gameModeSelector.cleanup();
        gameModeSelector = null;
        showLanding();
      }
    );
    console.log('✅ Game mode selector initialized');
    
  } catch (err) {
    console.error('❌ Game mode selector failed:', err);
    alert('Failed to load game mode selector: ' + err.message);
  }
}

/** Show profile interface */
async function showProfile() {
  console.log('👤 Opening profile interface...');
  
  try {
    // Initialize ProfileSystem if it doesn't exist
    if (!profileSystem) {
      console.log('👤 Creating new ProfileSystem instance');
      profileSystem = new ProfileSystem(document.getElementById('profileScreen'), {
        onClose: () => {
          console.log('🚪 Profile closed');
        },
        onNameChange: (newName) => {
          console.log('✏️ Name changed to:', newName);
        },
        initialName: 'Player'
      });
    }
    
    // Show the profile
    profileSystem.show();
    
  } catch (err) {
    console.error('❌ Failed to load profile:', err);
    alert('Failed to load profile: ' + err.message);
  }
}

/** Show game over screen with proper statistics */
function showGameOverScreen(selectedCharacterId) {
  if (!game) return;
  
  // Get game statistics
  const finalScore = game.pointSystem ? game.pointSystem.getPoints() : game.score || 0;
  const kills = game.pointSystem ? game.pointSystem.getKills() : game.kills || 0;
  
  // Calculate time survived
  const timeSurvived = game.gameStartTime ? 
    Math.floor((Date.now() - game.gameStartTime) / 1000) : 0;
  
  // Get game mode information
  const gameMode = game.gameModeInterface ? 
    game.gameModeInterface.getResults() : null;
  
  // Get player name from input or use default
  const playerName = getPlayerName();
  
  // Update player statistics in ProfileSystem
  if (profileSystem) {
    profileSystem.updateStats({
      score: finalScore,
      kills: kills
    });
  }
  
  // Check if this was a time-based mode to show ranking screen
  const isTimeBased = gameMode && gameMode.type === 'time_based';
  
  if (isTimeBased) {
    // For time-based modes, use the ranking system
    console.log('🏆 Time-based mode completed, showing ranking screen...');
    
    // End the ranking session with final stats
    const finalStats = {
      score: finalScore,
      kills,
      timeSurvived,
      damageDealt: gameMode.stats?.damageDealt || 0,
      damageTaken: gameMode.stats?.damageTaken || 0,
      powerUpsCollected: gameMode.stats?.powerUpsCollected || 0,
      bossesDefeated: gameMode.stats?.bossesDefeated || 0
    };
    
    const rankingResults = rankingSystem.endSession(finalStats);
    
    if (rankingResults) {
      // Create and display ranking screen
      const rankingDisplay = new RankingDisplay('gameContainer');
      rankingDisplay.setRankingSystem(rankingSystem);
      rankingDisplay.setGameMode('time_based');
      rankingDisplay.displayResults(rankingResults);
      
      // Store the results for sharing
      rankingDisplay.lastResults = rankingResults;        // Listen for ranking events
      window.addEventListener('ranking:playAgain', () => {
        selectedGameMode = 'time_based';
        startGame();
      });
      
      window.addEventListener('ranking:backToMenu', () => {
        showLanding();
      });
    } else {
      console.warn('❌ Ranking session failed to end properly');
      // Fallback to regular game over screen
      showRegularGameOverScreen();
    }
  } else {
    showRegularGameOverScreen();
  }
  function showRegularGameOverScreen() {
    // For other modes, use the regular game over screen
    console.log('💀 Game over, showing regular game over screen...');
    
    // Determine if player won the battle
    let playerWon = false;
    
    // Check various victory conditions
    if (gameMode) {
      // Team battle victory
      if (gameMode.type === 'team_battle' && gameMode.teamBattle) {
        playerWon = gameMode.teamBattle.winner === 'player';
      }
      // Time-based survival victory (if they survived the full duration)
      else if (gameMode.type === 'time_based' && timeSurvived >= (gameMode.duration || 180)) {
        playerWon = true;
      }
      // Boss battle victory (if they defeated a boss)
      else if (gameMode.stats?.bossesDefeated > 0) {
        playerWon = true;
      }
      // High performance victory (exceptional scores)
      else if (kills >= 20 || finalScore >= 5000) {
        playerWon = true;
      }
    }
    
    // Last enemy standing victory (if all mobs are defeated and player survived)
    if (game && game.mobs && game.mobs.length === 0 && game.player && game.player.health > 0) {
      playerWon = true;
    }
    
    console.log(`🏆 Player victory status: ${playerWon ? 'VICTORY' : 'DEFEAT'}`);
    
    const gameOverScreen = new GameOverScreen(canvas, {
      playerName,
      characterId: selectedCharacterId,
      finalScore,
      kills,
      timeSurvived,
      gameMode,
      playerWon: playerWon, // Add the missing playerWon parameter
      onRestart: () => {
        // Restart with same character and settings
        startGame();
      },      onExit: () => {
        // Return to main menu using proper exit handler
        console.log('🚪 Game over screen exit requested');
        handleExitToMenu();
      },
      onCollectReward: (reward) => {
        // Handle reward collection
        console.log('🎁 Reward collected:', reward);
        // Update profile system or other reward tracking
        if (profileSystem) {
          profileSystem.addReward(reward);
        }
      }
    });
  }
}

// Allow ESC to pause when playing
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && game && game.state === 'playing') {
    startMenu();
  }
});

// Listen for the landing screen ready event from video loader
document.addEventListener('landingScreenReady', () => {
  console.log('🎬 Landing screen is ready and visible!');
});
