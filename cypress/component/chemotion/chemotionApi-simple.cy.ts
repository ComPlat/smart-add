import { chemotionApi, ChemotionUploadResponse } from '../../../src/services/chemotionApi'

describe('ChemotionApiService - Essential Tests', () => {
  beforeEach(() => {
    chemotionApi.clearSession()
  })

  describe('Session Management', () => {
    it('should start with no authentication', () => {
      expect(chemotionApi.isAuthenticated()).to.be.false
    })

    it('should clear session data', () => {
      chemotionApi.clearSession()
      expect(chemotionApi.isAuthenticated()).to.be.false
    })
  })

  describe('Upload Without Authentication', () => {
    it('should fail upload when not authenticated', () => {
      const blob = new Blob(['test'], { type: 'application/zip' })
      cy.wrap(chemotionApi.uploadToChemotion(blob, 'test.zip'))
        .then(result => result as ChemotionUploadResponse)
        .then((result) => {
          expect(result.success).to.be.false
          expect(result.message).to.equal('Not authenticated')
        })
    })
  })

  describe('Error Messages', () => {
    it('should return proper structure for all responses', () => {
      const blob = new Blob(['test'], { type: 'application/zip' })
      cy.wrap(chemotionApi.uploadToChemotion(blob, 'test.zip'))
        .then(result => result as ChemotionUploadResponse)
        .then((result) => {
          expect(result).to.have.property('success')
          expect(result).to.have.property('message')
          expect(typeof result.success).to.equal('boolean')
          expect(typeof result.message).to.equal('string')
        })
    })
  })
})
