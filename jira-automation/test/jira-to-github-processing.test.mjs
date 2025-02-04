import assert from 'node:assert';
import {describe, it} from 'node:test'

import {
  extractIntendedOutcome,
  extractSummary,
  extractPrioritisationTotalScore,
  jiraToGitHub
} from '../jira-to-github-processing.mjs'
import {addAreaLabels} from "../utils.mjs";

const cnp_issue = {
  key: 'DTSPO-123',
  fields: {
    id: '14900',
    summary: 'This is a summary',
    issuetype: { name: 'Initiative' },
    labels: [],
    description: `h3. Summary

    Hourly Job to provide a CSV file in a storage account that has a count of all Virtual machines and VM scalesets that are running for the CJS Common Platform tenant by SKU type, Resource name, resource group name and Subscription name.
    h3. Intended Outcome
    
    _Use data in CSV file format to review and understand how many SKu's are running every hours and especially at night so an average can be used to purchase the desired RI's for CFT._
    
    _This should cover both virtual machines and scale sets._
    
    _Every hour should have a new CSV file_
    h3. Impact on Teams
    
    _No impact_
    h3. Additional information
    
    _The below query was created by Ben for Scale set and might be a good start:_
    
    
    {code:java}
    // CFT-Scalesets
    // CFT total scale set vm's
    // Click the "Run query" command above to execute the query and see results.
    resources
    | join kind=inner (
        resourcecontainers
        | where type == 'microsoft.resources/subscriptions'
        | project subscriptionId, subscriptionName = name)
        on subscriptionId
    | where type=~ 'microsoft.compute/virtualmachinescalesets'
    | project subscriptionName, name, location, resourceGroup, Capacity = toint(sku.capacity), Tier = tostring(sku.name)
    | summarize Total = sum(Capacity) by Tier, subscriptionName
    | order by Tier desc
    {code}
    
    
    Add a management lifecycle policy that removes data after 90 days (confirm the number with Bruce).
    
    It's expected the easiest way to run this will be a Kubernetes CronJob that writes to a storage account (might be able to use the existing [finopsdataptlsa|https://portal.azure.com/#@HMCTS.NET/resource/subscriptions/1baf5470-1c3e-40d3-a6f7-74bfbce4b348/resourceGroups/finopsdataptlrg/providers/Microsoft.Storage/storageAccounts/finopsdataptlsa] account)
    
    
    
    _Bruce will be using this hourly SKU data and ingesting it into PowerBI to give us a average view of all SKU's_
    h3. Prioritisation Matrix
    |*Value / benefit dimension*|*Weighting*|*Score*|
    |Is this a mandatory or legislative change|Mandatory / Legislative 100, No 0|0|
    |Does this fix a security risk|Critical 100, High 30, Medium 20, Low 5, Info 0, none 0|0|
    |Vendor support or PlatOps support impact|Vendor 25,  PlatOps 10, No 0|0|
    |Will the application cease to work without this work|Fully 25, Partially 10, No 0|0|
    |When does this need to be delivered by|Immediately 20, Within 2 months 15, within 4 months 10, within 6 months 5, more than 6 months 0|15|
    |Are other systems dependent upon this change|Multiple 10, One 5, No 0|0|
    |Is this strategic or tactical|Strategic 10, Tactical 0|10|
    |Size of change
    (xs = 1 person 1 sprint, s = 1 person 2 sprints or 2 people 1 sprint etc.)|XL = 0, Large 5, Medium 10, Small 15, XS = 20|20|
    |What is the priority of this work within your area|High 5, Medium 2, Low 0|2|
    |How big are the benefits for this piece of work|High 20, Medium 10, Low 5|20|
    |How big are the *(Annual)* cost savings or avoidance for this piece of work|<=£500k (per annum) 100, <=£250k 75, <=£100k 50, <=£50k 40, 0
    (1 squad 1 sprint = 35K)|50|
    |User quality of life improvement? (Engineers and/or End Users)|End User & Engineer 15, End User impact 10, Engineers 5, No impact 0|0|
    |High Availability Improvement?|High 75, Medium 50, Low 25, None 0|0|
    |Path to Live Improvement?|Major 75, Minor 25, None 0|0|
    
    Total: 117`
  }
}

const epic_issue = {
  key: 'DTSPO-22548',
  fields: {
    id: '10000',
    labels: [],
    issuetype: { name: 'Epic' },
    summary: 'This is a summary for an epic issue',
    description: `h3. Summary

    Summary of the requirement here.
    h3. Delivery Requirements
    
    Delivery Requirements content here
    
    h3. Technical Details
    
    Technical Details content here.
    
    _This should cover both virtual machines and scale sets._
    
    _Every hour should have a new CSV file_
    
    h3. Impact on Teams
    _No impact_

    h3. Dependencies
    
    Dependencies content here
    
    h3. Cost Savings
    
    Cost Savings content here
    
    _Are there any potential cost saving by delivering this epic? N/A if none determined_
    h3. Actionable Recommendations:
     * *Maximise cost savings:* Epics with high cost savings should be prioritised if they offer a significant return on investment, whether through reducing cloud/infrastructure costs, improving efficiency, or automating manual processes.
     * *Clarify acceptance criteria early:* Ensure that all Epics have clear, measurable acceptance criteria, particularly if they’re tied to financial or platform outcomes. Well-defined criteria are crucial to ensure that cost-saving features are actually measurable and delivered effectively.
     * *Optimise dependencies:* For Epics with high dependencies, early alignment with teams can reduce delays and ensure smoother execution, directly impacting time-to-value.
     * *Manage technical complexity:* Track technical risk and complexity carefully—high-complexity Epics may require more planning or experimentation (e.g., a spike or a proof of concepts) before proceeding to mitigate risks, especially in cases where the Epic has cost-saving potential tied to technical innovation.
    
    [The Scoring Matrix - Epics|https://tools.hmcts.net/confluence/display/DTSPO/The+Scoring+Matrix+-+Epics]
    h3. Epic Scoring
    |*Criteria*|*Description (1, 3 or 5)*|*Score*|
    |Delivery Requirements|How critical is the delivery timeline for this Epic|4|
    |Cost Saving|What is the potential cost saving associated with this Epic|3|
    |Dependencies|How many dependencies does this Epic have|2|
    |Technical Details|How complex are the technical details and implementation|1|
    
     Total:10`
  }
}

describe('jira-to-github-processing for CNP - Initiative', t => {
  it('Initiative: extracts summary from Jira issue ', t => {

    const result = extractSummary(cnp_issue.fields.description)

    assert.equal(result, 'Hourly Job to provide a CSV file in a storage account that has a count of all Virtual machines and VM scalesets that are running for the CJS Common Platform tenant by SKU type, Resource name, resource group name and Subscription name.')
  })

  it('Initiative: extracts intended outcome from Jira issue', t => {

    const result = extractIntendedOutcome(cnp_issue.fields.description)

    assert.equal(result, `*Use data in CSV file format to review and understand how many SKu's are running every hours and especially at night so an average can be used to purchase the desired RI's for CFT.*\n    \n    *This should cover both virtual machines and scale sets.*\n    \n    *Every hour should have a new CSV file*`)
  })

  it('Initiative: converts jira description to github markdown', t => {
    const result = jiraToGitHub({
        issueId: cnp_issue.key,
        issueType:  cnp_issue.fields.issuetype.name,
        content: cnp_issue.fields.description
    })

    assert.equal(result, `DTSPO-123

## Summary

Hourly Job to provide a CSV file in a storage account that has a count of all Virtual machines and VM scalesets that are running for the CJS Common Platform tenant by SKU type, Resource name, resource group name and Subscription name.

## Intended Outcome

*Use data in CSV file format to review and understand how many SKu's are running every hours and especially at night so an average can be used to purchase the desired RI's for CFT.*

*This should cover both virtual machines and scale sets.*

*Every hour should have a new CSV file*

## Impact on Teams

*No impact*`)
  })

  it('Initiative: extracts score from Jira issue', t => {
    const score = extractPrioritisationTotalScore(cnp_issue.fields.description)

    assert.equal(score, 117, 'Prioritisation score in not accurate')
  })

  it('Initiative: adds the correct labels to the issue - Initiative', t => {
    const result = addAreaLabels(cnp_issue)
    assert.deepStrictEqual(result, ["CNP", "Initiative"])
  })

})

describe('jira-to-github-processing for CNP - Epic', t => {
  it('Epic: extracts summary from Jira issue', t => {

    const result = extractSummary(epic_issue.fields.description)

    assert.equal(result, 'Summary of the requirement here.')
  })

  it('Epic: converts jira description to github markdown', t => {
    const result = jiraToGitHub({
      issueId: epic_issue.key,
      issueType: epic_issue.fields.issuetype.name,
      content: epic_issue.fields.description
    })

    assert.equal(result, `DTSPO-22548

## Summary

Summary of the requirement here.

## Delivery Requirements

Delivery Requirements content here

## Impact on Teams

*No impact*`)
  })

  it('Epic: extracts score from Jira issue', t => {
    const score = extractPrioritisationTotalScore(epic_issue.fields.description)

    assert.equal(score, 10, 'Prioritisation score in not accurate')
  })

  it('Epic: adds the correct labels to the issue - Epic', t => {
    const result = addAreaLabels(epic_issue)
    assert.deepStrictEqual(result, ["CNP", "Epic"])
  })
})
