import assert from 'node:assert';
import {describe, it} from 'node:test'

import {isCnpIssue, addAreaLabels} from '../utils.mjs'


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

})
