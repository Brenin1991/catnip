import { useState, useEffect } from 'react';

const defaultPrivacySettings = {
  blockTrackers: true,
  blockAds: true,
  blockFingerprinting: true,
  httpsOnly: false,
  blockThirdPartyCookies: true,
  blockThirdPartyScripts: false,
  clearDataOnExit: true,
  doNotTrack: true,
  disableWebGL: false,
  disableCanvas: false,
  disableWebAudio: false,
  disableNotifications: true,
  disableGeolocation: true
};

export function usePrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState(defaultPrivacySettings);

  const loadSettings = async () => {
    try {
      if (window.electronAPI) {
        const settings = await window.electronAPI.getPrivacySettings();
        setPrivacySettings(settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (settings) => {
    try {
      if (window.electronAPI) {
        const saved = await window.electronAPI.setPrivacySettings(settings);
        setPrivacySettings(saved);
        return saved;
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  };

  const clearAllData = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.clearAllData();
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    privacySettings,
    loadSettings,
    saveSettings,
    clearAllData
  };
}

