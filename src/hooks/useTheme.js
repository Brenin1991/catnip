import { useState, useEffect } from 'react';

const defaultTheme = {
  name: 'dark',
  colors: {
    bgPrimary: '#1c1c1e',
    bgSecondary: '#2c2c2e',
    bgTertiary: '#3a3a3c',
    bgHover: '#48484a',
    bgGlass: 'rgba(28, 28, 30, 0.8)',
    textPrimary: '#ffffff',
    textSecondary: '#98989d',
    textTertiary: '#636366',
    accent: '#007aff',
    accentHover: '#5ac8fa',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    danger: '#ff3b30',
    success: '#34c759',
    warning: '#ff9500'
  }
};

const themes = {
  dark: {
    name: 'dark',
    label: 'Dark',
    colors: {
      bgPrimary: '#1c1c1e',
      bgSecondary: '#2c2c2e',
      bgTertiary: '#3a3a3c',
      bgHover: '#48484a',
      bgGlass: 'rgba(28, 28, 30, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#98989d',
      textTertiary: '#636366',
      accent: '#007aff',
      accentHover: '#5ac8fa',
      border: 'rgba(255, 255, 255, 0.1)',
      borderLight: 'rgba(255, 255, 255, 0.05)',
      danger: '#ff3b30',
      success: '#34c759',
      warning: '#ff9500'
    }
  },
  light: {
    name: 'light',
    label: 'Light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f2f2f7',
      bgTertiary: '#e5e5ea',
      bgHover: '#d1d1d6',
      bgGlass: 'rgba(255, 255, 255, 0.9)',
      textPrimary: '#000000',
      textSecondary: '#3a3a3c',
      textTertiary: '#8e8e93',
      accent: '#007aff',
      accentHover: '#0051d5',
      border: 'rgba(0, 0, 0, 0.1)',
      borderLight: 'rgba(0, 0, 0, 0.05)',
      danger: '#ff3b30',
      success: '#34c759',
      warning: '#ff9500'
    }
  },
  blue: {
    name: 'blue',
    label: 'Blue Dark',
    colors: {
      bgPrimary: '#0a1929',
      bgSecondary: '#132f4c',
      bgTertiary: '#1e4976',
      bgHover: '#2a5a8a',
      bgGlass: 'rgba(19, 47, 76, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#b2d4ff',
      textTertiary: '#7aa7e8',
      accent: '#3399ff',
      accentHover: '#5ac8fa',
      border: 'rgba(51, 153, 255, 0.2)',
      borderLight: 'rgba(51, 153, 255, 0.1)',
      danger: '#ff6b6b',
      success: '#51cf66',
      warning: '#ffd43b'
    }
  },
  purple: {
    name: 'purple',
    label: 'Purple Dark',
    colors: {
      bgPrimary: '#1a0d2e',
      bgSecondary: '#2d1b3d',
      bgTertiary: '#3d2a4d',
      bgHover: '#4d395d',
      bgGlass: 'rgba(45, 27, 61, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#d4b3ff',
      textTertiary: '#b88ae6',
      accent: '#a855f7',
      accentHover: '#c084fc',
      border: 'rgba(168, 85, 247, 0.2)',
      borderLight: 'rgba(168, 85, 247, 0.1)',
      danger: '#ff6b6b',
      success: '#51cf66',
      warning: '#ffd43b'
    }
  },
  green: {
    name: 'green',
    label: 'Green Dark',
    colors: {
      bgPrimary: '#0d1f0f',
      bgSecondary: '#1a3e21',
      bgTertiary: '#275d32',
      bgHover: '#347c43',
      bgGlass: 'rgba(13, 31, 15, 0.85)',
      textPrimary: '#ffffff',
      textSecondary: '#b3ffc7',
      textTertiary: '#7ae69a',
      accent: '#22c55e',
      accentHover: '#4ade80',
      border: 'rgba(34, 197, 94, 0.2)',
      borderLight: 'rgba(34, 197, 94, 0.1)',
      danger: '#ff6b6b',
      success: '#51cf66',
      warning: '#ffd43b'
    }
  },
  aeroBlue: {
    name: 'aeroBlue',
    label: 'Aero Blue',
    colors: {
      bgPrimary: '#0a1628',
      bgSecondary: '#1a2f4a',
      bgTertiary: '#2a4a6e',
      bgHover: '#3a5a8e',
      bgGlass: 'rgba(26, 47, 74, 0.5)',
      textPrimary: '#ffffff',
      textSecondary: '#a8d0f0',
      textTertiary: '#7ab0d9',
      accent: '#4da6ff',
      accentHover: '#66b3ff',
      border: 'rgba(77, 166, 255, 0.25)',
      borderLight: 'rgba(77, 166, 255, 0.15)',
      danger: '#ff6b6b',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  aeroPurple: {
    name: 'aeroPurple',
    label: 'Aero Purple',
    colors: {
      bgPrimary: '#1a0d2e',
      bgSecondary: '#2d1b4a',
      bgTertiary: '#3d2a6e',
      bgHover: '#4d3a8e',
      bgGlass: 'rgba(45, 27, 74, 0.5)',
      textPrimary: '#ffffff',
      textSecondary: '#d4b3f0',
      textTertiary: '#b88ae6',
      accent: '#a855f7',
      accentHover: '#c084fc',
      border: 'rgba(168, 85, 247, 0.25)',
      borderLight: 'rgba(168, 85, 247, 0.15)',
      danger: '#ff6b6b',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  aeroGreen: {
    name: 'aeroGreen',
    label: 'Aero Green',
    colors: {
      bgPrimary: '#0d1f15',
      bgSecondary: '#1a3e2a',
      bgTertiary: '#275d3f',
      bgHover: '#347c54',
      bgGlass: 'rgba(26, 62, 42, 0.5)',
      textPrimary: '#ffffff',
      textSecondary: '#b3ffd7',
      textTertiary: '#7ae6a9',
      accent: '#22c55e',
      accentHover: '#4ade80',
      border: 'rgba(34, 197, 94, 0.25)',
      borderLight: 'rgba(34, 197, 94, 0.15)',
      danger: '#ff6b6b',
      success: '#51cf66',
      warning: '#ffd43b'
    }
  },
  aeroOrange: {
    name: 'aeroOrange',
    label: 'Aero Orange',
    colors: {
      bgPrimary: '#1a0d0a',
      bgSecondary: '#2d1f1a',
      bgTertiary: '#3d2f2a',
      bgHover: '#4d3f3a',
      bgGlass: 'rgba(45, 31, 26, 0.5)',
      textPrimary: '#ffffff',
      textSecondary: '#ffd4b3',
      textTertiary: '#ffb88a',
      accent: '#ff6b35',
      accentHover: '#ff8f5c',
      border: 'rgba(255, 107, 53, 0.25)',
      borderLight: 'rgba(255, 107, 53, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  aeroYellow: {
    name: 'aeroYellow',
    label: 'Aero Yellow',
    colors: {
      bgPrimary: '#1a1a0a',
      bgSecondary: '#2d2d1a',
      bgTertiary: '#3d3d2a',
      bgHover: '#4d4d3a',
      bgGlass: 'rgba(45, 45, 26, 0.5)',
      textPrimary: '#ffffff',
      textSecondary: '#fff4b3',
      textTertiary: '#ffe68a',
      accent: '#ffd700',
      accentHover: '#ffed4a',
      border: 'rgba(255, 215, 0, 0.25)',
      borderLight: 'rgba(255, 215, 0, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    colors: {
      bgPrimary: '#1a0a14',
      bgSecondary: '#2d1a28',
      bgTertiary: '#3d2a3c',
      bgHover: '#4d3a50',
      bgGlass: 'rgba(45, 26, 40, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#ffd4e5',
      textTertiary: '#ffb3cc',
      accent: '#ff6b9d',
      accentHover: '#ff8fb3',
      border: 'rgba(255, 107, 157, 0.25)',
      borderLight: 'rgba(255, 107, 157, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    colors: {
      bgPrimary: '#0a1a20',
      bgSecondary: '#1a2f3a',
      bgTertiary: '#2a4f5a',
      bgHover: '#3a6f7a',
      bgGlass: 'rgba(26, 47, 58, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#a8e6f0',
      textTertiary: '#7abfd9',
      accent: '#4dd0e1',
      accentHover: '#66d9e8',
      border: 'rgba(77, 208, 225, 0.25)',
      borderLight: 'rgba(77, 208, 225, 0.15)',
      danger: '#ff6b6b',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    colors: {
      bgPrimary: '#000000',
      bgSecondary: '#0a0a0a',
      bgTertiary: '#1a1a1a',
      bgHover: '#2a2a2a',
      bgGlass: 'rgba(0, 0, 0, 0.85)',
      textPrimary: '#ffffff',
      textSecondary: '#b3b3b3',
      textTertiary: '#808080',
      accent: '#8b5cf6',
      accentHover: '#a78bfa',
      border: 'rgba(139, 92, 246, 0.25)',
      borderLight: 'rgba(139, 92, 246, 0.15)',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    }
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    colors: {
      bgPrimary: '#2e3440',
      bgSecondary: '#3b4252',
      bgTertiary: '#434c5e',
      bgHover: '#4c566a',
      bgGlass: 'rgba(59, 66, 82, 0.85)',
      textPrimary: '#eceff4',
      textSecondary: '#d8dee9',
      textTertiary: '#b0b8c8',
      accent: '#88c0d0',
      accentHover: '#8fbcbb',
      border: 'rgba(136, 192, 208, 0.25)',
      borderLight: 'rgba(136, 192, 208, 0.15)',
      danger: '#bf616a',
      success: '#a3be8c',
      warning: '#ebcb8b'
    }
  },
  dracula: {
    name: 'dracula',
    label: 'Dracula',
    colors: {
      bgPrimary: '#282a36',
      bgSecondary: '#343746',
      bgTertiary: '#44475a',
      bgHover: '#545768',
      bgGlass: 'rgba(52, 55, 70, 0.85)',
      textPrimary: '#f8f8f2',
      textSecondary: '#e0e0e0',
      textTertiary: '#c0c0c0',
      accent: '#bd93f9',
      accentHover: '#c79ef7',
      border: 'rgba(189, 147, 249, 0.25)',
      borderLight: 'rgba(189, 147, 249, 0.15)',
      danger: '#ff5555',
      success: '#50fa7b',
      warning: '#f1fa8c'
    }
  },
  tokyoNight: {
    name: 'tokyoNight',
    label: 'Tokyo Night',
    colors: {
      bgPrimary: '#1a1b26',
      bgSecondary: '#24283b',
      bgTertiary: '#2f3549',
      bgHover: '#3b4257',
      bgGlass: 'rgba(36, 40, 59, 0.85)',
      textPrimary: '#c0caf5',
      textSecondary: '#a9b1d6',
      textTertiary: '#7aa2f7',
      accent: '#7aa2f7',
      accentHover: '#9ab8ff',
      border: 'rgba(122, 162, 247, 0.25)',
      borderLight: 'rgba(122, 162, 247, 0.15)',
      danger: '#f7768e',
      success: '#9ece6a',
      warning: '#e0af68'
    }
  },
  cyberpunk: {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    colors: {
      bgPrimary: '#0d0d0d',
      bgSecondary: '#1a1a2e',
      bgTertiary: '#16213e',
      bgHover: '#0f3460',
      bgGlass: 'rgba(26, 26, 46, 0.85)',
      textPrimary: '#00ff41',
      textSecondary: '#00cc33',
      textTertiary: '#009922',
      accent: '#ff00ff',
      accentHover: '#ff33ff',
      border: 'rgba(255, 0, 255, 0.3)',
      borderLight: 'rgba(255, 0, 255, 0.15)',
      danger: '#ff0040',
      success: '#00ff41',
      warning: '#ffff00'
    }
  },
  monokai: {
    name: 'monokai',
    label: 'Monokai',
    colors: {
      bgPrimary: '#272822',
      bgSecondary: '#3e3d32',
      bgTertiary: '#49483e',
      bgHover: '#575653',
      bgGlass: 'rgba(62, 61, 50, 0.85)',
      textPrimary: '#f8f8f2',
      textSecondary: '#e6db74',
      textTertiary: '#ae81ff',
      accent: '#ae81ff',
      accentHover: '#c9b5ff',
      border: 'rgba(174, 129, 255, 0.25)',
      borderLight: 'rgba(174, 129, 255, 0.15)',
      danger: '#f92672',
      success: '#a6e22e',
      warning: '#fd971f'
    }
  },
  orange: {
    name: 'orange',
    label: 'Orange',
    colors: {
      bgPrimary: '#1a0d0a',
      bgSecondary: '#2d1a14',
      bgTertiary: '#3d2a1e',
      bgHover: '#4d3a2e',
      bgGlass: 'rgba(45, 26, 20, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#ffd4b3',
      textTertiary: '#ffb88a',
      accent: '#ff6b35',
      accentHover: '#ff8f5c',
      border: 'rgba(255, 107, 53, 0.25)',
      borderLight: 'rgba(255, 107, 53, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  yellow: {
    name: 'yellow',
    label: 'Yellow',
    colors: {
      bgPrimary: '#1a1a0a',
      bgSecondary: '#2d2d14',
      bgTertiary: '#3d3d1e',
      bgHover: '#4d4d2e',
      bgGlass: 'rgba(45, 45, 20, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#fff4b3',
      textTertiary: '#ffe68a',
      accent: '#ffd700',
      accentHover: '#ffed4a',
      border: 'rgba(255, 215, 0, 0.25)',
      borderLight: 'rgba(255, 215, 0, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  red: {
    name: 'red',
    label: 'Red Dark',
    colors: {
      bgPrimary: '#1a0a0a',
      bgSecondary: '#2d1414',
      bgTertiary: '#3d1e1e',
      bgHover: '#4d2e2e',
      bgGlass: 'rgba(45, 20, 20, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#ffb3b3',
      textTertiary: '#ff8a8a',
      accent: '#ff4757',
      accentHover: '#ff6b7a',
      border: 'rgba(255, 71, 87, 0.25)',
      borderLight: 'rgba(255, 71, 87, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  pink: {
    name: 'pink',
    label: 'Pink',
    colors: {
      bgPrimary: '#1a0a14',
      bgSecondary: '#2d1428',
      bgTertiary: '#3d1e3c',
      bgHover: '#4d2e4c',
      bgGlass: 'rgba(45, 20, 40, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#ffd4e5',
      textTertiary: '#ffb3cc',
      accent: '#ff6b9d',
      accentHover: '#ff8fb3',
      border: 'rgba(255, 107, 157, 0.25)',
      borderLight: 'rgba(255, 107, 157, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  amber: {
    name: 'amber',
    label: 'Amber',
    colors: {
      bgPrimary: '#1a140a',
      bgSecondary: '#2d2414',
      bgTertiary: '#3d341e',
      bgHover: '#4d442e',
      bgGlass: 'rgba(45, 36, 20, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#ffe8b3',
      textTertiary: '#ffd98a',
      accent: '#ffb800',
      accentHover: '#ffc933',
      border: 'rgba(255, 184, 0, 0.25)',
      borderLight: 'rgba(255, 184, 0, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  teal: {
    name: 'teal',
    label: 'Teal',
    colors: {
      bgPrimary: '#0a141a',
      bgSecondary: '#14282d',
      bgTertiary: '#1e3c3d',
      bgHover: '#2e4c4d',
      bgGlass: 'rgba(20, 40, 45, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#b3ffe8',
      textTertiary: '#8affd9',
      accent: '#20d9d9',
      accentHover: '#40e9e9',
      border: 'rgba(32, 217, 217, 0.25)',
      borderLight: 'rgba(32, 217, 217, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  },
  indigo: {
    name: 'indigo',
    label: 'Indigo',
    colors: {
      bgPrimary: '#0a0d1a',
      bgSecondary: '#14192d',
      bgTertiary: '#1e253d',
      bgHover: '#2e354d',
      bgGlass: 'rgba(20, 25, 45, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#b3c5ff',
      textTertiary: '#8aa3ff',
      accent: '#4f46e5',
      accentHover: '#6366f1',
      border: 'rgba(79, 70, 229, 0.25)',
      borderLight: 'rgba(79, 70, 229, 0.15)',
      danger: '#ff4757',
      success: '#4ade80',
      warning: '#ffd43b'
    }
  }
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Carregar tema salvo do Electron ao iniciar
    const loadTheme = async () => {
      if (window.electronAPI) {
        try {
          const savedTheme = await window.electronAPI.getTheme();
          if (savedTheme && savedTheme.name) {
            setCurrentTheme(savedTheme);
            applyTheme(savedTheme);
          } else {
            applyTheme(defaultTheme);
          }
        } catch (error) {
          console.error('Erro ao carregar tema:', error);
          applyTheme(defaultTheme);
        }
      } else {
        applyTheme(defaultTheme);
      }
      setIsInitialized(true);
    };

    loadTheme();
  }, []);

  useEffect(() => {
    // Aplicar tema quando mudar (após inicialização)
    if (isInitialized) {
      applyTheme(currentTheme);
      
      if (window.electronAPI) {
        window.electronAPI.setTheme(currentTheme);
      }
    }
  }, [currentTheme, isInitialized]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const colors = theme.colors;
    
    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--bg-hover', colors.bgHover);
    root.style.setProperty('--bg-glass', colors.bgGlass || colors.bgSecondary + 'cc');
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-tertiary', colors.textTertiary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--border-light', colors.borderLight);
    root.style.setProperty('--danger', colors.danger);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
    
    // Aplicar classe no body para identificar o tema
    document.body.setAttribute('data-theme', theme.name);
  };

  const changeTheme = (themeName) => {
    const theme = themes[themeName] || defaultTheme;
    setCurrentTheme(theme);
  };

  const getAvailableThemes = () => {
    return Object.values(themes);
  };

  return {
    currentTheme,
    themes: getAvailableThemes(),
    changeTheme,
    applyTheme
  };
}

