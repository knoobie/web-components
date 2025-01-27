/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin.js';
import { SlotMixin } from '@vaadin/component-base/src/slot-mixin.js';
import { processTemplates } from '@vaadin/component-base/src/templates.js';
import { DelegateFocusMixin } from '@vaadin/field-base/src/delegate-focus-mixin.js';
import { FieldMixin } from '@vaadin/field-base/src/field-mixin.js';
import { fieldShared } from '@vaadin/field-base/src/styles/field-shared-styles.js';
import { inputFieldContainer } from '@vaadin/field-base/src/styles/input-field-container-styles.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/input-container/src/vaadin-input-container.js';
import './vaadin-select-overlay.js';
import './vaadin-select-value-button.js';

registerStyles('vaadin-select', [fieldShared, inputFieldContainer], { moduleId: 'vaadin-select-styles' });

/**
 * `<vaadin-select>` is a Web Component for selecting values from a list of items.
 *
 * ### Rendering
 *
 * The content of the select can be populated by using the renderer callback function.
 *
 * The renderer function provides `root`, `select` arguments.
 * Generate DOM content, append it to the `root` element and control the state
 * of the host element by accessing `select`.
 *
 * ```html
 * <vaadin-select id="select"></vaadin-select>
 * ```
 * ```js
 * const select = document.querySelector('#select');
 * select.renderer = function(root, select) {
 *   const listBox = document.createElement('vaadin-list-box');
 *   // append 3 <vaadin-item> elements
 *   ['Jose', 'Manolo', 'Pedro'].forEach(function(name) {
 *     const item = document.createElement('vaadin-item');
 *     item.textContent = name;
 *     item.setAttribute('label', name)
 *     listBox.appendChild(item);
 *   });
 *
 *   // update the content
 *   root.appendChild(listBox);
 * };
 * ```
 *
 * Renderer is called on initialization of new select and on its opening.
 * DOM generated during the renderer call can be reused
 * in the next renderer call and will be provided with the `root` argument.
 * On first call it will be empty.
 *
 * * Hint: By setting the `label` property of inner vaadin-items you will
 * be able to change the visual representation of the selected value in the input part.
 *
 * ### Styling
 *
 * The following custom properties are available for styling:
 *
 * Custom property                    | Description                  | Target element          | Default
 * -----------------------------------|------------------------------|----------------------------------
 * `--vaadin-field-default-width`     | Default width of the field   | :host                   | `12em`
 * `--vaadin-select-text-field-width` | Effective width of the field | `vaadin-select-overlay` |
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `toggle-button` | The toggle button
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `opened`     | Set when the select is open | :host
 * `invalid`    | Set when the element is invalid | :host
 * `focused`    | Set when the element is focused | :host
 * `focus-ring` | Set when the element is keyboard focused | :host
 * `readonly`   | Set when the select is read only | :host
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * ### Internal components
 *
 * In addition to `<vaadin-select>` itself, the following internal
 * components are themable:
 *
 * - `<vaadin-select-overlay>` - has the same API as [`<vaadin-overlay>`](#/elements/vaadin-overlay).
 *
 * Note: the `theme` attribute value set on `<vaadin-select>` is
 * propagated to the internal components listed above.
 *
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} opened-changed - Fired when the `opened` property changes.
 * @fires {CustomEvent} value-changed - Fired when the `value` property changes.
 *
 * @extends HTMLElement
 * @mixes ElementMixin
 * @mixes ThemableMixin
 * @mixes SlotMixin
 * @mixes FieldMixin
 * @mixes DelegateFocusMixin
 */
class Select extends DelegateFocusMixin(FieldMixin(SlotMixin(ElementMixin(ThemableMixin(PolymerElement))))) {
  static get is() {
    return 'vaadin-select';
  }

  static get template() {
    return html`
      <style>
        ::slotted([slot='value']) {
          flex-grow: 1;
          background-color: transparent;
        }
      </style>

      <div class="vaadin-select-container">
        <div part="label" on-click="_onClick">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[theme]]"
          on-click="_onClick"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="value"></slot>
          <div part="toggle-button" slot="suffix"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <vaadin-select-overlay
        position-target="[[_inputContainer]]"
        opened="{{opened}}"
        with-backdrop="[[_phone]]"
        phone$="[[_phone]]"
        theme$="[[theme]]"
      ></vaadin-select-overlay>

      <iron-media-query query="[[_phoneMediaQuery]]" query-matches="{{_phone}}"></iron-media-query>
    `;
  }

  static get properties() {
    return {
      /**
       * Set when the select is open
       * @type {boolean}
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '_openedChanged'
      },

      /**
       * Custom function for rendering the content of the `<vaadin-select>`.
       * Receives two arguments:
       *
       * - `root` The `<vaadin-select-overlay>` internal container
       *   DOM element. Append your content to it.
       * - `select` The reference to the `<vaadin-select>` element.
       * @type {!SelectRenderer | undefined}
       */
      renderer: Function,

      /**
       * It stores the the `value` property of the selected item, providing the
       * value for iron-form.
       * When there’s an item selected, it's the value of that item, otherwise
       * it's an empty string.
       * On change or initialization, the component finds the item which matches the
       * value and displays it.
       * If no value is provided to the component, it selects the first item without
       * value or empty value.
       * Hint: If you do not want to select any item by default, you can either set all
       * the values of inner vaadin-items, or set the vaadin-select value to
       * an inexistent value in the items list.
       * @type {string}
       */
      value: {
        type: String,
        value: '',
        notify: true,
        observer: '_valueChanged'
      },

      /**
       * The name of this element.
       */
      name: {
        type: String
      },

      /**
       * A hint to the user of what can be entered in the control.
       * The placeholder will be displayed in the case that there
       * is no item selected, or the selected item has an empty
       * string label, or the selected item has no label and it's
       * DOM content is empty.
       */
      placeholder: {
        type: String
      },

      /**
       * When present, it specifies that the element is read-only.
       * @type {boolean}
       */
      readonly: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /** @private */
      _phone: Boolean,

      /** @private */
      _phoneMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      },

      /** @private */
      _overlayElement: Object,

      /** @private */
      _inputElement: Object,

      /** @private */
      _inputContainer: Object,

      /** @private */
      _items: Object
    };
  }

  static get observers() {
    return [
      '_updateAriaExpanded(opened)',
      '_updateAriaRequired(required)',
      '_updateSelectedItem(value, _items, placeholder)',
      '_rendererChanged(renderer, _overlayElement)'
    ];
  }

  /** @protected */
  get slots() {
    return {
      ...super.slots,
      value: () => {
        const button = document.createElement('vaadin-select-value-button');
        button.setAttribute('aria-haspopup', 'listbox');
        return button;
      }
    };
  }

  /** @protected */
  get _valueButton() {
    return this._getDirectSlotChild('value');
  }

  constructor() {
    super();

    // Ensure every instance has unique ID
    const uniqueId = (Select._uniqueSelectId = 1 + Select._uniqueSelectId || 0);
    this._fieldId = `${this.localName}-${uniqueId}`;

    this._boundOnKeyDown = this._onKeyDown.bind(this);
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();

    if (this._valueButton) {
      this._valueButton.setAttribute('aria-labelledby', `${this._labelId} ${this._fieldId}`);

      this._updateAriaRequired(this.required);
      this._updateAriaExpanded(this.opened);

      this._setFocusElement(this._valueButton);
      this.ariaTarget = this._valueButton;

      this._valueButton.addEventListener('keydown', this._boundOnKeyDown);
    }
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._valueButton) {
      this._valueButton.removeEventListener('keydown', this._boundOnKeyDown);
    }
    // Making sure the select is closed and removed from DOM after detaching the select.
    this.opened = false;
  }

  /** @protected */
  ready() {
    super.ready();

    this._overlayElement = this.shadowRoot.querySelector('vaadin-select-overlay');
    this._inputContainer = this.shadowRoot.querySelector('[part~="input-field"]');

    processTemplates(this);
  }

  /**
   * Requests an update for the content of the select.
   * While performing the update, it invokes the renderer passed in the `renderer` property.
   *
   * It is not guaranteed that the update happens immediately (synchronously) after it is requested.
   */
  requestContentUpdate() {
    this._overlayElement.requestContentUpdate();

    if (this._menuElement && this._menuElement.items) {
      this._updateSelectedItem(this.value, this._menuElement.items);
    }
  }

  /** @private */
  _rendererChanged(renderer, overlay) {
    if (!overlay) {
      return;
    }

    overlay.setProperties({ owner: this, renderer });

    this.requestContentUpdate();

    if (renderer) {
      this._assignMenuElement();
    }
  }

  /** @private */
  _assignMenuElement() {
    this._menuElement = Array.from(this._overlayElement.content.children).find(
      (element) => element.localName !== 'style'
    );

    if (this._menuElement) {
      this._menuElement.addEventListener('items-changed', () => {
        this._items = this._menuElement.items;
        this._items.forEach((item) => item.setAttribute('role', 'option'));
      });
      this._menuElement.addEventListener('selected-changed', () => this.__updateValueButton());
      this._menuElement.addEventListener('keydown', (e) => this._onKeyDownInside(e));
      this._menuElement.addEventListener(
        'click',
        () => {
          this.__userInteraction = true;
          this.opened = false;
        },
        true
      );

      this._menuElement.setAttribute('role', 'listbox');
    }
  }

  /** @private */
  _valueChanged(value, oldValue) {
    this.toggleAttribute('has-value', Boolean(value));

    // Skip validation for the initial empty string value
    if (value === '' && oldValue === undefined) {
      return;
    }
    this.validate();
  }

  /**
   * Opens the overlay if the field is not read-only.
   *
   * @private
   */
  _onClick() {
    this.opened = !this.readonly;
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDown(e) {
    if (!this.readonly && !this.opened) {
      if (/^(Enter|SpaceBar|\s|ArrowDown|Down|ArrowUp|Up)$/.test(e.key)) {
        e.preventDefault();
        this.opened = true;
      } else if (/[\p{L}\p{Nd}]/u.test(e.key) && e.key.length === 1) {
        const selected = this._menuElement.selected;
        const currentIdx = selected !== undefined ? selected : -1;
        const newIdx = this._menuElement._searchKey(currentIdx, e.key);
        if (newIdx >= 0) {
          this.__userInteraction = true;
          this._updateSelectedItem(this._items[newIdx].value, this._items);
        }
      }
    }
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDownInside(e) {
    if (/^(Tab)$/.test(e.key)) {
      this.opened = false;
    }
  }

  /** @private */
  _openedChanged(opened, wasOpened) {
    if (opened) {
      if (!this._overlayElement || !this._menuElement || !this.focusElement || this.disabled || this.readonly) {
        this.opened = false;
        return;
      }

      this._overlayElement.style.setProperty(
        '--vaadin-select-text-field-width',
        this._inputContainer.offsetWidth + 'px'
      );

      // Preserve focus-ring to restore it later
      const hasFocusRing = this.hasAttribute('focus-ring');
      this._openedWithFocusRing = hasFocusRing;

      // Opened select should not keep focus-ring
      if (hasFocusRing) {
        this.removeAttribute('focus-ring');
      }

      this._menuElement.focus();
    } else if (wasOpened) {
      if (this._phone) {
        this._setFocused(false);
      } else {
        this.focus();
        if (this._openedWithFocusRing) {
          this.setAttribute('focus-ring', '');
        }
      }
      this.validate();
    }
  }

  /** @private */
  _updateAriaExpanded(opened) {
    if (this._valueButton) {
      this._valueButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    }
  }

  /** @private */
  _updateAriaRequired(required) {
    if (this._valueButton) {
      this._valueButton.setAttribute('aria-required', required ? 'true' : 'false');
    }
  }

  /** @private */
  __attachSelectedItem(selected) {
    let labelItem;

    const label = selected.getAttribute('label');
    if (label) {
      labelItem = this.__createItem(label);
    } else {
      labelItem = selected.cloneNode(true);
    }

    // store reference to the original item
    labelItem._sourceItem = selected;

    this.__appendItem(labelItem);

    // ensure the item gets proper styles
    labelItem.selected = true;
  }

  /** @private */
  __createItem(text) {
    const item = document.createElement('vaadin-item');
    item.textContent = text;
    return item;
  }

  /** @private */
  __appendItem(item) {
    item.removeAttribute('tabindex');
    item.removeAttribute('role');
    item.setAttribute('id', this._fieldId);

    this._valueButton.appendChild(item);
  }

  /** @private */
  __updateValueButton() {
    if (!this._valueButton) {
      return;
    }

    this._valueButton.innerHTML = '';

    const selected = this._items[this._menuElement.selected];

    this._valueButton.removeAttribute('placeholder');

    if (!selected) {
      if (this.placeholder) {
        const item = this.__createItem(this.placeholder);
        this.__appendItem(item);
        this._valueButton.setAttribute('placeholder', '');
      }
    } else {
      this.__attachSelectedItem(selected);

      if (!this._valueChanging) {
        this._selectedChanging = true;
        this.value = selected.value || '';
        if (this.__userInteraction) {
          this.opened = false;
          this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
          this.__userInteraction = false;
        }
        delete this._selectedChanging;
      }
    }
  }

  /** @private */
  _updateSelectedItem(value, items) {
    if (items) {
      this._menuElement.selected = items.reduce((prev, item, idx) => {
        return prev === undefined && item.value === value ? idx : prev;
      }, undefined);
      if (!this._selectedChanging) {
        this._valueChanging = true;
        this.__updateValueButton();
        delete this._valueChanging;
      }
    }
  }

  /**
   * Override method inherited from `FocusMixin` to not remove focused
   * state when select is opened and focus moves to list-box.
   * @return {boolean}
   * @protected
   * @override
   */
  _shouldRemoveFocus() {
    return !this.opened;
  }

  /**
   * Override method inherited from `FocusMixin` to validate on blur.
   * @param {boolean} focused
   * @protected
   * @override
   */
  _setFocused(focused) {
    super._setFocused(focused);

    if (!focused) {
      this.validate();
    }
  }

  /**
   * Returns true if `value` is valid, and sets the `invalid` flag appropriately.
   *
   * @return {boolean} True if the value is valid and sets the `invalid` flag appropriately
   */
  validate() {
    return !(this.invalid = !(this.disabled || !this.required || this.value));
  }

  /**
   * Fired when the user commits a value change.
   *
   * @event change
   */
}

customElements.define(Select.is, Select);

export { Select };
