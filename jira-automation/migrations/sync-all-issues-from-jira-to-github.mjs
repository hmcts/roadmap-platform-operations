#!/usr/bin/env node

import { Octokit } from "@octokit/rest";
import {jiraToGitHub} from "../jira-to-github-processing.mjs"
import { getIssue } from "../jira.mjs";
import { updateGitHubIssue } from "../github.mjs";

const token = process.env.GITHUB_TOKEN || process.env.GITHUB_REPO_TOKEN;


// Create an Octokit instance with your GitHub personal access token
const octokit = new Octokit({
  auth: token
});

// Fetch all open issues from the repository
async function getOpenIssues() {
  const response = await octokit.paginate(octokit.issues.listForRepo, {
    owner: "hmcts",
    repo: "roadmap-platform-operations",
    state: "open",
  });

  // return response;
  return response;
}

async function run() {
  const issues = await getOpenIssues();

  console.log('Found', issues.length, 'issues')

  for (const issue of issues) {

    console.log('Processing', issue.title)
    const regexResult = issue.body?.match(/DTSPO-\d+/)
    if (!regexResult) {
      // normally tech debt issues
      console.log('No DTSPO Jira issue found, skipping')
      continue
    }
    const issueKey = regexResult[0]

    console.log('Fetching Jira', issueKey);

    let jiraIssue
    try {
      jiraIssue = await getIssue({ key: issueKey })
    } catch (err) {
      console.log("Error searching for issue in jira", issueKey, err)

      process.exit(1)
    }

    const converted = jiraToGitHub({
      issueId: jiraIssue.key,
      content: jiraIssue.fields.description
  })

  await updateGitHubIssue({
    issueId: issue.node_id,
    title: jiraIssue.fields.summary,
    body: converted
})


  }
}

await run()
