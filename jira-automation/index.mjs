#!/usr/bin/env node

import {createGitHubIssue, lookupRepo} from "./github.mjs";
import {CNP_FILTER, addJiraLabel, searchForIssuesToMigrate} from "./jira.mjs";
import {addAreaLabels} from "./utils.mjs";

import {assertCredentialsPresent} from "./utils.mjs";

assertCredentialsPresent()

/**
 * Process issues by filter id
 * @returns {Promise<void>}
 */
async function processIssues() {
    const {id, labels} = await lookupRepo()
    await processIssuesByFilterId(id, labels, CNP_FILTER)
    console.log('All processing complete')
}

/**
 * Process issues by filter id. Adds the relevant labels to the issue, creates a GitHub issue
 * and also adds a label to the Jira issue to indicate that it has been processed and now on the roadmap.
 * @param id
 * @param labels
 * @param filterId
 * @returns {Promise<void>}
 */
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
