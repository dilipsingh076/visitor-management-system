/**
 * Web entry - runs at localhost:8081
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppWeb from './AppWeb';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<AppWeb />);
}
