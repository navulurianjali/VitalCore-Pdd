import { Platform } from 'react-native';

/**
 * Injects CSS rules into the Web DOM head to eliminate browser-native focus outlines,
 * thick black selection boxes, native appearance overrides, and webkit autofill backgrounds.
 * Ensures inputs match modern apps like Instagram, WhatsApp, and Google Fit.
 */
export function injectWebInputStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const styleId = 'vitalcore-web-input-resets';
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* 1. Global Reset for Input, Textarea, Select & ContentEditable Elements */
    input, textarea, select, [contenteditable], [role="textbox"], .r-textInput {
      outline: none !important;
      outline-style: none !important;
      outline-width: 0 !important;
      outline-color: transparent !important;
      box-shadow: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      -webkit-tap-highlight-color: transparent !important;
      background-clip: padding-box !important;
    }

    /* 2. Remove default focus ring & black outline in Chrome, Edge, Firefox, Safari */
    input:focus, textarea:focus, select:focus, [contenteditable]:focus, [role="textbox"]:focus,
    input:focus-visible, textarea:focus-visible, select:focus-visible, [contenteditable]:focus-visible,
    input:active, textarea:active, input:hover {
      outline: none !important;
      outline-style: none !important;
      outline-width: 0 !important;
      outline-color: transparent !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }

    /* 3. Disable WebKit Autofill ugly pale background color */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active,
    textarea:-webkit-autofill,
    textarea:-webkit-autofill:hover,
    textarea:-webkit-autofill:focus,
    textarea:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
      -webkit-text-fill-color: inherit !important;
      transition: background-color 50000s ease-in-out 0s !important;
      background-color: transparent !important;
    }

    /* 4. Refined text selection color */
    ::selection {
      background-color: rgba(13, 148, 136, 0.25) !important;
      color: inherit !important;
    }
  `;
  document.head.appendChild(style);
}
