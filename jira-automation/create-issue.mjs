#!/usr/bin/env node

import {createGitHubIssue, lookupRepo} from "./github.mjs";
import {addJiraLabel, searchForIssueToMigrate} from "./jira.mjs";

const issueKey = process.env.JIRA_ISSUE_KEY

if (!issueKey) {
    console.error('JIRA_ISSUE_KEY environment variable not set')
    process.exit(1)
}

async function processIssues() {
    const { id, labels } = await lookupRepo()

    const results = await searchForIssueToMigrate({key: issueKey})
    console.log('Found', results.issues.length, 'issue to migrate')

    for (const issue of results.issues) {
        console.log("Processing issue", issue.key, issue.fields.summary)
        await createGitHubIssue(id, issue, labels)
        await addJiraLabel(issue.key)
    }

    console.log('Processing complete')

}

await processIssues()
