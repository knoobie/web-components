/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { DisableUpgradeMixin } from '@polymer/polymer/lib/mixins/disable-upgrade-mixin.js';
import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay.js';
import { PositionMixin } from '@vaadin/vaadin-overlay/src/vaadin-overlay-position-mixin.js';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import { datePickerOverlayStyles } from './vaadin-date-picker-styles.js';

registerStyles('vaadin-date-picker-overlay', datePickerOverlayStyles, {
  moduleId: 'vaadin-date-picker-overlay-styles'
});

/**
 * An element used internally by `<vaadin-date-picker>`. Not intended to be used separately.
 *
 * @extends OverlayElement
 * @private
 */
class DatePickerOverlay extends DisableUpgradeMixin(PositionMixin(OverlayElement)) {
  static get is() {
    return 'vaadin-date-picker-overlay';
  }
}

customElements.define(DatePickerOverlay.is, DatePickerOverlay);
