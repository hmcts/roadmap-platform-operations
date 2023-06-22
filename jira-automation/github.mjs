import {graphql} from "@octokit/graphql";

const token = process.env.GITHUB_TOKEN || process.env.GITHUB_REPO_TOKEN;

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${token}`,
    },
});


export async function createGitHubIssue(repositoryId, issue) {
    await graphqlWithAuth(
        `mutation CreateIssue($repository_id:ID!, $title:String!, $body:String!) {
                createIssue(input: {repositoryId: $repository_id, title: $title, body: $body}) {
                    issue {
                        id
                    }
                }
        }`,
        {
            repository_id: repositoryId,
            title: issue.fields.summary,
            body: issue.key
        }
    );
}

export async function lookupRepoId() {
    const result = await graphqlWithAuth(
        `query FindRepo($owner:String!, $repository:String!) {
            repository(owner: $owner, name: $repository) {
                id
            }
         }`,
        {
            owner: 'hmcts',
            repository: 'roadmap-platform-operations',
        }
    );

    return result.repository.id;
}
