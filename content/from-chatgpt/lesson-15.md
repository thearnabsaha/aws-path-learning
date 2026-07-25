# Lesson 15 — Amazon SQS, Amazon SNS & Amazon EventBridge (Complete Deep Dive)

> **Goal:** By the end of this lesson, you'll understand event-driven architecture, asynchronous communication, decoupling, message queues, publish-subscribe systems, event buses, retries, dead-letter queues, ordering, idempotency, and how modern AWS applications communicate internally.

If you ask senior backend engineers what changed software architecture the most in the last decade, many will answer:

> **"Moving from synchronous systems to event-driven systems."**

This lesson explains exactly why.

---

# Learning Objectives

After this lesson, you should be able to:

- Why are queues needed?
- What is asynchronous communication?
- What is decoupling?
- What is Amazon SQS?
- Standard Queue vs FIFO Queue
- Visibility Timeout
- Long Polling
- Dead Letter Queue (DLQ)
- Message Retention
- What is Amazon SNS?
- What is Pub/Sub?
- What is Fan-Out?
- What is EventBridge?
- SNS vs SQS vs EventBridge
- Real production architectures
- Common interview questions

---

# Chapter 1 — The Biggest Problem in Distributed Systems

Imagine you're building Amazon.

A customer clicks:

```text
Buy Now
```

What happens?

Many beginners imagine:

```text
User

↓

Order Service

↓

Done
```

Reality is very different.

When someone buys one phone, dozens of systems may need to react.

- Payment
- Inventory
- Invoice
- Warehouse
- Shipping
- Email
- SMS
- Analytics
- Fraud Detection
- Loyalty Points

One click triggers many independent operations.

---

# Synchronous Architecture

Suppose Order Service directly calls every service.

```text
User
  │
  ▼
Order Service
   ├── Payment
   ├── Inventory
   ├── Shipping
   ├── Email
   ├── Analytics
   └── Invoice
```

Everything happens immediately.

Sounds good.

But let's see what happens when one service fails.

---

Suppose Email Service is down.

Now:

```text
Order

↓

Payment ✓

↓

Inventory ✓

↓

Shipping ✓

↓

Email ✗

↓

Order Failed
```

Wait...

The customer already paid.

Inventory was reduced.

But the API returned an error because email failed.

Bad design.

---

# This Problem is Called Tight Coupling

Every service depends on every other service.

```text
A → B → C → D → E
```

If one breaks...

Everything may break.

This is called:

**Tightly Coupled Architecture**

---

# Modern Solution

Modern systems don't wait.

Instead:

```text
Order Created

↓

Message Queue

↓

Everyone processes independently
```

Now every service works at its own speed.

---

# Chapter 2 — Synchronous vs Asynchronous

## Synchronous

Think of a phone call.

You call someone.

You must wait.

```text
You

↓

Call

↓

Wait

↓

Response
```

---

## Asynchronous

Think of WhatsApp.

```text
Send Message

↓

Continue Living

↓

Reply Comes Later
```

You don't wait.

---

Cloud architecture prefers asynchronous communication whenever possible.

---

# Chapter 3 — What is Amazon SQS?

SQS stands for:

**Simple Queue Service**

Imagine a physical queue.

```text
Customer

↓

Ticket

↓

Queue

↓

Counter
```

Computers do the same thing.

Instead of customers:

Messages.

---

# Basic Architecture

```text
Application A

↓

SQS Queue

↓

Application B
```

Application A doesn't know:

- when
- where
- how

Application B processes the message.

This is called:

**Decoupling**

---

# Chapter 4 — Decoupling

Imagine:

Without SQS

```text
Order Service

↓

Email Service
```

If Email crashes...

Order may fail.

With SQS

```text
Order Service

↓

SQS

↓

Email Worker
```

Order finishes.

Email can happen later.

This is why queues are everywhere.

---

# Chapter 5 — Producer and Consumer

SQS has two main actors.

Producer

```text
Creates Message
```

Consumer

```text
Reads Message
```

Architecture:

```text
Producer

↓

Queue

↓

Consumer
```

Producer and consumer never talk directly.

---

# Chapter 6 — Message Lifecycle

Imagine:

```text
Place Order
```

Producer sends:

```json
{
 "OrderId":123,
 "Amount":500
}
```

Flow:

```text
Producer

↓

Queue

↓

Consumer

↓

Delete Message
```

Notice:

The consumer **must delete** the message after successful processing.

Otherwise it may appear again.

---

# Chapter 7 — Standard Queue

Default queue.

Advantages:

- Nearly unlimited throughput
- Best performance
- Highly scalable

Characteristics:

- At-least-once delivery
- Best-effort ordering

Important:

A message might occasionally be delivered more than once.

Applications should therefore be **idempotent** (safe to process duplicates).

---

# What is Idempotency?

Suppose the same payment message arrives twice.

Bad implementation:

```text
Receive Message

↓

Charge ₹500

↓

Receive Again

↓

Charge ₹500 Again
```

Customer pays twice.

Instead:

```text
Check Order ID

↓

Already Processed?

↓

Yes

↓

Ignore
```

Same result.

No duplicate charge.

---

# Chapter 8 — FIFO Queue

FIFO means:

**First In, First Out**

Exactly like standing in line.

```text
A

B

C
```

Output:

```text
A

B

C
```

Never:

```text
C

A

B
```

---

FIFO guarantees:

- Ordered processing
- Exactly-once message deduplication within the supported deduplication model

Trade-off:

Lower throughput than Standard queues.

---

# When Should You Use FIFO?

Good examples:

- Banking
- Financial transactions
- Inventory updates
- Order processing
- Airline reservations

Wrong example:

Website logs.

Ordering doesn't matter.

---

# Chapter 9 — Visibility Timeout

One of the most important SQS concepts.

Suppose:

Consumer receives a message.

Should another consumer receive it immediately?

No.

Instead:

```text
Queue

↓

Consumer Reads

↓

Hidden Temporarily

↓

Processing

↓

Delete
```

The message becomes invisible during the visibility timeout.

---

What if the consumer crashes?

```text
Read Message

↓

Crash

↓

Timeout Expires

↓

Message Reappears
```

Another worker can process it.

No message is permanently lost.

---

# Chapter 10 — Long Polling

Without Long Polling:

Consumer asks:

```text
Any Messages?

↓

No

↓

Any Messages?

↓

No

↓

Any Messages?
```

Many unnecessary requests.

---

With Long Polling:

```text
Wait Up To 20 Seconds

↓

Message Arrives

↓

Return Immediately
```

Benefits:

- Fewer empty responses
- Lower cost
- Better efficiency

---

# Chapter 11 — Message Retention

Messages don't stay forever.

Retention can be configured (up to the service limit).

Example:

```text
Message

↓

Stored

↓

Consumer Offline

↓

Comes Back

↓

Processes Message
```

After the retention period expires, unprocessed messages are removed.

---

# Chapter 12 — Dead Letter Queue (DLQ)

Suppose one message is corrupted.

```text
Queue

↓

Worker

↓

Fail

↓

Retry

↓

Fail

↓

Retry

↓

Fail
```

Should AWS retry forever?

No.

After a configured maximum receive count:

```text
Main Queue

↓

Too Many Failures

↓

Dead Letter Queue
```

Developers inspect the DLQ later.

---

DLQs are extremely common in production.

---

# Chapter 13 — Amazon SNS

SNS stands for:

**Simple Notification Service**

Unlike SQS...

SNS is **one-to-many**.

---

Imagine a teacher.

```text
Teacher

↓

Announcement

↓

Entire Classroom
```

Everyone hears it.

---

Architecture:

```text
SNS Topic

↓

Subscriber A

Subscriber B

Subscriber C
```

One publish.

Many receivers.

---

# Chapter 14 — Topics

SNS doesn't send directly.

It publishes to a:

**Topic**

Example:

```text
Order Created Topic
```

Subscribers:

- Email Service
- SMS Service
- Analytics
- Warehouse

All receive the same event.

---

# Chapter 15 — SNS Subscribers

Subscribers can be:

- Lambda
- SQS
- Email
- SMS
- HTTPS endpoints

Example:

```text
SNS

↓

Lambda

↓

SQS

↓

Email
```

One message.

Multiple destinations.

---

# Chapter 16 — Fan-Out Pattern

One of the most popular architectures.

```text
Order Created

↓

SNS

↓

Queue A

Queue B

Queue C
```

Each queue has its own workers.

Benefits:

- Independent scaling
- Independent retries
- Better fault isolation

This pattern is called:

**Fan-Out**

---

# Chapter 17 — What is EventBridge?

SNS broadcasts messages.

EventBridge routes **events**.

Difference:

SNS:

> Deliver this message.

EventBridge:

> When this event happens, send it to the right targets.

---

Architecture:

```text
EC2 Started

↓

EventBridge

↓

Lambda
```

Or:

```text
S3 Upload

↓

EventBridge

↓

Step Functions

↓

Slack Notification

↓

Analytics
```

---

# Chapter 18 — Event Bus

Everything enters an Event Bus.

```text
Events

↓

Event Bus

↓

Rules

↓

Targets
```

Think of it as an airport.

Events arrive.

Rules decide where they go.

---

# Chapter 19 — Rules

Suppose:

```text
EC2 Instance Created
```

Rule:

```text
If Source = EC2

↓

Invoke Lambda
```

Or:

```text
If S3 Upload

↓

Start Image Processing
```

Rules filter events before routing them.

---

# Chapter 20 — Custom Events

Applications can publish their own events.

Example:

```json
OrderShipped
```

Now EventBridge can route it.

Example:

```text
OrderShipped

↓

Analytics

↓

CRM

↓

Email
```

No service needs to know about the others.

---

# Chapter 21 — SQS vs SNS vs EventBridge

This is one of the most common interview questions.

| SQS | SNS | EventBridge |
|------|-----|-------------|
| Queue | Pub/Sub | Event Router |
| One consumer per message | Many subscribers | Routes events by rules |
| Messages wait | Push immediately | Rule-based routing |
| Decoupling | Broadcasting | Event-driven workflows |

---

# Chapter 22 — Production Architecture

Suppose a customer buys something.

```text
User

↓

API

↓

Order Service

↓

SNS

↓

Inventory Queue

↓

Inventory Worker

↓

Shipping Queue

↓

Shipping Worker

↓

Email Queue

↓

Email Worker

↓

Analytics Queue

↓

Analytics Worker
```

Notice:

Every service is independent.

---

# Chapter 23 — EventBridge + Lambda

Cloud-native example:

```text
S3 Upload

↓

EventBridge

↓

Lambda

↓

Resize Image

↓

Store Thumbnail
```

No polling.

No cron jobs.

Everything reacts to events.

---

# Chapter 24 — Best Practices

- Make consumers idempotent.
- Use DLQs for failed messages.
- Prefer asynchronous communication when immediate responses aren't required.
- Use Standard queues unless strict ordering is necessary.
- Use FIFO only when ordering or deduplication is essential.
- Use Long Polling to reduce empty requests.
- Keep messages reasonably small and place large payloads in S3 if needed.
- Use SNS fan-out to decouple downstream services.
- Use EventBridge when routing events based on rules or integrating AWS services.

---

# Chapter 25 — Common Mistakes

❌ Calling every service synchronously.

❌ Forgetting to delete processed SQS messages.

❌ Not configuring a Dead Letter Queue.

❌ Assuming Standard queues guarantee ordering.

❌ Using FIFO everywhere even when unnecessary.

❌ Writing non-idempotent consumers.

---

# Chapter 26 — Interview Questions

### Q1. What is Amazon SQS?

A fully managed message queue service used to decouple applications.

---

### Q2. Difference between Standard and FIFO queues?

| Standard | FIFO |
|----------|------|
| Maximum throughput | Ordered processing |
| At-least-once delivery | Ordered with deduplication support |
| Best-effort ordering | First-In, First-Out |

---

### Q3. What is Visibility Timeout?

The period during which a received message is hidden from other consumers while it is being processed.

---

### Q4. What is a Dead Letter Queue?

A queue that stores messages that repeatedly fail processing after the configured retry limit.

---

### Q5. What is SNS?

A managed publish-subscribe messaging service that delivers messages from one publisher to multiple subscribers.

---

### Q6. What is Fan-Out?

Publishing one message to multiple independent subscribers, often using SNS with multiple SQS queues.

---

### Q7. What is EventBridge?

A serverless event bus that routes events to targets based on configurable rules.

---

### Q8. When should you use EventBridge instead of SNS?

When routing events based on content, integrating many AWS services, or building event-driven workflows with filtering rules.

---

### Q9. Why is idempotency important?

Because distributed systems can deliver duplicate messages, and processing them multiple times should not produce incorrect results.

---

### Q10. Why are asynchronous systems more resilient?

Because producers and consumers are decoupled. A temporary failure in one consumer doesn't necessarily stop the entire workflow.

---

# Hands-on Lab

1. Create an SQS Standard Queue.
2. Send several test messages through the AWS Console or AWS CLI.
3. Receive and delete messages manually.
4. Configure a Dead Letter Queue and attach it to the main queue.
5. Create an SNS Topic.
6. Subscribe the SQS queue to the SNS Topic.
7. Publish a message to the topic and observe it arriving in the queue.
8. Create an EventBridge rule that reacts to an S3 object upload and invokes a Lambda function.
9. Upload a file to the S3 bucket and verify the Lambda execution in CloudWatch Logs.

---

# Final Mental Model

If you remember only one diagram from this lesson, remember this:

```text
                    Customer
                        │
                        ▼
                  Order Service
                        │
              "Order Created"
                        │
                        ▼
                   SNS Topic
        ┌───────────┼───────────┐
        ▼           ▼           ▼
 Inventory Q   Shipping Q   Email Q
      │             │            │
      ▼             ▼            ▼
 Inventory     Shipping      Email Worker
   Worker        Worker

                 ▲
                 │
      AWS Services (S3, EC2, RDS, etc.)
                 │
                 ▼
             EventBridge
                 │
           Rules & Filters
                 │
                 ▼
        Lambda / Step Functions / Other Targets
```

The core idea is:

- **SQS** is for **reliable asynchronous processing** between producers and consumers.
- **SNS** is for **broadcasting the same message** to multiple subscribers.
- **EventBridge** is for **routing events intelligently** across AWS services and custom applications.

Mastering these three services will help you understand the architecture behind many modern microservices and serverless systems.
