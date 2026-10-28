# Notes and Questions

## 100 days

- Understand the current situation - Data Driven:
  - There is no T-Shirt one-size fit all solution, current situation and wanted position must be defined.
  - Chat with the teams:
    - What are the pain points? (Developers, Delivery team, Leadership, etc?)
    - DX surveys?
  - Do we have Customer Surveys?
    - CSAT (or Customer Satisfaction Score): Measures a customer's immediate, short-term satisfaction with a specific interaction, purchase, or product.
    - NPS (or Net Promoter Score): Measures long-term customer loyalty, brand health, and the likelihood that a customer would recommend the company to someone else.
  - Observability: do we have monitoring or observability tools like Datadog, splunk, prometheus, etc?
    - What are the monitoring pain points? APM (or Application Performance Monitoring): The technical practice of using software tools and telemetry data to track real-time application behavior, response times, error rates, and resource utilization... Then we can find what are the worse Endpoint offenders, what are the worse SQL query offenders, etc?
    - RUM - What do we get from RUM sessions?

- Define current situation:
  - How do we test today?
    - Do we have multiple test strategies?
    - Do we have untested areas?
  - Where are the weak spots?
  - CI/CD: what makes developers life difficult?
  - What are current tools for software quality?
  - How do we currently measure quality and show (dashboards, reports?)
  - What is the current release management flow (Delivery team)? What is currently defining the go/nogo ?

  ## Questions
  - What's the Edge vs Cloud interaction, is there any "flow diagram" that explain how they interact together? In other words, what should be automated? I can do assumptions, but I'd rather like having a more realistic flow.
  - Do you expect me to create an account on vention.com ? It requires a work email for that purpose so my personal email abouchard@live.ca doesn't work, therefore can you either provide me a test account or manually register my own address please?
  - In sections 2 - There is a high level block diagram - Are you using micro services or a monolith? Are you in AWS or Google cloud, kubernetes argocd, etc (some information to get more context for Section 1)
  - In section 1 - there is a "bonus" question:
    - Statement: An MMAI controller in the field intermittently loses EtherCAT communication. How would your process, in section 2 above, have caught this before release, and how would you prevent it from happening in the future?
    - My question: What section 2 "above" ? Do you mean section 2 "below" ?

  ## Ideas
  - Data Quality - 6 Data Quality Dimensions?
