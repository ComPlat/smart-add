import React, { useState, useEffect } from 'react'
import { TreeSelect, Spin } from 'antd'
import { formatLabel } from '@/helper/utils'

interface OntologyItem {
  title: string
  value: string
  is_enabled?: boolean
  selectable?: boolean
  id?: number
  children: OntologyItem[]
}

interface OntologyData {
  ols_terms: OntologyItem[]
}

interface TreeSelectFieldProps {
  value?: string
  onChange?: (value: string) => void
  ontologyType: 'reaction' | 'analysis'
  placeholder?: string
  readonly?: boolean
  name?: string
}

// Cache for ontology data
const ontologyCache = new Map<string, any[]>()

// Transform ontology data (simplified)
const transformOntologyData = (data: OntologyItem[]): any[] => {
  const usedKeys = new Set<string>()

  const transform = (items: OntologyItem[]): any[] => {
    return items
      .filter((item) => item.selectable !== false)
      .map((item) => {
        // Create unique key for duplicates
        let uniqueKey = item.value
        let counter = 1
        while (usedKeys.has(uniqueKey)) {
          uniqueKey = `${item.value}__${counter}`
          counter++
        }
        usedKeys.add(uniqueKey)

        return {
          title: item.title,
          value: item.value,
          key: uniqueKey,
          children:
            item.children?.length > 0 ? transform(item.children) : undefined,
          disabled: item.is_enabled === false,
        }
      })
  }

  return transform(data)
}

// Load ontology data
const loadOntologyData = async (
  ontologyType: 'reaction' | 'analysis',
): Promise<any[]> => {
  if (ontologyCache.has(ontologyType)) {
    return ontologyCache.get(ontologyType)!
  }

  const fileName = ontologyType === 'reaction' ? 'rxno.json' : 'chmo.json'
  const response = await fetch(`/data/ontologies/${fileName}`)

  if (!response.ok) {
    throw new Error(`Failed to load ${fileName}`)
  }

  const data: OntologyData = await response.json()
  const transformedData = transformOntologyData(data.ols_terms)
  ontologyCache.set(ontologyType, transformedData)
  return transformedData
}

// Simple filter function
const filterTreeNode = (input: string, child: any): boolean => {
  const searchText =
    child.title?.toLowerCase() || child.value?.toLowerCase() || ''
  return searchText.includes(input?.toLowerCase() || '')
}

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

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await loadOntologyData(ontologyType)
        if (mounted) {
          setTreeData(data)
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load ontology data',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [ontologyType])

  const handleChange = (selectedValue: string) => {
    if (onChange && !readonly) {
      onChange(selectedValue || '')
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

  const onthologyLabel = name
    ? formatLabel(name) === 'Kind'
      ? 'Type Ontology(CHMO)'
      : formatLabel(name)
    : undefined

  return (
    <label className="flex flex-col text-sm">
      {onthologyLabel && <p className="font-bold">{onthologyLabel}</p>}
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
