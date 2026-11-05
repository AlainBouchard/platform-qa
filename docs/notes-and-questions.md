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
- Do you expect me to create an account on vention.com ? It requires a work email for that purpose so my personal email <abouchard@live.ca> doesn't work, therefore can you either provide me a test account or manually register my own address please?
- In sections 2 - There is a high level block diagram - Are you using micro services or a monolith? Are you in AWS or Google cloud, kubernetes argocd, etc (some information to get more context for Section 1)
- In section 1 - there is a "bonus" question:
- Statement: An MMAI controller in the field intermittently loses EtherCAT communication. How would your process, in section 2 above, have caught this before release, and how would you prevent it from happening in the future?
- My question: What section 2 "above" ? Do you mean section 2 "below" ?

## Ideas

- Data Quality - 6 Data Quality Dimensions?

## Test strategy for Cloud application

### Assumptions

- Microservices architecture
- AWS or Google cloud clusters
- FE / BE architecture
- Using API Gateway for security issues
- Using GitHub and GH Actions to build workflows

### High Level Test Strategy

#### Dimensions

- What? -> Test categories: unit, component, integration, contract, system integration, ui/e2e, user journey, synthetic, smoke. For the NFR (Non Feature Requirements) -> System (Load, Scalability, Stress, Stability, etc), Pen (Security), Web Vitals, etc.
- Who? -> Dev, QA, SRE/Platform, PM, etc
- Where? -> Local/Computer, CI, CD, Cluster (staging, pre-prod, prod, etc)
- When? -> pre-merge, post-merge, pre-deployment, post-deployment, etc
- Why? -> fail fast, stop regression, go/no-go, protect the user, limit blast radius, keep contracts honest, prove the limits, watch production, show quality, keep delivery moving

#### Whys definitions

Why is the outcome the test is meant to buy. Each row below is a reason you can put next to fail fast.

- Fail fast — the author learns the change is wrong on their machine or in the pull request, while the fix is still cheap.
- Stop regressions — a behavior that already works stays working after later changes.
- Decide go / no-go — Delivery and leadership get evidence to ship or hold.
- Protect the user — a broken journey is caught before it hits customer satisfaction or loyalty.
- Limit the blast radius — the failure shows up in continuous integration or staging, so production can roll back or never receive it.
- Keep contracts honest — a service and its callers still agree, so a break is owned at the boundary.
- Prove the limits — load, stability, and security hold under the conditions that matter.
- Watch production — synthetic and post-deploy checks catch drift and incidents while they are still small.
- Show quality — dashboards and reports turn weak spots into a decision, not an opinion.
- Keep delivery moving — enough safety that teams can change code often without slowing the release.

#### Test Flow : shift left, shift right

| What | Who | Where | When | Why |
| --- | --- | --- | --- | --- |
| unit test | dev | local, CI | pre-merge, post-merge | fail fast, stop regression |
| component tests | dev | local, CI | pre-merge, post-merge | fail fast, stop regression |
| integration | dev, qa | local, CI | pre-merge, post-merge | fail fast, stop regression, keep contracts honest |
| contract | dev | local, CI | pre-merge, post-merge | keep contracts honest |
| web vitals (lab) | dev, qa | local, CI | pre-merge | fail fast, prove the limits |
| ui/e2e | qa | CI, cluster | post-merge, pre-deployment | stop regression, limit blast radius |
| smoke | qa, dev | CI, cluster | pre-deployment | decide go / no-go, limit blast radius |
| system integration | dev, qa | cluster | pre-deployment | keep contracts honest, limit blast radius |
| user journey | qa | cluster | pre-deployment | protect the user, limit blast radius |
| system | qa, sre | cluster | pre-deployment | prove the limits, decide go / no-go |
| pen | security, sre | cluster | pre-deployment, post-deployment | prove the limits, protect the user, decide go / no-go |
| smoke | qa, dev | cluster | post-deployment | decide go / no-go, limit blast radius |
| synthetic traffic | dev, qa | cluster | post-deployment | watch production |
| web vitals (field) | dev, qa | cluster | post-deployment | watch production |

## Test Strategy for Edge Software (firmware)

### Known

- From the challenge PDF: [Vention Software Reliability Challenge.pdf](Vention%20Software%20Reliability%20Challenge.pdf)
  - Two targets. Cloud is design, simulation, configuration, and ordering. It ships every two weeks, Vention owns the runtime, and rollback is possible.
  - Edge is firmware and software on controllers that drive real motion in customer factories.
  - Those machines are customer-owned, often disconnected, and often months behind.
  - There is no rollback on a machine mid-shift. A patch is possible and costly. A failure stops a line or creates a hazard.
  - Machine Builder generates a software-defined configuration as the machine is assembled. The controller consumes that configuration. Generation stays a cloud check. Consumption is the edge check.
  - An MMAI controller in the field intermittently loses EtherCAT communication. That is the named field bug.
- From the Vention site and docs: [MachineMotion AI](https://vention.io/machinemotion-ai), [controller datasheet](https://docs.vention.com/docs/machinemotion-ai-controller-datasheet)
  - Four current controllers: MachineMotion AI, AI Pro, AI Robot, and AI Robot Pro. They run Linux.
  - The datasheet protocol cell is IO-Link, HTTP, and MQTT. EtherCAT is documented separately, on the motor chain and on a daisy-chain port.
  - The drive models have motor ports. AI Pro has 4. MachineMotion AI has 2. The Robot models have none, and they have no onboard safety PLC.
  - Over-the-air update exists. AI Robot updates over Wi-Fi or a cable. The other three also use LTE.
  - The [release-notes index](https://docs.vention.com/docs/release-notes.md) is the readable list. The HTML page is thin. It lists 3.1 through 3.5, including an [October 2026 memory-leak fix](https://docs.vention.com/docs/oct-2026-machinemotion-firmware-v3-5-3). That fix is MachineLogic and remote-view leaks, plus a certificate-trust fix. It does not mention EtherCAT.
  - The same index announces [MachineMotion v2 end of life](https://docs.vention.com/docs/machinemotion-v2-ecosystem-end-of-sales). The page title says End of Life. The URL says end-of-sales. End of sale is 1 September 2026. v2 and MachineMotion AI are not compatible.
  - A [TCP socket API](https://docs.vention.com/docs/en/application-programming-interface-low-level-sockets-for-machinemotion) on port 9999 exists from software v3.1.0. The docs.vention.io link redirects here.

### Assumptions

- Products
  - This strategy tests the four current models.
  - Older firmware in the matrix is MachineMotion AI 3.x still in the field, from 3.1.0 onward.
  - MachineMotion v2 stays on its own track. Safety certification stays on its own track.
- Models
  - A full motor chain applies to MachineMotion AI and AI Pro.
  - Robot and Robot Pro have no motor ports. Their limit is the link, not a motor chain.
- Lab
  - A lab with real controllers is available, and an emulator covers scale.
  - The emulator does not stand in for a full motor chain.
  - The cloud digital twin is a separate check from that lab.
- Failures and updates
  - Contract tests cover EtherCAT, MQTT, IO-Link, HTTP, and the TCP socket.
  - The configuration check is a handoff. Machine Builder produces it. The controller consumes it.
  - TLS certificate trust is its own check.
  - The EtherCAT soak is the named field bug: intermittent loss of EtherCAT communication. Noise, load, heat, and a cold boot are guesses at the cause.
  - The memory-leak soak is the named v3.5.3 bug: MachineLogic print and file-write leaks, and the remote-view recording leak.
  - Fleet health starts only after a controller can report its firmware version and link health. Until that reporting exists, the row is not a release gate. SRE/Platform owns the watch. The factory is watch only.
  - The lab proves an update can resume after a dropped link. Offering that build in stages is a release decision. The factory is not where the update is rehearsed.

### High Level Test Strategy

#### Dimensions

- What? -> Test categories: unit, component, integration, contract (EtherCAT, MQTT, IO-Link, HTTP, TCP socket), configuration handoff, certificate, hardware-in-the-loop, EtherCAT fault injection, soak (EtherCAT link loss), soak (v3.5.3 memory leak), emulator, smoke, staged over-the-air update. For the NFR (non-functional requirements) -> stability, disconnect, link loss. Safety certification stays on its own track.
- Who? -> Dev (controller stack), QA, lab, SRE/Platform, Delivery
- Where? -> Bench, CI, lab with real controllers, emulator, customer factory (watch only)
- When? -> pre-merge, post-merge, on the release candidate before a machine is offered the build, and after ship once a controller reports version and link health. MachineMotion AI 3.x still in the field stays in the matrix. MachineMotion v2 does not.
- Why? -> the cloud list, plus recover the update and carry old firmware

#### Whys definitions

Why is the outcome the test is meant to buy. The cloud list is the base. This section adds recover the update and carry old firmware. The sentence is the outcome on a controller. The shape comes from the [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html), [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), and [When Software Meets Hardware](https://www.martinfowler.com/articles/software-meets-hardware.html). Integration rows follow [Integration Test](https://martinfowler.com/bliki/IntegrationTest.html). The EtherCAT soak follows [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html), because the field bug is intermittent.

- Fail fast — the author learns the firmware change is wrong on the bench or in CI, while the fix is still cheap.
- Stop regressions — a motion path, a link, or an update path that already works stays working on the next firmware.
- Decide go / no-go — the release is held until the lab evidence says the build is safe to offer.
- Protect the user — a bad firmware is caught before it stops a line or creates a hazard.
- Limit the blast radius — the failure shows up in CI or in the lab, so a factory machine never receives that build.
- Keep contracts honest — MQTT, IO-Link, HTTP, and the TCP socket still agree, and the controller still consumes the configuration Machine Builder produced. EtherCAT stays on the motor and link side.
- Prove the limits — on the drive models, EtherCAT under a full motor chain still holds. On every model, a long run and a dropped link still hold. Robot models have no motor ports.
- Watch production — once a controller can report firmware version and link health, SRE/Platform reads that report. The factory is watch only.
- Show quality — firmware version, link health, and lab results turn a field report into a release decision.
- Keep delivery moving — teams can ship firmware without waiting for a factory incident to find the break.
- Recover the update — an over-the-air update that drops can resume, because the machine cannot roll back mid-shift.
- Carry old firmware — the build is also proven against MachineMotion AI 3.x that is still in the field. MachineMotion v2 is a separate track.

#### Test Flow : shift left, shift right

| What | Who | Where | When | Why |
| --- | --- | --- | --- | --- |
| unit test | dev | bench, CI | pre-merge, post-merge | fail fast, stop regression |
| component tests | dev | bench, CI | pre-merge, post-merge | fail fast, stop regression |
| integration | dev, qa | bench, CI | pre-merge, post-merge | fail fast, stop regression, keep contracts honest |
| contract | dev | bench, CI | pre-merge, post-merge | keep contracts honest |
| configuration handoff | dev, qa | bench, CI | pre-merge, post-merge | keep contracts honest |
| certificate | dev, qa | bench, CI | pre-merge, post-merge | keep contracts honest, protect the user |
| emulator | dev, qa | emulator | pre-merge, post-merge | fail fast |
| hardware-in-the-loop | dev, qa, lab | lab | release candidate | prove the limits, protect the user, limit blast radius |
| ethercat fault injection | dev, qa, lab | lab | release candidate | prove the limits, protect the user, decide go / no-go |
| soak (ethercat link loss) | qa, lab | lab | release candidate | prove the limits, protect the user, decide go / no-go |
| soak (memory leak) | qa, lab | lab | release candidate | prove the limits, protect the user, decide go / no-go |
| smoke | qa, dev, delivery | lab | release candidate | decide go / no-go, limit blast radius |
| staged over-the-air update | dev, qa, lab | lab | release candidate | recover the update, decide go / no-go, limit blast radius |
| old firmware (mmai 3.x) | qa, lab | lab | release candidate | carry old firmware, stop regression |
| fleet health | sre | factory (watch only) | after ship, once reporting exists | watch production, show quality |

### References

- [Vention Software Reliability Challenge.pdf](Vention%20Software%20Reliability%20Challenge.pdf)
- [MachineMotion AI product page](https://vention.io/machinemotion-ai)
- [MachineMotion AI controller datasheet](https://docs.vention.com/docs/machinemotion-ai-controller-datasheet)
- [Release notes](https://docs.vention.com/docs/release-notes) ([markdown index](https://docs.vention.com/docs/release-notes.md))
- [October 2026 MachineMotion firmware v3.5.3](https://docs.vention.com/docs/oct-2026-machinemotion-firmware-v3-5-3)
- [MachineMotion v2 ecosystem end of life](https://docs.vention.com/docs/machinemotion-v2-ecosystem-end-of-sales) (page title says End of Life; the URL says end-of-sales)
- [TCP socket API for MachineMotion](https://docs.vention.com/docs/en/application-programming-interface-low-level-sockets-for-machinemotion)
- [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Integration Test](https://martinfowler.com/bliki/IntegrationTest.html)
- [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)
- [When Software Meets Hardware](https://www.martinfowler.com/articles/software-meets-hardware.html)

## Software quality process

Vention keeps one quality bar and two release rhythms. Cloud can ship every two weeks and roll back. Edge firmware goes onto customer machines that cannot roll back mid-shift, so a firmware build is offered only after a lab with real controllers passes it.

### Both targets

Split the work at the configuration handoff. Machine Builder generates the configuration in the cloud. The controller consumes it on the edge. Cloud quality runs on the two-week cycle. Edge quality runs on the firmware release candidate.

### Software and hardware each cycle

Every firmware release candidate stays in the lab until real controllers pass it, and until the Machine Builder configuration is checked on that hardware. The emulator covers scale. A full motor chain is a lab check. MachineMotion AI 3.x that is still in the field stays in that check. The factory is watch only.

### How you measure

Use a small set of numbers on each target, and set the thresholds only after you have a baseline. Cloud: continuous-integration pass rate, flake rate, web vitals, and post-deploy smoke. Edge: EtherCAT link-loss during soak, memory growth, update success and resume rate, and pass rate across the firmware versions. Count escaped defects for both.

### How you track it

One dashboard. Start with what you already have: Allure and continuous integration for Cloud, and lab soak and hardware-in-the-loop for Edge. Add firmware lag and link health after a controller can report its version and its link. Until then, fleet health is a watch, not a gate.

### Findings back into development

Every escaped defect and every field defect gets an owner, then becomes a regression test, a lab scenario, or a change to the release gate. The EtherCAT loss becomes a fault-injection and soak case. A short review after the release updates the test strategy and the checklist. The ticket stays linked to the test that now guards it.

### Find, sort, and close

Catch cheap failures before merge: unit tests, contract tests, the configuration handoff, and the emulator. Leave motion, leaks, and update recovery for the lab release candidate. Sort each defect by blast radius: a stopped line or a safety hazard on the edge is the top class, because that machine cannot roll back. A named owner closes it, and Delivery sees the open list at the go or no-go.
