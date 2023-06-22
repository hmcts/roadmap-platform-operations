import {createGitHubIssue, lookupRepoId} from "./github.mjs";
import {addJiraLabel, searchForIssuesToMigrate} from "./jira.mjs";

async function processIssues() {
    const repositoryId = await lookupRepoId()

    const results = await searchForIssuesToMigrate()
    console.log('Found', results.issues.length, 'issue(s) to migrate')

    for (const issue of results.issues) {
        console.log("Processing issue", issue.key, issue.fields.summary)
        await createGitHubIssue(repositoryId, issue)
        await addJiraLabel(issue.key)
    }

    console.log('Processing complete')

}

await processIssues()
