#!/usr/bin/env node

import {createGitHubIssue, lookupRepo} from "./github.mjs";
import {CNP_FILTER, addJiraLabel, searchForIssuesToMigrate} from "./jira.mjs";
import {addAreaLabels} from "./utils.mjs";

import {assertCredentialsPresent} from "./utils.mjs";

assertCredentialsPresent()

async function processIssues() {
    const {id, labels} = await lookupRepo()
    const jiraFilter = CNP_FILTER

    await processIssuesByFilterId(id, labels, jiraFilter)

    console.log('All processing complete')
}

async function processIssuesByFilterId(id, labels, filterId) {
    const results = await searchForIssuesToMigrate(filterId)
    console.log('Found', results.issues.length, 'issue(s) to migrate')

    for (const issue of results.issues) {
        console.log("Processing issue", issue.key, issue.fields.summary)
        const labelsToAdd = addAreaLabels(issue)
        await createGitHubIssue(id, issue, labels, labelsToAdd)
        await addJiraLabel(issue.key)
    }

    console.log(`Processing issues for filter (${filterId}) complete.`)
}

await processIssues()
