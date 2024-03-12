export function addAreaLabels(issue) {
    const labels = issue.fields.labels
    if (issue.key.includes('DTSPO')) {
        labels.push('CNP')
    } else if (issue.key.includes('EI')) {
        labels.push('CRIME')
    } else {
        labels.push('common-platform')
    }
    return labels
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
