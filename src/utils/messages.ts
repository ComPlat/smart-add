import { message } from 'antd'

class MessageService {
  private lastNotificationTime: Record<string, number> = {}
  private readonly THROTTLE_DELAY = 1500 // 1.5 seconds between same notifications

  private show(
    type: 'success' | 'info' | 'warning' | 'error',
    content: string,
    throttleKey?: string,
  ) {
    // Throttle notifications to prevent bombardment
    if (throttleKey) {
      const now = Date.now()
      const lastTime = this.lastNotificationTime[throttleKey] || 0

      if (now - lastTime < this.THROTTLE_DELAY) {
        return // Skip this notification
      }

      this.lastNotificationTime[throttleKey] = now
    }

    // Use antd message instead of notification
    message[type]({
      content,
      duration: 3,
    })
  }

  // Simple success/error/info methods
  success = (content: string) => this.show('success', content)
  error = (content: string) => this.show('error', content)
  warning = (content: string) => this.show('warning', content)
  info = (content: string) => this.show('info', content)

  // Field validation warnings (simplified)
  fieldValidationWarnings = {
    purity: () =>
      this.show('warning', 'Purity value should be between 0 and 1', 'purity'),
    negativeAmount: () =>
      this.show('warning', 'Amount values must be positive', 'negativeAmount'),
    negativeMolarity: () =>
      this.show('warning', 'Molarity must be positive', 'negativeMolarity'),
    negativeDensity: () =>
      this.show('warning', 'Density must be positive', 'negativeDensity'),
    negativeRatio: () =>
      this.show('warning', 'Ratio values must be positive', 'negativeRatio'),
    invalidTemperature: () =>
      this.show(
        'warning',
        'Temperature cannot be below absolute zero',
        'invalidTemperature',
      ),
  }

  // Drag & drop warnings (simplified)
  dragDropWarnings = {
    onlyFilesInExport: () =>
      this.show(
        'error',
        'Only files can be dropped in the Export Files area, not folders.',
        'onlyFilesInExport',
      ),
    onlyInDatasetContainers: () =>
      this.show(
        'error',
        'Items can only be dropped in dataset containers.',
        'onlyInDatasetContainers',
      ),
    noRestrictedFoldersInUpload: () =>
      this.show(
        'error',
        'Restricted folders cannot be moved to upload area.',
        'noRestrictedFoldersInUpload',
      ),
    noReactionInSample: () =>
      this.show(
        'error',
        'Reactions cannot be dropped into sample containers.',
        'noReactionInSample',
      ),
    noReactionInReaction: () =>
      this.show(
        'error',
        'Reactions cannot be dropped into other reactions.',
        'noReactionInReaction',
      ),
    analysisOnlyInAnalysesFolder: () =>
      this.show(
        'error',
        'Analyses can only be dropped in the Analyses folder.',
        'analysisOnlyInAnalysesFolder',
      ),
    noSampleInSample: () =>
      this.show(
        'error',
        'Samples cannot be dropped into other samples.',
        'noSampleInSample',
      ),
    datasetOnlyInAnalysis: () =>
      this.show(
        'error',
        'Datasets can only be dropped in analysis containers.',
        'datasetOnlyInAnalysis',
      ),
    invalidDropTarget: () =>
      this.show('error', 'Invalid drop target.', 'invalidDropTarget'),
  }
}

export const messages = new MessageService()
