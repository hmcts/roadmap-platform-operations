import assert from 'node:assert';
import {describe, it} from 'node:test'

import {isCnpIssue, addAreaLabels, isInitiative, isEpic} from '../utils.mjs'


describe('Utility functions', t => {
    it('should return true if cnp Jira issue', t => {
        const issueId = 'DTSPO-123'
        const result = isCnpIssue(issueId)
        assert.equal(result, true)
    })

    it('should return false if not cnp Jira issue', t => {
        const issueId = 'EI-123'
        const result = isCnpIssue(issueId)
        assert.equal(result, false)
    })

    it('should return the correct cnp label', t => {
        const issue = {
            key: 'DTSPO-123',
            fields: {
                labels: [],
                issuetype: {
                    name: 'Any'
                }
            }
        }
        const result = addAreaLabels(issue)
        assert.deepStrictEqual(result, ["CNP"])
    })

    it('should return true is the correct issue type for Initiative', () => {
        const issue = {
            fields: {
                issuetype: {
                    name: 'Initiative'
                }
            }
        }
        const result = isInitiative(issue)
        assert.equal(result, true)
    })

    it('should return false is the correct issue type for Epic', () => {
        const issue = {
            fields: {
                issuetype: {
                    name: 'Epic'
                }
            }
        }
        const result = isEpic(issue)
        assert.equal(result, true)
    })

    it('should fail if no issuetype', () => {
        const issue = {
            fields: {
                issuetype: {
                    id: null
                }
            }
        }
        const result = isInitiative(issue)
        assert.equal(result, false)
    })

})
