Excellent. You're no longer just learning how to **build** applications—you'll now learn how to **operate** them.

One of the biggest differences between junior and senior cloud engineers is this:

> Juniors ask, "How do I deploy it?"
>
> Seniors ask, "How do I know it's healthy? How do I debug it at 2 AM?"

That's what this lesson is about.

---

# Lesson 10: Amazon CloudWatch & AWS CloudTrail

## Goal

By the end of this lesson, you'll understand:

- Monitoring vs Logging vs Auditing
- Amazon CloudWatch
- Metrics
- Logs
- Alarms
- Dashboards
- Events
- CloudTrail
- Troubleshooting production systems

---

# Imagine You're Running Netflix

Suppose your website suddenly becomes slow.

Customers complain.

The first question is:

> **Why?**

You need visibility into what's happening.

AWS provides two major services:

- **CloudWatch** → Monitors the health and performance of resources.
- **CloudTrail** → Records who did what in your AWS account.

---

# Monitoring vs Logging vs Auditing

These terms are often confused.

| Term | Purpose |
|--------|----------|
| Monitoring | Is the system healthy right now? |
| Logging | What exactly happened? |
| Auditing | Who performed an action and when? |

Think of a hospital:

- Heart monitor → Monitoring
- Doctor's notes → Logs
- CCTV footage → Audit

---

# What is CloudWatch?

CloudWatch is AWS's monitoring service.

It collects information like:

- CPU utilization
- Memory (requires additional setup on EC2)
- Network traffic
- Disk usage (requires additional setup on EC2)
- Request counts
- Errors
- Latency

---

# Metrics

A **metric** is a numerical measurement over time.

Example:

```text
CPU Usage

10%

25%

70%

95%
```

CloudWatch stores these values so you can monitor trends.

---

# Common EC2 Metrics

| Metric | Meaning |
|----------|---------|
| CPUUtilization | CPU usage percentage |
| NetworkIn | Data received |
| NetworkOut | Data sent |
| DiskReadOps | Disk read operations |
| DiskWriteOps | Disk write operations |

---

# Example

Your web server suddenly reaches:

```text
CPU = 98%
```

CloudWatch detects this.

Now you can:

- Investigate the cause
- Trigger an alarm
- Scale the application (if configured)

---

# CloudWatch Dashboard

Instead of checking each server separately:

```text
EC2-1

EC2-2

EC2-3
```

CloudWatch can display everything on one dashboard.

```text
Dashboard

CPU

Memory

Network

Errors

Latency
```

This gives you a centralized view of your application's health.

---

# CloudWatch Logs

Metrics tell you **something is wrong**.

Logs tell you **what went wrong**.

Example application log:

```text
10:02 User Login

10:03 Database Timeout

10:04 Payment Failed
```

These logs can be sent to CloudWatch Logs for searching and analysis.

---

# EC2 Logs

Applications often write logs like:

```text
INFO User Logged In

INFO Payment Started

ERROR Database Connection Failed
```

CloudWatch Logs stores these records centrally.

---

# Lambda Logs

Lambda automatically writes logs to CloudWatch Logs.

Example:

```text
Function Started

Processing Order

Order Completed
```

This makes debugging much easier.

---

# Searching Logs

Imagine millions of log lines.

Instead of manually reading them, you can search for keywords such as:

```text
ERROR

Timeout

Payment Failed
```

CloudWatch Logs Insights also lets you query logs using a dedicated query language.

---

# CloudWatch Alarm

Suppose:

CPU exceeds 80%.

Create an alarm:

```text
CPU > 80%

↓

CloudWatch Alarm

↓

Notify Admin
```

Now you don't need to watch dashboards all day.

---

# Alarm Actions

An alarm can trigger actions such as:

- Sending a notification (using Amazon SNS)
- Triggering Auto Scaling
- Invoking a Lambda function (indirectly via supported integrations)

Example:

```text
CPU High

↓

Launch Another EC2
```

---

# Example Production Scenario

```text
Traffic Spike

↓

CPU = 95%

↓

Alarm

↓

Auto Scaling

↓

New EC2 Created
```

Everything can happen automatically.

---

# CloudWatch Events / EventBridge

Sometimes you don't want to monitor a metric.

You want something to happen at a certain time.

Example:

Every night at 2 AM:

```text
2:00 AM

↓

Run Lambda

↓

Create Backup
```

This scheduling capability is now provided through **Amazon EventBridge**, which evolved from CloudWatch Events.

---

# What is CloudTrail?

CloudTrail answers a different question.

Instead of:

> "How healthy is my server?"

It answers:

> "Who changed my AWS account?"

---

# Example

Suppose someone deletes an S3 bucket.

Who did it?

CloudTrail records:

```text
User: Arnab

Action: DeleteBucket

Time: 10:43 AM

IP Address: xx.xx.xx.xx
```

---

# CloudTrail Records

CloudTrail logs AWS API activity such as:

- Create EC2
- Delete EC2
- Create IAM User
- Modify Security Group
- Delete S3 Bucket

It provides an audit trail for your AWS account.

---

# Real Example

Manager asks:

> "Who deleted the production database?"

CloudTrail tells you:

```text
User

Action

Time

Source IP
```

This is invaluable for troubleshooting and compliance.

---

# CloudTrail vs CloudWatch

| CloudWatch | CloudTrail |
|-------------|------------|
| Monitors system health | Records AWS API activity |
| CPU, memory, latency | User actions |
| Metrics & logs | Audit logs |
| Helps detect operational issues | Helps investigate account changes |

---

# Example Architecture

```text
                  Internet
                      │
                      ▼
                 Load Balancer
                      │
                      ▼
                     EC2
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
CloudWatch Metrics          CloudWatch Logs
        │
        ▼
     Alarms
        │
        ▼
 Notifications / Auto Scaling

CloudTrail (separately records AWS API actions)
```

---

# Production Example

Suppose customers report:

> Website is slow.

Investigation:

```text
CloudWatch

↓

CPU = 99%

↓

Logs

↓

Database Timeout

↓

CloudTrail

↓

No recent configuration changes
```

You now know it's a performance problem, not an unauthorized change.

---

# Hands-on Lab

If you have an AWS account:

1. Launch an EC2 instance.
2. Open CloudWatch and view its CPUUtilization metric.
3. Create a CloudWatch dashboard.
4. Create an alarm for CPU > 70%.
5. SSH into the instance and generate CPU load (or use a simple stress tool).
6. Watch the alarm state change.
7. Open CloudTrail and review recent API events (such as launching the EC2 instance).

---

# Interview Questions

1. What is Amazon CloudWatch?
2. What is a metric?
3. What is a CloudWatch alarm?
4. What is the difference between metrics and logs?
5. What is AWS CloudTrail?
6. What is the difference between CloudTrail and CloudWatch?
7. Why are dashboards useful?
8. How would you investigate a slow production application?

---

# AWS Services You've Mastered

| Service | Purpose |
|---------|---------|
| IAM | Identity & Access Management |
| EC2 | Virtual servers |
| S3 | Object storage |
| VPC | Networking |
| RDS | Relational databases |
| ELB | Load balancing |
| Auto Scaling | Automatic scaling |
| Lambda | Serverless compute |
| DynamoDB | NoSQL database |
| CloudWatch | Monitoring and logging |
| CloudTrail | Auditing AWS API activity |

---

# Final Architecture So Far

```text
                  Internet
                      │
             Application Load Balancer
                      │
           Auto Scaling Group (EC2)
            │                 │
            ├─────────┬───────┤
            ▼         ▼       ▼
         Amazon RDS DynamoDB  S3
              │               │
              └──────┬────────┘
                     ▼
                CloudWatch
                     │
                  Alarms
                     │
                 Notifications

CloudTrail records all AWS API actions across the account.
```

---

## Next Lesson: Docker & Amazon ECS

This is where you'll move from deploying applications directly onto EC2 to using **containers**, the standard deployment model in modern cloud environments.

You'll learn:

- What Docker is
- Images vs Containers
- Dockerfiles
- Volumes
- Networking
- Amazon ECS
- Amazon ECR
- ECS Fargate
- Containers vs Virtual Machines
- How production microservices are deployed on AWS

This is one of the most valuable skills for cloud engineers, DevOps engineers, and backend developers.
