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

    if (!(process.env.GITHUB_TOKEN || process.env.GITHUB_REPO_TOKEN)) {
        console.error('GITHUB_TOKEN or GITHUB_REPO_TOKEN environment variable not set')
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

export async function getGitHubAuthToken(appId, keyValue) {
    const privateKey = formatPem(keyValue);
    console.log(privateKey);
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

function formatPem(oneLinePem) {
    // Do not remove newlines, just trim leading/trailing whitespace
    const pem = oneLinePem.trim();

    // Extract header, footer, and body
    const headerMatch = pem.match(/(-----BEGIN [^-]+-----)/);
    const footerMatch = pem.match(/(-----END [^-]+-----)/);

    if (!headerMatch || !footerMatch) {
        throw new Error('Invalid PEM format: missing header or footer');
    }

    const header = headerMatch[1];
    const footer = footerMatch[1];

    // Extract the body (everything between header and footer)
    let body = pem.replace(header, '').replace(footer, '');
    // Remove the first space after the header and the last space before the footer
    body = body.replace(/^ +/, '').replace(/ +$/, '');
    // Remove trailing space and newline if present
    body = body.replace(/( |)\n*$/, '');
    // Join everything with newlines, with the body in between, ensuring no extra newline before the footer
    let pemString = `${header}\n${body}\n${footer}`;
    // Remove any newline(s) directly before the footer
    pemString = pemString.replace(/\n+(-----END [^-]+-----)/, '\n$1');
    return pemString;
}