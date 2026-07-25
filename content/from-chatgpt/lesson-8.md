# Lesson 8: AWS Lambda (Serverless Computing)

This lesson shifts from always-on servers to serverless compute. Lambda is a major mindset change: run code in response to events without managing the underlying machines.

By the end of this lesson, you will understand:

- What serverless means
- What Lambda is
- How Lambda works
- Events and triggers
- API Gateway
- Execution lifecycle
- Timeouts and memory
- Cold starts
- IAM roles for Lambda
- When to use Lambda vs EC2

---
# The Old Way

Suppose someone visits your website.

```text
User
   │
   ▼
EC2 Server
   │
   ▼
Application Code
```

Your EC2 server runs 24×7.

Even if nobody visits your website at 3 AM...

You're still paying for the server.

---

# The Serverless Way

With Lambda:

```text
User

↓

AWS Lambda

↓

Your Code

↓

Response
```

No server to manage.

No operating system to patch.

No EC2 instance to monitor.

AWS handles the infrastructure behind the scenes.

> **Important:** "Serverless" doesn't mean there are no servers. It means **you don't manage them**—AWS does.

---

# What is Lambda?

AWS Lambda is a service that runs your code **only when it's triggered**.

Imagine a coffee machine.

Traditional server:

```text
Coffee Machine

ON

24 Hours
```

Lambda:

```text
Button Pressed

↓

Coffee Machine Turns On

↓

Makes Coffee

↓

Turns Off
```

You only use resources when work needs to be done.

---

# Event-Driven Computing

Lambda runs because **something happens**.

That "something" is called an **event**.

Examples:

- A user uploads a file to S3.
- Someone sends an HTTP request.
- A scheduled time arrives.
- A message appears in a queue.
- A database record changes (depending on the service and integration).

---

# Common Lambda Triggers

| Trigger | Example |
|----------|----------|
| API Gateway | User opens a web API |
| S3 | File uploaded |
| EventBridge | Scheduled task |
| SQS | Message arrives |
| SNS | Notification published |
| DynamoDB Streams | Table data changes |

---

# Example: Image Processing

User uploads:

```text
photo.jpg
```

Flow:

```text
User

↓

S3 Bucket

↓

Lambda Trigger

↓

Resize Image

↓

Save to S3
```

No EC2 server required.

---

# Example: Sending Emails

```text
Customer Places Order

↓

Lambda

↓

Send Email
```

The function runs for a few seconds and then finishes.

---

# How Lambda Executes

```text
Event

↓

Lambda Starts

↓

Run Code

↓

Return Result

↓

Stop
```

You pay for the execution time, not for idle time.

---

# Supported Languages

Lambda supports several runtimes, including:

- Python
- Java
- Node.js
- C#
- Go
- Ruby

Since you work with C#, here's a simple example:

```csharp
public string FunctionHandler(string input)
{
    return $"Hello {input}";
}
```

AWS invokes the handler when the function is triggered.

---

# Function Handler

Every Lambda function has an **entry point**, called a **handler**.

Think of it as the function AWS calls first.

```text
Event

↓

Handler

↓

Your Code
```

---

# Execution Time

A Lambda function doesn't run forever.

It starts:

```text
Request

↓

Start

↓

Execute

↓

Stop
```

You configure a maximum timeout (up to 15 minutes).

If the function exceeds that limit, AWS stops it.

---

# Memory

When creating a Lambda function, you choose its memory allocation.

Examples:

- 128 MB
- 512 MB
- 1024 MB
- Higher values are available

More memory generally also gives the function more CPU resources.

---

# Stateless

Lambda is **stateless**.

This means:

```text
Request 1

↓

Lambda

↓

Ends
```

Next request:

```text
Request 2

↓

New Execution
```

Don't assume data from one execution will always be available in the next.

Persistent data should be stored in services like:

- S3
- RDS
- DynamoDB

---

# IAM Role

A Lambda function often needs permission to access AWS services.

Example:

```text
Lambda

↓

Read S3

↓

Allowed?
```

Permissions come from an **IAM role** attached to the function.

Without the correct role:

```text
Access Denied
```

---

# API Gateway

Suppose you want people to call your Lambda function over HTTP.

You use **API Gateway**.

```text
Browser

↓

API Gateway

↓

Lambda

↓

Response
```

Example:

```
GET /users/123
```

API Gateway invokes Lambda and returns the result.

---

# Traditional API vs Serverless API

Traditional:

```text
Browser

↓

Load Balancer

↓

EC2

↓

Application

↓

Database
```

Serverless:

```text
Browser

↓

API Gateway

↓

Lambda

↓

Database
```

Fewer infrastructure components for many workloads.

---

# Cold Start

If a Lambda function hasn't been used for some time:

```text
First Request

↓

AWS Starts Environment

↓

Run Code
```

That startup delay is called a **cold start**.

Later requests often reuse the existing environment:

```text
Second Request

↓

Already Warm

↓

Runs Faster
```

Cold starts are usually small but can matter for latency-sensitive applications.

---

# Concurrency

Imagine:

10,000 users arrive simultaneously.

Lambda can create multiple execution environments to process many requests in parallel, subject to your account's concurrency limits.

Traditional server:

```text
One Server

↓

Queue Builds
```

Lambda:

```text
Request 1

↓

Lambda 1

Request 2

↓

Lambda 2

Request 3

↓

Lambda 3
```

---

# Lambda Pricing

With EC2:

```
Server Running

↓

Pay
```

With Lambda:

```
Function Runs

↓

Pay

Function Stops

↓

No Compute Charges While Idle
```

Lambda pricing is based primarily on the number of requests and execution duration.

---

# Lambda vs EC2

| Lambda | EC2 |
|----------|------|
| No server management | You manage the server |
| Event-driven | Always available while running |
| Automatic scaling | Configure scaling with Auto Scaling |
| Short-lived execution | Long-running processes supported |
| Pay per execution | Pay while the instance runs |

---

# When to Use Lambda

Good choices:

- REST APIs
- File processing
- Scheduled jobs
- Notifications
- Data transformations
- Lightweight automation

Less suitable for:

- Applications needing more than 15 minutes per execution
- Long-running background services
- Software requiring full control of the operating system

---

# Real-World Example

A résumé upload service:

```text
User Uploads Resume

↓

S3

↓

Lambda

↓

Extract Text

↓

Store Metadata in Database

↓

Notify Recruiter
```

No EC2 servers needed.

---

# Hands-on Lab

Try this in your AWS account:

1. Create a Lambda function using Python or C#.
2. Write a simple function that returns `"Hello, AWS!"`.
3. Test it from the Lambda console.
4. Attach an IAM role with permission to write logs.
5. View execution logs in CloudWatch.
6. (Optional) Connect it to API Gateway and call it from your browser.

---

# Interview Questions

1. What does "serverless" mean?
2. What is AWS Lambda?
3. What can trigger a Lambda function?
4. Why does Lambda need an IAM role?
5. What is a cold start?
6. Why is Lambda considered stateless?
7. When would you choose Lambda instead of EC2?
8. What are the execution time limits of Lambda?

---

# Architecture So Far

```text
                   Internet
                        │
                  API Gateway
                        │
                     Lambda
                  ┌─────┴─────┐
                  ▼           ▼
                Amazon S3   Amazon RDS
```

Or, for a traditional web application:

```text
Internet
    │
Application Load Balancer
    │
Auto Scaling Group (EC2)
    ├──────────┐
    ▼          ▼
 Amazon RDS   Amazon S3
```

A key AWS design skill is knowing **when to use serverless** and **when to use traditional servers**.

---

# What You've Learned

| Service | Purpose |
|---------|---------|
| IAM | Identity & access management |
| EC2 | Virtual machines |
| S3 | Object storage |
| VPC | Networking |
| RDS | Managed relational databases |
| ELB | Traffic distribution |
| Auto Scaling | Automatic EC2 scaling |
| Lambda | Event-driven serverless compute |

## Next Lesson: Amazon DynamoDB

You'll learn AWS's fully managed **NoSQL database**, including:

- NoSQL vs SQL
- Tables, items, and attributes
- Partition keys
- Read/write capacity
- Global Secondary Indexes (GSIs)
- DynamoDB Streams
- TTL (Time to Live)
- When to choose DynamoDB instead of RDS

By the end of that lesson, you'll understand the two major database models used in AWS: **relational (RDS)** and **NoSQL (DynamoDB)**.
