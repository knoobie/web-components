import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { html, render } from 'lit';

import '../vaadin-overlay.js';

describe('lit', () => {
  describe('renderer', () => {
    let overlay;

    beforeEach(() => {
      overlay = fixtureSync(`<vaadin-overlay></vaadin-overlay>`);
      overlay.opened = true;
      overlay.renderer = (root) => {
        render(html`Initial Content`, root);
      };
    });

    it('should render the content', () => {
      expect(overlay.textContent).to.equal('Initial Content');
    });

    it('should render new content after assigning a new renderer', () => {
      overlay.renderer = (root) => {
        render(html`New Content`, root);
      };

      expect(overlay.textContent).to.equal('New Content');
    });
  });
});
