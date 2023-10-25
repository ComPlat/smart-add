/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

// TODO: TreeView needs to be able to group files in correct folders
const constructTree = (files: ExtendedFile[]): Record<string, any> => {
  const fileTree: Record<string, any> = {}

  files.forEach((file, index) => {
    const dataIndex = `child${index + 1}`
    fileTree[dataIndex] = {
      children: [],
      data: file.name,
      fileData: file,
      index: dataIndex,
    }
  })

  fileTree.root = {
    children: Object.keys(fileTree).filter((key) => key !== 'root'),
    data: 'Root item',
    index: 'root',
    isFolder: true,
  }

  return fileTree
}

const TreeView = () => {
  const files: ExtendedFile[] | undefined = useLiveQuery(() =>
    filesDB.files.toArray(),
  )

  if (!files) {
    return <div>Loading...</div>
  }

  const fileTree = constructTree(files)

  return (
    <>
      <p>Tree View:</p>
      <UncontrolledTreeEnvironment
        dataProvider={
          new StaticTreeDataProvider(fileTree, (item, data) => ({
            ...item,
            data,
          }))
        }
        getItemTitle={(item) => item.data}
        viewState={{}}
      >
        <Tree rootItem="root" treeId="tree-1" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </>
  )
}

export { TreeView }
