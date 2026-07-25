# Lesson 18 — AWS Cost Explorer, AWS Budgets & Cost Optimization (Complete Deep Dive)

> **Goal:** By the end of this lesson, you'll understand exactly how AWS charges you, how enterprises monitor cloud spending, how Cost Explorer works, how AWS Budgets prevent bill surprises, what Savings Plans and Reserved Instances are, how cost allocation works, and how experienced cloud engineers optimise AWS bills.

One of the biggest misconceptions beginners have is:

> **"Cloud is cheaper."**

That's not true.

The correct statement is:

> **"Cloud lets you pay only for what you use—but if you design poorly, it can become very expensive."**

Many startups have accidentally spent **thousands or even millions of pounds/dollars** because of poor cloud cost management.

Understanding AWS pricing is a critical skill for Cloud Engineers, DevOps Engineers, and Solutions Architects.

---

# Learning Objectives

After this lesson, you'll understand:

- AWS pricing philosophy
- Pay-as-you-go
- Free Tier
- Cost Explorer
- AWS Budgets
- Cost Anomaly Detection
- Cost Allocation Tags
- Savings Plans
- Reserved Instances
- Spot Instances
- On-Demand pricing
- Rightsizing
- Storage optimisation
- Network cost optimisation
- Real production cost strategies

---

# Chapter 1 — Why Cloud Pricing Exists

Imagine you're building a data centre.

You buy:

- Servers
- Switches
- Storage
- Cooling
- UPS
- Power generators
- Internet connections

Even if no customers use your application...

You still pay.

Cloud changes that.

Instead of buying hardware:

```text
Need Compute

↓

Rent Compute

↓

Stop Using

↓

Stop Paying
```

---

# AWS Pricing Philosophy

AWS follows:

> **Pay for what you use.**

Not:

> Pay for what you might use.

Example:

Traditional Data Centre

```text
Buy 20 Servers

↓

Use 5

↓

Still Pay for 20
```

AWS

```text
Launch 5 EC2

↓

Need 10?

↓

Launch 5 More

↓

Need 2?

↓

Terminate 8
```

Billing changes automatically.

---

# Chapter 2 — What Does AWS Charge For?

Almost every AWS service follows one or more pricing models:

- Compute time
- Storage
- Requests
- Data transfer
- Provisioned capacity
- Network usage

Examples:

| Service | Charged For |
|----------|-------------|
| EC2 | Running time |
| S3 | GB stored + requests |
| Lambda | Invocations + execution duration |
| DynamoDB | Read/write capacity or on-demand requests |
| CloudFront | Data transfer + requests |
| Route 53 | Hosted zones + DNS queries |
| RDS | Instance hours + storage + backups |

---

# Example EC2 Billing

Suppose:

```text
t3.micro

Runs

10 Hours
```

You pay only for those 10 hours.

If you terminate it:

Billing stops for the compute instance (though attached resources like EBS volumes may continue to incur charges if retained).

---

# Chapter 3 — The AWS Free Tier

AWS offers a Free Tier to help you learn.

Examples include eligible usage such as:

- Limited EC2 usage
- S3 storage
- Lambda invocations
- DynamoDB capacity

Important:

Free Tier has limits.

If you exceed them:

Billing starts.

---

# Common Beginner Mistake

Launch:

```text
Large EC2

↓

Forget It

↓

Go On Holiday

↓

Huge Bill
```

Always stop or terminate resources you no longer need.

---

# Chapter 4 — Cost Explorer

Imagine your company spends:

£12,000 per month.

Your manager asks:

> "Where is the money going?"

Cost Explorer answers that.

It provides visual reports showing spending over time.

---

Example view:

```text
Monthly Cost

EC2

S3

RDS

CloudFront

Lambda
```

You can identify the largest contributors.

---

# Filtering Costs

You can filter by:

- Service
- Linked account
- Region
- Usage type
- Tags
- Time range

Example:

```text
Only

London Region

Last 30 Days
```

---

# Forecasting

Cost Explorer can estimate future spending based on historical usage.

Example:

```text
Current Spend

↓

Projected Month-End Spend
```

This helps finance teams plan budgets.

---

# Chapter 5 — AWS Budgets

Cost Explorer tells you:

> What happened.

Budgets tell you:

> What is happening.

Suppose you create:

```text
Monthly Budget

£500
```

If spending reaches:

80%

AWS sends an alert.

If it reaches:

100%

Another alert.

---

Budgets can monitor:

- Cost
- Usage
- Savings Plans utilisation
- Reserved Instance utilisation

---

# Chapter 6 — Cost Anomaly Detection

Imagine:

Normal daily spend:

£50

Today:

£2,000

AWS notices the unusual spike.

```text
Normal Pattern

↓

Unexpected Increase

↓

Alert
```

This helps catch:

- Accidental resource creation
- Misconfigured workloads
- Potential abuse

---

# Chapter 7 — Cost Allocation Tags

Large companies ask:

> Which department spent this money?

Instead of guessing:

Tag resources.

Example:

```text
Project=Website

Team=Engineering

Environment=Production
```

Cost Explorer can group costs by these tags.

---

Example:

```text
Engineering

£30,000

Marketing

£8,000

Finance

£2,000
```

Without tags:

Everything is mixed together.

---

# Chapter 8 — On-Demand Instances

Default pricing.

Launch:

```text
EC2

↓

Run

↓

Pay
```

No commitment.

Advantages:

- Flexible
- No long-term contract
- Good for unpredictable workloads

Disadvantage:

Most expensive option per unit of compute.

---

# Chapter 9 — Reserved Instances (RI)

Suppose you know:

Your database will run for three years.

Instead of paying On-Demand:

Commit to a term.

AWS gives a discount.

Think of it like:

Hotel

One night:

Expensive.

Book for a year:

Cheaper per night.

---

Reserved Instances are best suited to predictable, long-running workloads and primarily apply to certain services like EC2 and RDS.

---

# Chapter 10 — Savings Plans

Savings Plans are the modern evolution of Reserved pricing for many compute services.

Instead of reserving a specific instance in many cases, you commit to a consistent amount of compute spend (for example, a certain amount per hour) over a one- or three-year term.

Benefits:

- More flexibility than many Reserved Instances
- Discounts for committed usage
- Can apply across eligible compute services and instance families (depending on plan type)

For most new workloads, many organisations evaluate Savings Plans before Reserved Instances.

---

# Chapter 11 — Spot Instances

AWS has unused capacity.

Instead of leaving servers idle:

AWS sells spare capacity at deep discounts.

Example:

On-Demand:

£1/hour

Spot:

£0.20/hour

Huge savings.

---

But...

AWS can reclaim Spot capacity with short notice if it needs it.

Good for:

- Batch jobs
- Machine learning training
- Rendering
- Big data processing

Bad for:

Critical databases.

---

# Chapter 12 — Storage Optimisation

Many companies waste money.

Example:

```text
100 TB

Old Logs

Never Accessed
```

Still paying.

Instead:

Move data to cheaper storage classes.

Example:

```text
S3 Standard

↓

S3 Intelligent-Tiering

↓

S3 Glacier

↓

S3 Glacier Deep Archive
```

Lifecycle policies automate this movement.

---

# Chapter 13 — Rightsizing

Imagine:

```text
m7i.8xlarge
```

CPU usage:

5%

Memory:

10%

You're wasting money.

Instead:

```text
t3.medium
```

Same workload.

Much lower cost.

Rightsizing means selecting resources that match actual usage.

---

# Chapter 14 — Auto Scaling Saves Money

Without Auto Scaling:

```text
10 EC2

Running All Night

No Traffic
```

Still paying.

With Auto Scaling:

```text
Night

↓

2 EC2

Morning

↓

10 EC2
```

Lower cost while maintaining performance.

---

# Chapter 15 — Lambda vs EC2 Costs

Suppose:

Application receives:

10 requests/day.

Running an EC2 instance 24/7 is likely wasteful.

Lambda:

Runs only when invoked.

Often much cheaper for intermittent workloads.

But:

Millions of invocations may make EC2, ECS, or EKS more economical depending on the workload.

Always evaluate total cost based on usage.

---

# Chapter 16 — Data Transfer Costs

Many beginners ignore networking.

But data transfer can become one of the largest costs.

Examples:

- CloudFront traffic
- Internet egress
- Cross-region transfers
- NAT Gateway traffic

Inbound data transfer is often free, while outbound transfer typically incurs charges depending on the service and destination.

Designing architectures to minimise unnecessary data movement can significantly reduce costs.

---

# Chapter 17 — NAT Gateway Costs

One of the biggest surprises for beginners.

Private EC2:

Needs Internet.

Uses:

```text
Private EC2

↓

NAT Gateway

↓

Internet
```

NAT Gateway charges for:

- Running time
- Data processed

High traffic through NAT Gateways can become expensive.

Sometimes using VPC Endpoints for AWS services like S3 or DynamoDB can reduce those costs.

---

# Chapter 18 — CloudFront Saves Money

Without CloudFront:

Every user downloads from S3.

With CloudFront:

Most requests are served from edge caches.

Benefits:

- Lower origin load
- Improved performance
- Potential reduction in origin data transfer costs

---

# Chapter 19 — Cost Optimisation Pillar

The AWS Well-Architected Framework includes:

**Cost Optimisation**

Key principles:

- Measure usage
- Eliminate waste
- Choose the right pricing model
- Match supply with demand
- Continuously optimise

Cost optimisation is an ongoing process, not a one-time task.

---

# Chapter 20 — Trusted Advisor

Trusted Advisor reviews your AWS environment and recommends improvements.

Examples:

- Underutilised EC2 instances
- Idle load balancers
- Unused Elastic IPs
- Security improvements
- Service limit checks

Some checks depend on your AWS support plan.

---

# Chapter 21 — Real Production Example

Imagine:

Company:

500 EC2

100 RDS

200 S3 Buckets

Every month:

Cloud team reviews:

- Cost Explorer
- Budgets
- Rightsizing reports
- Savings Plans coverage
- RI utilisation
- Trusted Advisor findings

Optimisation becomes part of the operational routine.

---

# Chapter 22 — Common Cost Mistakes

❌ Leaving EC2 running after testing.

❌ Forgetting unattached EBS volumes.

❌ Not deleting old EBS snapshots.

❌ Public S3 bucket storing unnecessary large files.

❌ Choosing oversized instances.

❌ Not using lifecycle policies.

❌ Ignoring idle load balancers.

❌ Sending large volumes of traffic through unnecessary NAT Gateways.

❌ Forgetting to clean up development resources.

---

# Chapter 23 — Best Practices

- Enable AWS Budgets on every account.
- Review Cost Explorer regularly.
- Tag resources consistently.
- Use Auto Scaling where appropriate.
- Use Savings Plans or Reserved pricing for predictable workloads.
- Use Spot Instances for interruptible jobs.
- Delete unused resources.
- Move old data to cheaper storage classes.
- Continuously rightsize infrastructure.
- Monitor data transfer costs.

---

# Chapter 24 — Interview Questions

### Q1. What is Cost Explorer?

A tool that analyses and visualises AWS spending and usage trends.

---

### Q2. What is AWS Budgets?

A service that monitors spending or usage against thresholds and sends alerts when limits are approached or exceeded.

---

### Q3. Difference between Cost Explorer and Budgets?

| Cost Explorer | AWS Budgets |
|---------------|-------------|
| Analyses historical and forecast costs | Monitors thresholds and sends alerts |
| Reporting and visualisation | Monitoring and notifications |

---

### Q4. What are Savings Plans?

Pricing models that provide discounted rates in exchange for a commitment to a consistent amount of compute usage over one or three years.

---

### Q5. When should you use Spot Instances?

For workloads that can tolerate interruptions, such as batch processing, rendering, and some machine learning jobs.

---

### Q6. What is rightsizing?

Selecting resource sizes that match actual workload requirements to avoid overprovisioning.

---

### Q7. Why are cost allocation tags important?

They allow organisations to attribute cloud spending to projects, departments, or environments for reporting and chargeback.

---

### Q8. What is Cost Anomaly Detection?

A service that identifies unusual spending patterns and alerts you to unexpected cost increases.

---

### Q9. Why is Auto Scaling considered a cost optimisation technique?

Because it automatically adjusts capacity to demand, reducing payment for idle resources while maintaining application performance.

---

### Q10. Why should engineers understand AWS pricing?

Because designing technically correct architectures that are unnecessarily expensive is poor engineering. A good cloud architect balances performance, reliability, security, and cost.

---

# Hands-on Lab

1. Open **AWS Cost Explorer** and review your spending by service for the past month.
2. Create an **AWS Budget** with a monthly threshold (for example, a learning budget).
3. Configure email notifications for 80% and 100% of the budget.
4. Apply consistent tags (`Environment`, `Project`, `Owner`) to a few test resources.
5. Use Cost Explorer to group spending by tags.
6. Launch a small EC2 instance, observe its cost trend, then terminate it.
7. Create an S3 Lifecycle Rule that transitions older objects to a cheaper storage class.
8. Review **Trusted Advisor** recommendations available in your account.

---

# Final Mental Model

If you remember only one diagram from this lesson, remember this:

```text
                  AWS Resources
                        │
     ┌──────────────────┼──────────────────┐
     ▼                  ▼                  ▼
    EC2                S3                 RDS
     │                  │                  │
     └──────────────────┼──────────────────┘
                        ▼
                 AWS Billing Data
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
  Cost Explorer     AWS Budgets   Cost Anomaly Detection
        │               │                │
        ▼               ▼                ▼
 Analyse Spend     Alerts & Limits   Detect Unusual Costs
                        │
                        ▼
                Optimise Infrastructure
          (Rightsizing, Savings Plans,
          Spot, Lifecycle Policies, Tags)
```

The key ideas are:

- **Cost Explorer helps you understand where your money goes.**
- **AWS Budgets helps you avoid unexpected bills.**
- **Savings Plans, Spot Instances, and rightsizing reduce costs.**
- **Good cloud architecture is not just secure and scalable—it is also cost-efficient.**
