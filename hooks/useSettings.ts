"use client";
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';


export function useSettings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [autoSave, setAutoSave] = useState<boolean>(false);
  const [vim, setVim] = useState<boolean>(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleAutoSave = () => {
    setAutoSave((prev) => !prev);
  };

  const toggleVim = () => {
    setVim((prev) => !prev);
  };

  const getSettings = async () => {
    axios.get('/api/settings')
      .then((response) => {
        const { autosaveOn, vimOn } = response.data;
        setAutoSave(autosaveOn);
        setVim(vimOn);
      })
      .catch((error: AxiosError) => {
        console.error('Error fetching settings:', error.response?.data || error.message);
      });
  }

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  const setSettings = async (
    settings: {
      autoSave?: boolean;
      vim?: boolean;
    }
  ) => {
    axios.put('/api/settings', settings)
      .then((response) => {
        const { autosaveOn, vimOn } = response.data;
        setAutoSave(autosaveOn);
        setVim(vimOn);
      })
      .catch((error: AxiosError) => {
        console.error('Error updating settings:', error.response?.data || error.message);
      });
  }

  return {
    autoSave,
    setAutoSave: toggleAutoSave,
    vim,
    setVim: toggleVim,
    getSettings,
    setSettings,
  };
}
