import {graphql} from "@octokit/graphql";

const token = process.env.GITHUB_TOKEN || process.env.GITHUB_REPO_TOKEN;

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${token}`,
    },
});


export async function createGitHubIssue(repositoryId, issue, labels) {
    const labelIds = issue.fields.labels
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

    return { id: result.repository.id, labels: result.repository.labels.edges.map(edge => edge.node) };
}
