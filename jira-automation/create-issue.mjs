#!/usr/bin/env node

import {createGitHubIssue, lookupRepo} from "./github.mjs";
import {addJiraLabel, searchForIssueToMigrate} from "./jira.mjs";
import { addAreaLabels, assertCredentialsPresent } from "./utils.mjs";

const issueKey = process.env.JIRA_ISSUE_KEY

if (!issueKey) {
    console.error('JIRA_ISSUE_KEY environment variable not set')
    process.exit(1)
}

assertCredentialsPresent()

async function processIssues() {
    const { id, labels } = await lookupRepo()

    const results = await searchForIssueToMigrate({key: issueKey})
    console.log('Found', results.issues.length, 'issue to migrate')

    for (const issue of results.issues) {
        console.log("Processing issue", issue.key, issue.fields.summary)
        const labelsToAdd = addAreaLabels(issue)
        await createGitHubIssue(id, issue, labels, labelsToAdd)
        await addJiraLabel(issue.key)
    }

    console.log('Processing complete')

}

await processIssues()
