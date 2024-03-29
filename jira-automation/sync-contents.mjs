#!/usr/bin/env node

import {findIssueNumberFromJiraKey, updateGitHubIssue} from "./github.mjs";
import {getIssue} from "./jira.mjs";
import { assertCredentialsPresent } from "./utils.mjs";

import {extractPrioritisationTotalScore, jiraToGitHub} from "./jira-to-github-processing.mjs";

const issueKey = process.env.JIRA_ISSUE_KEY

if (!issueKey) {
    console.error('JIRA_ISSUE_KEY environment variable not set')
    process.exit(1)
}

assertCredentialsPresent()

async function processIssues() {
    const { issueId } = await findIssueNumberFromJiraKey({issueKey})

    let issue
    try {
        issue = await getIssue({key: issueKey})
    } catch (err) {
        console.log("Error searching for issue in jira", issueKey, err)

        process.exit(1)
    }

    console.log("Processing issue", issue.key, issue.fields.summary)

    const converted = jiraToGitHub({
        issueId: issue.key,
        content: issue.fields.description
    })

    console.log(converted)

    console.log("Extracting issue score", issue.key, issue.fields.summary)
    const score = extractPrioritisationTotalScore(converted)

    await updateGitHubIssue({
        issueId,
        title: issue.fields.summary,
        body: converted,
        score: score
    })
}

await processIssues()
