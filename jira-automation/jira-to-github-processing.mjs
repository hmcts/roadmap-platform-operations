import jira2md from 'jira2md'
import dedent from 'dedent'

export function extractSummary(content) {
    const summarySection = extractSection({beginning: 'h3. Summary', end: 'h3. Intended Outcome', content})
    return jira2md.to_markdown(summarySection)
}

export function extractIntendedOutcome(content) {
    const summarySection = extractSection({beginning: 'h3. Intended Outcome', end: 'h3. Impact on Teams', content})
    return jira2md.to_markdown(summarySection)
}

export function extractImpactOnTeams(content) {
    const summarySection = extractSection({beginning: 'h3. Impact on Teams', end: 'h3. Additional information', content})
    return jira2md.to_markdown(summarySection)
}

export function extractAdditionalInformation(content) {
    const summarySection = extractSection({beginning: 'h3. Additional information', end: 'h3. Prioritisation Matrix', content})
    return jira2md.to_markdown(summarySection)
}

export function extractSection({beginning, end, content}) {
    const start = content.indexOf(beginning)

    const finish = content.indexOf(end)
    
    if (start === -1 || finish === -1) {
        return ''
    }

    const result = content.substring(start + beginning.length, finish).trim()

    // replace @mentions with `@mention` so that we don't notify people accidentally
    const replacedMentions = result.replace(/@([a-zA-Z0-9_]+)/g, '`$1`')
    return replacedMentions
}

export function jiraToGitHub({
    issueId,
    content
}) {
    if (!content) {
        return issueId
    }

    const summary = extractSummary(content)
    const intendedOutcome = extractIntendedOutcome(content)
    const impactOnTeams = extractImpactOnTeams(content)

    return dedent(`${issueId}
    
    ${summary ? `## Summary

    ${summary}` : ''}

    ${intendedOutcome ? `## Intended Outcome

    ${intendedOutcome}` : ''}

    ${impactOnTeams ? `## Impact on Teams

    ${impactOnTeams}` : ''}
    `)

}