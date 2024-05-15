import {graphql} from "@octokit/graphql";

const token = process.env.GITHUB_TOKEN || process.env.GITHUB_REPO_TOKEN;

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${token}`,
    },
});


export async function createGitHubIssue(repositoryId, issue, labels, labelsToAdd) {
    const labelIds = labelsToAdd
        .filter(label => labels.find(l => l.name.toLowerCase() === label.toLowerCase()))
        .map(label => labels.find(l => l.name.toLowerCase() === label.toLowerCase()).id)

    await graphqlWithAuth(
        `mutation CreateIssue($repository_id: ID!, $title: String!, $body: String!, $label_ids:[ID!]) {
          createIssue(
            input: { repositoryId: $repository_id, title: $title, body: $body, labelIds: $label_ids }
          ) {
            issue {
              id
            }
          }
        }
`,
        {
            repository_id: repositoryId,
            title: issue.fields.summary,
            body: issue.key,
            label_ids: labelIds,
        }
    );
}

export async function updateGitHubIssue({
    issueId, title, body}
  ) {
  await graphqlWithAuth(
      `mutation UpdateIssue($issueId: ID!, $title: String!, $body: String!) {
        updateIssue(input: {id: $issueId, title: $title, body: $body}) {
          issue {
            id
          }
        }
      }`,
      {
          issueId,
          title,
          body
      }
  )
}

export async function updateGitHubIssueSize({issueKey, score}) {
    const projectId = await getProjectId()
    const {issueNumber} = await findIssueNumberFromJiraKey({issueKey})
    const itemId = await getItemId({projectId, issueKey: issueNumber})
    const sizeField = await getSizeFieldId({projectId})
    await setSize({projectId, itemId, fieldId: sizeField.id, score})
}


export async function lookupRepo() {
    const result = await graphqlWithAuth(
        `query FindRepo($owner:String!, $repository:String!) {
            repository(owner: $owner, name: $repository) {
                id, labels(first: 100) {
                  edges {
                    node {
                      id, name
                    }
                  }
                }
            }
         }`,
        {
            owner: 'hmcts',
            repository: 'roadmap-platform-operations',
        }
    );

    return {id: result.repository.id, labels: result.repository.labels.edges.map(edge => edge.node)};
}

async function getStatusFieldIds({projectId}) {
    const result = await graphqlWithAuth(
        `query ($projectId: ID!){
          node(id: $projectId) {
            ... on ProjectV2 {
              fields(first: 20) {
                nodes {
                  ... on ProjectV2SingleSelectField {
                    id
                    name
                    options {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }`,
        {
            projectId,
        })

    return result.node.fields.nodes
        .filter(field => field !== {})
        .filter(field => field.name === 'Status')
        .pop()
}

async function getSizeFieldId({projectId}) {
    const result = await graphqlWithAuth(
        `query ($projectId: ID!){
          node(id: $projectId) {
            ... on ProjectV2 {
              fields(first: 20) {
                nodes {
                  ... on ProjectV2Field {
                    id
                    name
                  }
                }
              }
            }
          }
        }`,
        {
            projectId,
        })

    return result.node.fields.nodes
        .filter(field => field !== {})
        .filter(field => field.name === 'Size')
        .pop()
}

async function getProjectId() {
    const result = await graphqlWithAuth(
        `query{
            organization(login: "hmcts"){
              projectV2(number: 10) {
                id
              }
            }
          }`)

    return result.organization.projectV2.id
}

async function getItemId({projectId, issueKey, cursor}) {
    const result = await graphqlWithAuth(
        `query ($projectId: ID!, $cursor: String) {
          node(id: $projectId) {
            ... on ProjectV2 {
              items(first: 100, after: $cursor) {
                edges {
                  cursor
                  node {
                    id
                    content {
                      ... on Issue {
                        number
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        {
            projectId,
            cursor,
        }
    )

    const itemId = result.node.items.edges
        .filter(edge => edge.node.content.number === issueKey)
        .map(edge => edge.node.id)
        .pop()

    if (itemId) {
        return itemId
    }

    if (result.node.items.edges.length === 0) {
        throw new Error("Couldn't find matching ID for issue: " + issueKey)
    }

    const newCursor = result.node.items.edges[result.node.items.edges.length - 1].cursor

    return getItemId({projectId, issueKey, cursor: newCursor})
}

export async function findIssueNumberFromJiraKey({issueKey}) {
    const result = await graphqlWithAuth(
        `query {
           search(query: "repo:hmcts/roadmap-platform-operations in:body ${issueKey}", type: ISSUE, first: 10) {
             nodes {
               ... on Issue {
                id,
                number,
                title,
               }
             }
           }
        }`,
    );

    if (result.search.nodes.length === 0) {
        throw new Error("Couldn't find matching issue: " + issueKey)
    }

    if (result.search.nodes.length > 1) {
        throw new Error("Found multiple matching issues: " + result.search.nodes.map(node => node.title).join(', '))
    }

    const issue = result.search.nodes.pop()

    return {issueNumber: issue.number, title: issue.title, issueId: issue.id};
}

async function setStatus({projectId, itemId, fieldId, optionId}) {
    await graphqlWithAuth(
        `mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
          updateProjectV2ItemFieldValue(
            input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $optionId}}
          ) {
            projectV2Item {
              id
            }
          }
        }`,
        {
            projectId,
            itemId,
            fieldId,
            optionId,
        }
    )
}

async function setSize({projectId, itemId, fieldId, score}) {
    await graphqlWithAuth(
        `mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $score: Float) {
          updateProjectV2ItemFieldValue(input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {number: $score}}) {
            projectV2Item {
              id
            }
          }
        }`,
        {
            projectId,
            itemId,
            fieldId,
            score,
        }
    )
}

function getOptionId({optionName, statusFieldIds}) {
    return statusFieldIds.options.filter(option => option.name.includes(optionName)).pop().id;
}

async function setStatusFull({issueKey, optionName}) {
    const projectId = await getProjectId()

    const {issueNumber, issueId} = await findIssueNumberFromJiraKey({issueKey})

    const itemId = await getItemId({projectId, issueKey: issueNumber})

    const statusFieldIds = await getStatusFieldIds({projectId})

    const optionId = getOptionId({statusFieldIds, optionName})

    await setStatus({projectId, itemId, fieldId: statusFieldIds.id, optionId})

    return {issueId}
}

export async function setInProgress({issueKey}) {
    await setStatusFull({issueKey, optionName: 'In progress'});
}

export async function setDone({issueKey}) {
    const {issueId} = await setStatusFull({issueKey, optionName: 'Done'});

    await closeIssue({issueId})
}

async function closeIssue({issueId}) {
    await graphqlWithAuth(
        `mutation ($issueId: ID!) {
          closeIssue(input: {issueId: $issueId, stateReason: COMPLETED}) {
            issue {
              state
            }
          }
        }`,
        {
            issueId,
        }
    )
}