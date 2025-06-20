import {createAppAuth} from '@octokit/auth-app';
import {request} from '@octokit/request';

export function isCnpIssue(issueId) {
    return issueId.startsWith('DTSPO')
}

export function addAreaLabels(issue) {
    const labels = issue.fields.labels;

    // Add CNP label or default if not CNP
    if (isCnpIssue(issue.key)) {
        labels.push('CNP');
    } else {
        labels.push('common-platform');
    }

    return labels;
}

export function hasItems(arr) {
    return Array.isArray(arr) && arr.length > 0
}

export function assertCredentialsPresent() {
    if (!process.env.JIRA_API_TOKEN) {
        console.error('JIRA_API_TOKEN environment variable not set')
        process.exit(1)
    }

    if (!process.env.GITHUB_APP_ID) {
        console.error('GITHUB_APP_ID environment variable not set')
        process.exit(1)
    }
}

// Updates should only happen on one issue
export function getSingleItem(arry) {
    return arry.at(arry.length - 1)
}

export async function getGitHubAuthToken(appId, privateKey) {
    const auth = createAppAuth({appId, privateKey});
    const appAuthentication = await auth({type: "app"});

    const installations = await request('GET /app/installations', {
        headers: {
            authorization: `Bearer ${appAuthentication.token}`,
            accept: 'application/vnd.github+json'
        }
    });

    const installation = installations.data.find(inst => inst.account.login === "hmcts");
    if (!installation) throw new Error("Installation for org 'hmcts' not found");
    const installationId = installation.id;

    const installationAuth = await auth({type: "installation", installationId});
    return installationAuth.token;
}
