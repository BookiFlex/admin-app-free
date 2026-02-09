/**
 * Shoelace components bundle for BookiFlex
 *
 * This file imports all Shoelace components used in the admin interface
 * and exports the setBasePath function for runtime configuration.
 */

// Base path configuration utility
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// Shoelace light theme CSS
import '@shoelace-style/shoelace/dist/themes/light.css';

// Components used in BookiFlex admin
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';

// Export setBasePath for runtime configuration of icon paths
export { setBasePath };

/**
 * Initialize Shoelace with the base path from BookiFlex configuration
 * Should be called early in the application lifecycle
 */
export function initShoelace() {
  const basePath = window.BookiFlex?.shoelaceBasePath;
  if (basePath) {
    setBasePath(basePath);
  }
}