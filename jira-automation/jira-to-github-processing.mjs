import jira2md from 'jira2md'
import dedent from 'dedent'
import {EPIC, hasItems} from "./utils.mjs";

export function extractSummary(content) {
    let summarySection = extractSection({
        beginning: 'h3. Summary',
        end: 'h3. Intended Outcome', content
    })
    if (!summarySection) {
        summarySection = extractSection({
            beginning: 'h3. Summary',
            end: 'h3. Delivery Requirements', content
        })
    }
    return jira2md.to_markdown(summarySection)
}

export function extractIntendedOutcome(content) {
    let summarySection = extractSection({
        beginning: 'h3. Intended Outcome',
        end: 'h3. Impact on Teams', content
    })
    if (!summarySection) {
        summarySection = extractSection({
            beginning: 'h3. Delivery Requirements',
            end: 'h3. Technical Details', content
        })
    }
    return jira2md.to_markdown(summarySection)
}

export function extractImpactOnTeams(content, issueType) {
    let summarySection = extractSection({
        beginning: 'h3. Impact on Teams',
        end: 'h3. Additional information',
        content
    })
    if(issueType === EPIC) {
        summarySection = extractSection({
            beginning: 'h3. Impact on Teams',
            end: 'h3. Dependencies',
            content
        })
    }
    return jira2md.to_markdown(summarySection)
}

export function extractAdditionalInformation(content) {
    const summarySection = extractSection({
        beginning: 'h3. Additional information',
        end: 'h3. Prioritisation Matrix',
        content
    })
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
    return result.replace(/@([a-zA-Z0-9_]+)/g, '`$1`')
}

export function extractDescriptionForCrime(issueId, content) {
    content = content.replace(/@([a-zA-Z0-9_]+)/g, '`$1`')
    content = jira2md.to_markdown(content)
    return dedent(`${issueId}
    
    ${content ? `## Epic Description

    ${content}` : ''}
    `)
}

export function extractPrioritisationTotalScore(content) {
    let score = "0";
    let endSection = dedent(extractEndSection({
        beginning: 'h3. Prioritisation Matrix', content
    }))

    if (!endSection) {
        endSection = dedent(extractEndSection({
            beginning: 'h3. Epic Scoring', content
        }))
    }

    let values = endSection
        .split('\n')
        .filter(line => line.trim().startsWith('Total:') || line.trim().startsWith('Score:'));

    if (hasItems(values)) {
        const value = values.at(-1).trim()
        const matches = value.match(/(\d+)/);

        if (hasItems(matches)) {
            score = matches[0]
            console.log(`A score of ${score} found`);
        }
    }

    return parseFloat(score);
}


export function jiraToGitHub({issueId, issueType, content}) {

    const summary = extractSummary(content)
    const intendedOutcome = extractIntendedOutcome(content)
    const impactOnTeams = extractImpactOnTeams(content, issueType)

    let intendedOutcomeHeader = `## Intended Outcome`
    if (issueType === EPIC) {
        intendedOutcomeHeader = `## Delivery Requirements`
    }
    return dedent(`${issueId}
    
    ${summary ? `## Summary

    ${summary}` : ''}

    ${intendedOutcome ? `${intendedOutcomeHeader}

    ${intendedOutcome}` : ''}

    ${impactOnTeams ? `## Impact on Teams

    ${impactOnTeams}` : ''}
    `)

}

export function extractEndSection({beginning, content}) {
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