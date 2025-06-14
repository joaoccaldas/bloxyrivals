// landingPage-simple.js - Simplified version without complex imports
console.log('🚀 Simple landing page script loading...');

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Setting up simple button handlers...');
  
  // Get button elements
  const btnStart = document.getElementById('btnStart');
  const btnLoad = document.getElementById('btnLoad');
  const btnRivals = document.getElementById('btnRivals');
  const btnShop = document.getElementById('btnShop');
  const btnGameMode = document.getElementById('btnGameMode');
  const inputName = document.getElementById('playerName');

  console.log('Button elements check:', {
    btnStart: btnStart ? '✓' : '✗',
    btnLoad: btnLoad ? '✓' : '✗',
    btnRivals: btnRivals ? '✓' : '✗',
    btnShop: btnShop ? '✓' : '✗',
    btnGameMode: btnGameMode ? '✓' : '✗',
    inputName: inputName ? '✓' : '✗'
  });

  // Simple button handlers
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      console.log('✅ Start Game clicked!');
      const playerName = inputName ? inputName.value.trim() || 'Player' : 'Player';
      alert(`Starting new game for ${playerName}!\n\nGame will be implemented with full module system.`);
    });
  }

  if (btnLoad) {
    btnLoad.addEventListener('click', () => {
      console.log('✅ Load Game clicked!');
      alert('Load saved game functionality coming soon!');
    });
  }

  if (btnRivals) {
    btnRivals.addEventListener('click', () => {
      console.log('✅ Rivals (Character Selection) clicked!');
      alert('Character selection screen coming soon!');
    });
  }

  if (btnShop) {
    btnShop.addEventListener('click', () => {
      console.log('✅ Shop clicked!');
      alert('Welcome to the Shop!\n\nShop features coming soon:\n• Character skins\n• Weapons\n• Power-ups\n• Special abilities');
    });
  }

  if (btnGameMode) {
    btnGameMode.addEventListener('click', () => {
      console.log('✅ Game Mode clicked!');
      alert('Game mode selection coming soon!\n\nModes will include:\n• Time-based\n• Survival\n• Boss rush');
    });
  }

  // Allow ESC to close any alerts/modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      console.log('ESC pressed');
    }
  });
});

// Listen for the custom event from videoLoader
document.addEventListener('landingScreenReady', () => {
  console.log('🎬 Landing screen is ready and visible!');
});
