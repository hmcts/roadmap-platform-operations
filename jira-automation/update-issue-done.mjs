#!/usr/bin/env node

const issueKey = process.env.JIRA_ISSUE_KEY

if (!issueKey) {
    console.error('JIRA_ISSUE_KEY environment variable not set')
    process.exit(1)
}

import {setDone} from "./github.mjs";

console.log('Updating status to done for', issueKey)

await setDone({
    issueKey
})

console.log('Processing complete')
