/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { GridColumn } from '@vaadin/grid/src/vaadin-grid-column.js';

/**
 * `<vaadin-crud-edit-column>` is a helper element for the `<vaadin-grid>`
 * that provides a clickable and themable edit icon.
 *
 * Typical usage is in a custom `<vaadin-grid>` inside a `<vaadin-crud>`.
 *
 * #### Example:
 * ```html
 * <vaadin-grid items="[[items]]">
 *  <vaadin-crud-edit-column></vaadin-crud-edit-column>
 *
 *  <vaadin-grid-column>
 *    ...
 * ```
 */
declare class CrudEditColumn extends GridColumn {
  /**
   * The arial-label for the edit button
   */
  ariaLabel: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'vaadin-crud-edit-column': CrudEditColumn;
  }
}

export { CrudEditColumn };
