# roadmap-platform-operations

A forward view of what the Platform Operation team plans to work on.

This is a living document that adjusts as needed, dates may change at any point.

- [Roadmap](https://github.com/orgs/hmcts/projects/10/views/12)

## Planning

- [Requirements not yet allocated](https://github.com/orgs/hmcts/projects/10/views/16)
- [All requirements ordered by size](https://github.com/orgs/hmcts/projects/10/views/3)

## Maintenance

- [New labels](https://github.com/hmcts/roadmap-platform-operations/labels)
- [New sprint start](https://github.com/orgs/hmcts/projects/10/settings/fields/27713965)
- [New sprint end](https://github.com/orgs/hmcts/projects/10/settings/fields/38305924)

## Jira sync

Issues are synced from Jira to GitHub using the [Jira Sync script](./jira-automation/create-issue.mjs).

Issues are synced automatically on creation using [Jira automation](https://tools.hmcts.net/jira/secure/AutomationProjectAdminAction!default.jspa?projectKey=DTSPO#/rule/113/audit-log), there is also a sweeper job ran every hour during business hours using Azure DevOps and can be triggered on demand by running the
[pipeline](https://dev.azure.com/hmcts/PlatformOperations/_build?definitionId=824&_a=summary).

It will migrate any issues that the JQL filter matches:
- [DTSPO Roadmap loader](https://tools.hmcts.net/jira/issues/?filter=64971)

Members of the Platform Operations team have edit permission on the saved filter.

## Github Auth

Authentication to GitHub is done using a GitHub App called `Roadmap Platform Operations`. 
This is a custom app and is installed on the `hmcts` organisation and has access to the `roadmap-platform-operations` repository with the relevant permissions.

Authentication is done using a private key and app id stored in the repository secrets, and the app token is generated and used to create issues, labels and to update issue statues.

## Additional Information
You can view the [Roadmap Integration - The behind the scenes](https://justiceuk.sharepoint.com/:v:/r/sites/DTSPlatformOperations/Shared%20Documents/General/Recordings/Knowledge%20Sharing-20240829_140249-Meeting%20Recording.mp4?csf=1&web=1&e=4hZ933&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D) for an overview of how the integration works.