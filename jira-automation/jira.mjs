import JiraApi from "jira-client";

const jira = new JiraApi({
    protocol: 'https',
    host: 'tools.hmcts.net/jira',
    bearer: process.env.JIRA_API_TOKEN,
    apiVersion: '2',
    strictSSL: true
});

export const CNP_FILTER = 61018
export const CRIME_FILTER = 63814

export async function addJiraLabel(jiraKey) {
    try {
        await jira.updateIssue(jiraKey, {
            update: {
                labels: [{
                    add: 'on-roadmap'
                }]
            }
        })
    } catch (err) {
        console.log("Error updating help request description in jira", err)
    }
}

export async function searchForIssueToMigrate({key}) {
    const jqlQuery = `filter = 61018 AND key = ${key}`
    try {
        return await jira.searchJira(
            jqlQuery,
            {
                fields: ['summary', 'labels']
            }
        )
    } catch (err) {
        console.log("Error searching for issues in jira", err)
        return {
            issues: []
        }
    }
}

export async function getIssue({key}) {
    return await jira.getIssue(
        key,
        {
            fields: ['summary', 'labels', 'description']
        }
    )
}


/**
 * Searches for all issues in based on the existing filter id in Jira.
 * Default value is the HMCTS DTSPO filter if one is not provided
 *
 * @param filterId Jira filter id
 * @returns {Promise<{issues: *[]}|JiraApi.JsonResponse>}
 */
export async function searchForIssuesToMigrate(filterId= CNP_FILTER) {
    const jqlQuery = `filter = ${filterId}`
    try {
        return await jira.searchJira(
            jqlQuery,
            {
                fields: ['summary', 'labels']
            }
        )
    } catch (err) {
        console.log("Error searching for issues in jira", err)
        return {
            issues: []
        }
    }
}
