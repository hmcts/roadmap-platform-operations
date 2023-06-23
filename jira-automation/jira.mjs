import JiraApi from "jira-client";

const jira = new JiraApi({
    protocol: 'https',
    host: 'tools.hmcts.net/jira',
    bearer: process.env.JIRA_API_TOKEN,
    apiVersion: '2',
    strictSSL: true
});


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

export async function searchForIssuesToMigrate() {
    const jqlQuery = 'filter = 61018'
    try {
        return await jira.searchJira(
            jqlQuery,
            {
                fields: ['summary']
            }
        )
    } catch (err) {
        console.log("Error searching for issues in jira", err)
        return {
            issues: []
        }
    }
}
