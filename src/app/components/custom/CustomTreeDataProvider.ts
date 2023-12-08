import {
  Disposable,
  ExplicitDataSource,
  TreeDataProvider,
  TreeItem,
  TreeItemIndex,
} from 'react-complex-tree'

import { EventEmitter } from './EventEmitter'

export class CustomTreeDataProvider<T> implements TreeDataProvider {
  private data: ExplicitDataSource

  private onDidChangeTreeDataEmitter = new EventEmitter<TreeItemIndex[]>()

  private setItemName: (item: TreeItem<T>, newName: string) => TreeItem<T>

  constructor(
    items: Record<TreeItemIndex, TreeItem<T>>,
    setItemName: (item: TreeItem<T>, newName: string) => TreeItem<T>,
  ) {
    this.data = { items }
    this.setItemName = setItemName
  }

  public getTreeItem(itemId: TreeItemIndex): Promise<TreeItem<T>> {
    return Promise.resolve(this.data.items[itemId])
  }

  public onChangeItemChildren(
    itemId: TreeItemIndex,
    newChildren: TreeItemIndex[],
  ): Promise<void> {
    this.data.items[itemId].children = newChildren
    this.onDidChangeTreeDataEmitter.emit([itemId])
    return Promise.resolve()
  }

  public onDidChangeTreeData(
    listener: (changedItemIds: TreeItemIndex[]) => void,
  ): Disposable {
    const handlerId = this.onDidChangeTreeDataEmitter.on((payload) =>
      listener(payload),
    )
    return { dispose: () => this.onDidChangeTreeDataEmitter.off(handlerId) }
  }

  public onRenameItem(item: TreeItem<T>, name: string): Promise<void> {
    if (this.setItemName) {
      this.data.items[item.index] = this.setItemName(item, name)
    }
    return Promise.resolve()
  }
}
