#!/usr/bin/env node

const issueKey = process.env.JIRA_ISSUE_KEY

if (!issueKey) {
    console.error('JIRA_ISSUE_KEY environment variable not set')
    process.exit(1)
}

import {setInProgress} from "./github.mjs";

console.log('Updating status to in progress for', issueKey)

await setInProgress({
    issueKey
})

console.log('Processing complete')
