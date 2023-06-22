# roadmap-platform-operations

A forward view of what the Platform Operation team plans to work on.

This is a living document that adjusts as needed, dates may change at any point.

- [Overall roadmap](https://github.com/orgs/hmcts/projects/10/views/12)

By squad:
- [Red squad](https://github.com/orgs/hmcts/projects/10/views/6)
- [Blue squad](https://github.com/orgs/hmcts/projects/10/views/9)
- [Yellow squad](https://github.com/orgs/hmcts/projects/10/views/10)
- [Orange squad](https://github.com/orgs/hmcts/projects/10/views/11)

## Planning

- [Requirements not yet allocated](https://github.com/orgs/hmcts/projects/10/views/16)
- [All requirements ordered by size](https://github.com/orgs/hmcts/projects/10/views/3)

## Maintenance

- [New labels](https://github.com/hmcts/roadmap-platform-operations/labels)
- [New sprint start](https://github.com/orgs/hmcts/projects/10/settings/fields/27713965)
- [New sprint end](https://github.com/orgs/hmcts/projects/10/settings/fields/38305924)

## Jira sync

Issues are synced from Jira to GitHub using the [Jira Sync script](./jira-automation/index.mjs).

Issues are synced every hour during business hours using Azure DevOps and can be triggered on demand by running the
[pipeline](https://dev.azure.com/hmcts/PlatformOperations/_build?definitionId=824&_a=summary).

It will migrate any issues that the JQL filter matches:
- [DTSPO Roadmap loader](https://tools.hmcts.net/jira/issues/?filter=61018)

People in the Platform Operations team have edit permission on the saved filter.