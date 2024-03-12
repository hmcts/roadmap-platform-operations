import jira2md from 'jira2md'
import dedent from 'dedent'

export function extractSummary(content) {
    const section = extractSection({ beginning: 'h3. Summary', end: 'h3. Intended Outcome', content })
    return jira2md.to_markdown(section)
}

export function extractIntendedOutcome(content) {
    const section = extractSection({ beginning: 'h3. Intended Outcome', end: 'h3. Impact on Teams', content })
    return jira2md.to_markdown(section)
}

export function extractImpactOnTeams(content) {
    const section = extractSection({ beginning: 'h3. Impact on Teams', end: 'h3. Additional information', content })
    return jira2md.to_markdown(section)
}

export function extractAdditionalInformation(content) {
    const section = extractSection({ beginning: 'h3. Additional information', end: 'h3. Prioritisation Matrix', content })
    return jira2md.to_markdown(section)
}

export function extractAndSumPrioritisationMatrix(content) {
    if (!content) {
        return undefined
    }

    const endSection = dedent(extractEndSection({ beginning: 'h3. Prioritisation Matrix', content }))

    const section = endSection
        .split('\n')
        .filter(line => line.startsWith('|') || line.startsWith('(xs') || line.startsWith('(1 squad '))
        .filter(line => !(line.trim() === ''))
        .filter(line => !line.includes('|*Score*|'))
        // these ones are split on multiple lines making it hard to parse
        .filter(line => !(line.includes('|Size of change') || line.includes(('|How big are the *(Annual)* cost'))))
        .map(line => {
            let column = 3
            if (line.startsWith('(xs')) {
                column = 2
            }
            if (line.startsWith('(1 squad')) {
                column = 1
            }

            const result = line.split('|')[column].trim() || '0'
            return result
        })
        .reduce((acc, val) => acc + parseInt(val), 0)

    return section
}

export function extractEndSection({ beginning, content }) {
    if (!content) {
        return undefined
    }
    const start = content.indexOf(beginning)

    if (start === -1) {
        return ''
    }

    const result = content.substring(start + beginning.length, content.length).trim()
    return sanitiseContent(result)
}

function sanitiseContent(content) {
    // replace @mentions with `@mention` so that we don't notify people accidentally
    return content.replace(/@([a-zA-Z0-9_]+)/g, '`$1`')
}

export function extractSection({ beginning, end, content }) {
    if (!content) {
        return undefined
    }

    const start = content.indexOf(beginning)

    const finish = content.indexOf(end)

    if (start === -1 || finish === -1) {
        return ''
    }

    const result = content.substring(start + beginning.length, finish).trim()
    return sanitiseContent(result)
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