import { ExtendedFile } from '@/database/db'
import { generateMd5Checksum } from '@/helper/cryptographicTools'
import { v4 } from 'uuid'

import { attachmentTemplate } from './templates'
import {
  Attachment as AttachmentSchemaType,
  Container as ContainerSchemaType,
  attachmentSchema,
} from './zodSchemes'

interface AttachmentParams {
  assignedFiles: ExtendedFile[]
  container: ContainerSchemaType
  currentDate: string
  uidMap: Record<string, string>
}

export const Attachment = async ({
  assignedFiles,
  container,
  currentDate,
  uidMap,
}: AttachmentParams): Promise<AttachmentSchemaType> => {
  const attachmentPromises = assignedFiles.map(async (file) => {
    const attachableId =
      Object.entries(container).find(
        ([key, container]) =>
          key === uidMap[file.parentUid] &&
          container.container_type === 'dataset',
      )?.[0] || ''

    const attachmentId = v4()
    const filename = file.file.name
    const identifier = file.name.split('.')[0]
    const fileType = file.file.type
    const attachableType = 'Container'
    const checksum = await generateMd5Checksum(file.file)
    const key = file.uid
    const filesize = file.file.size

    const attachmentData = {
      id: `2/${identifier}`,
      metadata: {
        filename: `${key}${file.extension && `.${file.extension}`}`,
        md5: checksum,
        mime_type: fileType,
        size: filesize,
      },
      storage: 'store',
    }

    const attachment = {
      [attachmentId]: {
        ...attachmentSchema.parse({
          ...attachmentTemplate,
          aasm_state: 'non_jcamp',
          attachable_id: attachableId,
          attachable_type: attachableType,
          attachment_data: attachmentData,
          checksum,
          con_state: 9,
          content_type: fileType,
          created_at: currentDate,
          created_by: '345c87e6-88a0-440a-a9c8-dcc78cc3f85b',
          created_for: '345c87e6-88a0-440a-a9c8-dcc78cc3f85b',
          edit_state: 0,
          filename,
          filesize,
          identifier,
          key,
          updated_at: currentDate,
        }),
      },
    }

    return attachment
  })

  const attachments = await Promise.all(attachmentPromises)

  return attachments.reduce((resultAttachment, attachment) => {
    return Object.entries(attachment).reduce(
      (prevAttachment, [key, value]) => ({
        ...prevAttachment,
        [key]: value,
      }),
      resultAttachment,
    )
  }, {} as AttachmentSchemaType)
}
