import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { registerStyles, css, unsafeCSS } from '../register-styles.js';
import { ThemableMixin } from '../vaadin-themable-mixin.js';

let attachedInstances = [];

function define(customElementName) {
  customElements.define(
    customElementName,
    class extends ThemableMixin(PolymerElement) {
      static get is() {
        return customElementName;
      }

      static get template() {
        return html`foo`;
      }
    }
  );
}

function defineAndInstantiate(customElementName) {
  define(customElementName);

  const instance = document.createElement(customElementName);
  document.body.appendChild(instance);
  attachedInstances.push(instance);
  return instance;
}

afterEach(() => {
  attachedInstances.forEach((instance) => {
    document.body.removeChild(instance);
  });
  attachedInstances = [];
});

describe('registerStyles', () => {
  let styles;

  let testId = 0;

  function unique(seed = 'bar') {
    return `foo-${testId}-${seed}`;
  }

  before(() => {
    styles = css`
      :host {
        color: rgb(255, 0, 0);
      }
    `;
  });

  beforeEach(() => {
    testId++;
  });

  it('should add theme for a component', () => {
    registerStyles(unique(), styles);

    const instance = defineAndInstantiate(unique());
    expect(getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
  });

  it('should add multiple themes for a component', () => {
    registerStyles(unique(), [
      styles,
      css`
        :host {
          background-color: rgb(0, 255, 0);
        }
      `
    ]);

    const instance = defineAndInstantiate(unique());
    expect(getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
    expect(getComputedStyle(instance).backgroundColor).to.equal('rgb(0, 255, 0)');
  });

  it('should add unsafe css for a component', () => {
    const unsafe = `:host {
      color: rgb(255, 0, 0);
    }`;
    registerStyles(unique(), unsafeCSS(unsafe));

    const instance = defineAndInstantiate(unique());
    expect(getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
  });

  it('should interpolate numbers in the template literal', () => {
    registerStyles(
      unique(),
      css`
        :host {
          color: rgb(${255}, 0, 0);
        }
      `
    );

    const instance = defineAndInstantiate(unique());
    expect(getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
  });

  it('should throw if strings are interpolated in the literal', () => {
    expect(() => {
      css`
        :host {
          color: rgb(${'255'}, 0, 0);
        }
      `;
    }).to.throw(Error);
  });

  describe('style module support', () => {
    it('should add theme for a component and register with specified module id', () => {
      registerStyles(
        undefined,
        css`
          :host {
            color: rgb(255, 0, 0);
          }
        `,
        { moduleId: unique('id') }
      );

      registerStyles(unique('component'), undefined, { include: [unique('id')] });

      const instance = defineAndInstantiate(unique('component'));
      expect(getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
    });

    it('should include style modules before the component styles', () => {
      registerStyles(
        undefined,
        css`
          :host {
            color: rgb(255, 0, 0);
          }
        `,
        { moduleId: unique('id') }
      );

      registerStyles(
        unique('component'),
        css`
          :host {
            color: rgb(0, 0, 255);
          }
        `,
        { include: [unique('id')] }
      );

      const instance = defineAndInstantiate(unique('component'));
      expect(getComputedStyle(instance).color).to.equal('rgb(0, 0, 255)');
    });

    it('should not include duplicate styles', () => {
      registerStyles(undefined, css``, { moduleId: unique('id') });

      const duplicateStyle = css`
        :host {
          color: rgb(255, 0, 0);
        }
      `;
      // Need to use both moduleId and include to verify the fix in style-modules -adapter
      registerStyles(unique('component'), duplicateStyle, { include: [unique('id')], moduleId: unique('id2') });

      const instance = defineAndInstantiate(unique('component'));
      // Get all the styles from the component as one big string (let's assume it may have multiple style tags)
      const styles = [...instance.shadowRoot.querySelectorAll('style')].map((style) => style.textContent).join('');
      // Check the number of occurences of the style rule
      const occurrences = styles.split(duplicateStyle.toString()).length - 1;
      // There should be only one occurence
      expect(occurrences).to.equal(1);
    });

    describe('warnings', () => {
      beforeEach(() => {
        sinon.stub(console, 'warn');
      });

      afterEach(() => {
        console.warn.restore();
      });

      it('should warn about registering the style too late', () => {
        defineAndInstantiate(unique());

        registerStyles(unique(), styles);

        expect(console.warn.called).to.be.true;
      });

      it('should not warn about registering the style too late', () => {
        registerStyles(unique(), styles);

        expect(console.warn.called).to.be.false;
      });

      it('should not warn about registering the style too late 2', () => {
        define(unique());
        registerStyles(unique(), styles);

        expect(console.warn.called).to.be.false;
      });
    });
  });
});
