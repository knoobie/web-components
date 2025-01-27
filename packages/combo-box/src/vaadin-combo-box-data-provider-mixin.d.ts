/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

export type ComboBoxDataProviderCallback<TItem> = (items: Array<TItem>, size: number) => void;

export interface ComboBoxDataProviderParams {
  page: number;
  pageSize: number;
  filter: string;
}

export type ComboBoxDataProvider<TItem> = (
  params: ComboBoxDataProviderParams,
  callback: ComboBoxDataProviderCallback<TItem>
) => void;

declare function ComboBoxDataProviderMixin<TItem, T extends new (...args: any[]) => {}>(
  base: T
): T & ComboBoxDataProviderMixinConstructor<TItem>;

interface ComboBoxDataProviderMixinConstructor<TItem> {
  new (...args: any[]): ComboBoxDataProviderMixin<TItem>;
}

interface ComboBoxDataProviderMixin<TItem> {
  /**
   * Number of items fetched at a time from the dataprovider.
   * @attr {number} page-size
   */
  pageSize: number;

  /**
   * Total number of items.
   */
  size: number | undefined;

  /**
   * Function that provides items lazily. Receives arguments `params`, `callback`
   *
   * `params.page` Requested page index
   *
   * `params.pageSize` Current page size
   *
   * `params.filter` Currently applied filter
   *
   * `callback(items, size)` Callback function with arguments:
   *   - `items` Current page of items
   *   - `size` Total number of items.
   */
  dataProvider: ComboBoxDataProvider<TItem> | null | undefined;

  /**
   * Clears the cached pages and reloads data from dataprovider when needed.
   */
  clearCache(): void;
}

export { ComboBoxDataProviderMixin, ComboBoxDataProviderMixinConstructor };
