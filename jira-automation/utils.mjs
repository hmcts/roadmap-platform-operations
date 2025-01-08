const INITIATIVE = 'Initiative';
const EPIC = 'Epic';

export function isCnpIssue(issueId) {
    return issueId.startsWith('DTSPO')
}

export function isInitiative(issue) {
    return issue.fields.issuetype.name === INITIATIVE;
}

export function isEpic(issue) {
    return issue.fields.issuetype.name === EPIC;
}

export function addAreaLabels(issue) {
    const labels = issue.fields.labels;

    // Add CNP label or default if not CNP
    if (isCnpIssue(issue.key)) {
        labels.push('CNP');
    } else {
        labels.push('common-platform');
    }

    // Add Initiative or Epic label
    if (isInitiative(issue)) {
        labels.push(INITIATIVE);
    } else if (isEpic(issue)) {
        labels.push(EPIC);
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
}

// Updates should only happen on one issue
export function getSingleItem(arry) {
    return arry.at(arry.length - 1)
}

