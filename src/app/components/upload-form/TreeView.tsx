'use client'

import { filesDB } from '@/database/db'
import { constructTree } from '@/helper/constructTree'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

const TreeView = () => {
  const files = useLiveQuery(() => filesDB.files.toArray(), [])

  if (!files) {
    return <div>Loading...</div>
  }

  const fileTree = constructTree(files)

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(fileTree, (item, data) => ({
          ...item,
          data,
        }))
      }
      canDragAndDrop
      canDropOnFolder
      canDropOnNonFolder
      canReorderItems
      getItemTitle={(item) => item.data}
      key={files.length}
      viewState={{}}
    >
      <Tree rootItem="root" treeId="tree-1" treeLabel="Tree Example" />
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
