import React from 'react';
import { createRoot } from 'react-dom/client';
import TripleTriadLite from './TripleTriadLite';

/**
 * Web component wrapper that exposes the Triple\u00a0Triad Lite game as
 * <triad-widget>. When the custom element is attached to the DOM it
 * mounts a React root inside an isolated shadow DOM, preventing
 * surrounding styles from leaking in. When detached, it unmounts
 * the React tree.
 */
class TriadWidgetElement extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;
  connectedCallback() {
    // Only initialise once
    if (this.root) return;
    const shadow = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.appendChild(container);
    // Basic reset styles to ensure predictable layout
    const style = document.createElement('style');
    style.textContent = `:host { display: block; }`;
    shadow.appendChild(style);
    this.root = createRoot(container);
    this.root.render(<TripleTriadLite />);
  }
  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

// Define the custom element if it hasn't been registered already.
if (!customElements.get('triad-widget')) {
  customElements.define('triad-widget', TriadWidgetElement);
}
