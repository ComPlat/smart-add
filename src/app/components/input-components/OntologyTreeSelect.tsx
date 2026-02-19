import React, { useState, useEffect } from 'react'
import { TreeSelect, Spin } from 'antd'
import { formatLabel } from '@/helper/utils'

interface OntologyItem {
  title: string
  value: string
  is_enabled?: boolean
  selectable?: boolean
  id?: number
  children?: OntologyItem[]
}

interface TreeSelectFieldProps {
  value?: string
  onChange?: (value: string) => void
  ontologyType: 'reaction' | 'analysis'
  placeholder?: string
  readonly?: boolean
  name?: string
}

const RECENTLY_SELECTED_MAX = 10
const RECENT_PREFIX = '__recent__'
const ONTOLOGY_LABELS: Record<string, string> = {
  Kind: 'Type (Chemicals Method Ontology - CHMO)',
  Rxno: 'Type (Name Reaction Ontology - RXNO)',
}

// Raw JSON cache — fetched once per type, never invalidated
const rawDataCache = new Map<string, OntologyItem[]>()

const getRecentlySelected = (ontologyType: string): OntologyItem[] => {
  try {
    const stored = localStorage.getItem(`ontology_recent_${ontologyType}`)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const addRecentlySelected = (ontologyType: string, item: OntologyItem) => {
  const current = getRecentlySelected(ontologyType)
  if (current.find((i) => i.value === item.value)) return
  const updated = [item, ...current].slice(0, RECENTLY_SELECTED_MAX)
  try {
    localStorage.setItem(
      `ontology_recent_${ontologyType}`,
      JSON.stringify(updated),
    )
  } catch {}
}

const transformOntologyData = (
  data: OntologyItem[],
  ontologyType: string,
): any[] => {
  const usedKeys = new Set<string>()

  const transform = (items: OntologyItem[]): any[] =>
    items
      .map((item) => {
        if (item.selectable === false) {
          if (item.title !== '-- Recently selected --') return null
          const recent = getRecentlySelected(ontologyType)
          if (recent.length === 0) return null
          return {
            title: item.title,
            value: item.value,
            key: '__recently_selected__',
            children: recent.map((r) => ({
              title: r.title,
              value: `${RECENT_PREFIX}${r.value}`,
              key: `${RECENT_PREFIX}${r.value}`,
            })),
          }
        }

        let uniqueKey = item.value
        let counter = 1
        while (usedKeys.has(uniqueKey))
          uniqueKey = `${item.value}__${counter++}`
        usedKeys.add(uniqueKey)

        return {
          title: item.title,
          value: item.value,
          key: uniqueKey,
          children: item.children?.length
            ? transform(item.children)
            : undefined,
          disabled: item.is_enabled === false,
        }
      })
      .filter(Boolean)

  return transform(data)
}

const loadOntologyData = async (
  ontologyType: 'reaction' | 'analysis',
): Promise<any[]> => {
  if (!rawDataCache.has(ontologyType)) {
    const fileName = ontologyType === 'reaction' ? 'rxno.json' : 'chmo.json'
    const response = await fetch(`/data/ontologies/${fileName}`)
    if (!response.ok) throw new Error(`Failed to load ${fileName}`)
    const { ols_terms } = await response.json()
    rawDataCache.set(ontologyType, ols_terms)
  }
  return transformOntologyData(rawDataCache.get(ontologyType)!, ontologyType)
}

const findInTree = (nodes: any[], value: string): any => {
  for (const node of nodes) {
    if (node.value === value) return node
    if (node.children) {
      const found = findInTree(node.children, value)
      if (found) return found
    }
  }
  return null
}

const filterTreeNode = (input: string, child: any): boolean =>
  (child.title?.toLowerCase() ?? '').includes(input?.toLowerCase() ?? '')

const OntologyTreeSelect: React.FC<TreeSelectFieldProps> = ({
  value,
  onChange,
  ontologyType,
  placeholder = 'Select ontology term',
  readonly = false,
  name,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [treeData, setTreeData] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    loadOntologyData(ontologyType)
      .then((data) => {
        if (mounted) setTreeData(data)
      })
      .catch((err) => {
        if (mounted)
          setError(
            err instanceof Error ? err.message : 'Failed to load ontology data',
          )
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [ontologyType])

  const handleChange = (selectedValue: string) => {
    if (readonly) return
    const cleanValue = selectedValue?.startsWith(RECENT_PREFIX)
      ? selectedValue.slice(RECENT_PREFIX.length)
      : selectedValue
    if (!cleanValue || cleanValue === 'recently selected') return

    onChange?.(cleanValue)

    const fromRecent = getRecentlySelected(ontologyType).find(
      (r) => r.value === cleanValue,
    )
    const title = fromRecent?.title ?? findInTree(treeData, cleanValue)?.title
    if (title) {
      addRecentlySelected(ontologyType, { title, value: cleanValue })
      setTreeData(
        transformOntologyData(rawDataCache.get(ontologyType)!, ontologyType),
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Spin size="small" className="mr-2" />
        <span className="text-gray-500">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-2 text-red-500 bg-red-50 rounded border text-sm">
        Error: {error}
      </div>
    )
  }

  const ontologyLabel = name ? ONTOLOGY_LABELS[formatLabel(name)] : undefined

  return (
    <label className="flex flex-col text-sm">
      {ontologyLabel && <p className="font-bold mb-2">{ontologyLabel}</p>}
      <TreeSelect
        style={{ width: '100%' }}
        value={value || undefined}
        onChange={handleChange}
        treeData={treeData}
        placeholder={placeholder}
        showSearch
        filterTreeNode={filterTreeNode}
        disabled={readonly || loading}
        allowClear
        treeDefaultExpandAll={false}
      />
    </label>
  )
}

export default OntologyTreeSelect
