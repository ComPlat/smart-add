import { ExtendedFile, ExtendedFolder, Metadata, filesDB } from '@/database/db'
import { useEffect, useState } from 'react'
import { validateMolFile, validateSMILES } from '../utils/molValidation'

interface UseMolValidationProps {
  item: ExtendedFile | ExtendedFolder | null
  database: { files: ExtendedFile[]; folders: ExtendedFolder[] } | undefined
}

export const useMolValidation = ({ item, database }: UseMolValidationProps) => {
  const [isMolValid, setIsMolValid] = useState(false)
  const [prevMolValid, setPrevMolValid] = useState(false)

  useEffect(() => {
    const checkMolFileValidity = async () => {
      // First check if the current item has a molfile
      if (
        item?.metadata?.molfile &&
        typeof item.metadata.molfile === 'string'
      ) {
        const isValid = validateMolFile(item.metadata.molfile)
        setIsMolValid(isValid)
        return
      }

      // Check if the current item has a cano_smiles
      if (
        item?.metadata?.cano_smiles &&
        typeof item.metadata.cano_smiles === 'string'
      ) {
        const isValid = validateSMILES(item.metadata.cano_smiles)
        setIsMolValid(isValid)
        return
      }

      // If current item doesn't have molfile or cano_smiles, check if it's a sample with a molecule child
      if (item?.fullPath && database?.folders) {
        const moleculeChild = database.folders.find(
          (folder) =>
            folder.fullPath?.startsWith(item.fullPath + '/') &&
            folder.dtype === 'molecule',
        )

        if (
          moleculeChild?.metadata?.molfile &&
          typeof moleculeChild.metadata.molfile === 'string'
        ) {
          const isValid = validateMolFile(moleculeChild.metadata.molfile)
          setIsMolValid(isValid)

          // If molfile just became valid (wasn't valid before), set decoupled to false
          if (
            isValid &&
            !prevMolValid &&
            (item as ExtendedFolder).dtype === 'sample'
          ) {
            setPrevMolValid(true)
            await filesDB.folders
              .where({ fullPath: item.fullPath })
              .modify((folder) => {
                folder.metadata = {
                  ...folder.metadata,
                  decoupled: false,
                } as Metadata
              })
          } else if (isValid) {
            setPrevMolValid(true)
          }
          return
        }

        if (
          moleculeChild?.metadata?.cano_smiles &&
          typeof moleculeChild.metadata.cano_smiles === 'string'
        ) {
          const isValid = validateSMILES(moleculeChild.metadata.cano_smiles)
          setIsMolValid(isValid)

          // If cano_smiles just became valid (wasn't valid before), set decoupled to false
          if (
            isValid &&
            !prevMolValid &&
            (item as ExtendedFolder).dtype === 'sample'
          ) {
            setPrevMolValid(true)
            await filesDB.folders
              .where({ fullPath: item.fullPath })
              .modify((folder) => {
                folder.metadata = {
                  ...folder.metadata,
                  decoupled: false,
                } as Metadata
              })
          } else if (isValid) {
            setPrevMolValid(true)
          }
          return
        }
      }

      // No valid molfile or cano_smiles found - set decoupled to true if it's a sample
      setIsMolValid(false)
      setPrevMolValid(false)
      if (
        item?.fullPath &&
        (item as ExtendedFolder).dtype === 'sample' &&
        item.metadata?.decoupled !== true
      ) {
        await filesDB.folders
          .where({ fullPath: item.fullPath })
          .modify((folder) => {
            folder.metadata = {
              ...folder.metadata,
              decoupled: true,
            } as Metadata
          })
      }
    }

    checkMolFileValidity()
  }, [item, database])

  return { isMolValid, setIsMolValid }
}
