#!/usr/bin/env node

import {createGitHubIssue, lookupRepo} from "./github.mjs";
import {addJiraLabel, searchForIssuesToMigrate} from "./jira.mjs";

async function processIssues() {
    const { id, labels } = await lookupRepo()

    const results = await searchForIssuesToMigrate()
    console.log('Found', results.issues.length, 'issue(s) to migrate')

    for (const issue of results.issues) {
        console.log("Processing issue", issue.key, issue.fields.summary)
        await createGitHubIssue(id, issue, labels)
        await addJiraLabel(issue.key)
    }

    console.log('Processing complete')

}

await processIssues()
