# Lesson 9: Amazon DynamoDB (NoSQL Database)

You already know RDS for SQL. DynamoDB is the NoSQL counterpart—used heavily for shopping carts, gaming, IoT, sessions, and other high-scale, low-latency workloads.

By the end of this lesson, you will understand:

- What NoSQL is
- SQL vs NoSQL
- Tables, Items, and Attributes
- Primary Keys
- Partition Keys
- Sort Keys
- Global Secondary Indexes (GSI)
- Local Secondary Indexes (LSI)
- DynamoDB Streams
- TTL (Time to Live)
- Capacity Modes
- Real-world architecture

---
# Why Do We Need Another Database?

Suppose you have a social media app with:

- 100 million users
- Millions of posts
- Billions of likes

A traditional SQL database can become difficult to scale for some workloads.

AWS created **DynamoDB** for applications that need:

- Very high performance
- Massive scale
- Low latency
- Fully managed operations

---

# What is NoSQL?

**NoSQL** means **Not Only SQL**.

Unlike relational databases, NoSQL databases don't require rigid table schemas.

---

# SQL Example

Suppose we have a Users table.

| UserID | Name | Email |
|--------|------|--------|
| 1 | Arnab | arnab@email.com |
| 2 | Rahul | rahul@email.com |

Every row follows the same structure.

---

# DynamoDB Example

Each item can have different attributes.

| UserID | Name | Email | Hobby | Age |
|---------|------|--------|--------|------|
| 1 | Arnab | arnab@email.com | Running | 26 |
| 2 | Rahul | rahul@email.com | — | — |

You don't have to define every column in advance.

---

# SQL vs NoSQL

| SQL (RDS) | NoSQL (DynamoDB) |
|------------|------------------|
| Tables with fixed schema | Flexible schema |
| JOIN operations | No JOINs |
| ACID transactions | Supports transactions, but data modeling differs |
| Complex queries | Optimized for key-based access patterns |
| Best for relational data | Best for high-scale, predictable access patterns |

---

# DynamoDB Terminology

| SQL | DynamoDB |
|------|-----------|
| Database | Table |
| Row | Item |
| Column | Attribute |

---

# Table

Example:

```
Users Table
```

Contains:

```text
User 1

User 2

User 3
```

---

# Item

One record is called an **Item**.

Example:

```json
{
  "UserID": 1,
  "Name": "Arnab",
  "Country": "India"
}
```

---

# Attribute

Each field is an **Attribute**.

Example:

```json
{
  "Name": "Arnab"
}
```

`Name` is an attribute.

---

# Primary Key

Every DynamoDB table needs a primary key.

Two options:

### 1. Partition Key

Example:

```
UserID
```

AWS hashes this value to determine where the item is stored.

---

### 2. Composite Key

Consists of:

```
Partition Key

+

Sort Key
```

Example:

```
UserID

+

OrderDate
```

---

# Partition Key

Suppose we have:

```
UserID

101

102

103
```

AWS distributes these items across multiple storage partitions.

Think of it like different warehouses.

```text
Warehouse A

101

105

109

----------------

Warehouse B

102

108

111

----------------

Warehouse C

103

104

106
```

AWS decides where each item goes based on the partition key.

---

# Sort Key

Imagine an Orders table.

Partition Key:

```
UserID
```

Sort Key:

```
OrderDate
```

Now you can efficiently query:

```
All orders for User 101
```

sorted by date.

---

# Reading Data

Instead of:

```sql
SELECT *
FROM Orders
WHERE UserID = 101
```

DynamoDB uses API operations like:

```
GetItem

Query

Scan
```

**Query** is much faster than **Scan** because it uses keys.

---

# Scan vs Query

### Query

Looks only where the matching partition key exists.

Fast.

---

### Scan

Looks through the whole table.

Slow for large datasets.

Rule of thumb:

✅ Prefer Query

❌ Avoid full table scans unless necessary.

---

# Global Secondary Index (GSI)

Suppose your table uses:

```
UserID
```

as the partition key.

Later you want to search by:

```
Email
```

Instead of redesigning the table, create a **Global Secondary Index (GSI)**.

Example:

```
Main Table

UserID

↓

GSI

Email
```

Now you can efficiently search by email.

---

# Local Secondary Index (LSI)

An LSI lets you use the **same partition key** but a **different sort key**.

Example:

Main table:

```
Partition:

UserID

Sort:

OrderDate
```

LSI:

```
Partition:

UserID

Sort:

Price
```

Useful when you need multiple ways to sort data for the same partition key.

---

# Capacity Modes

DynamoDB provides two main modes.

### On-Demand

AWS automatically handles capacity.

Good for:

- Startups
- Unpredictable traffic
- Simplicity

---

### Provisioned

You specify expected read/write capacity.

Good for:

- Predictable workloads
- Cost optimization

---

# DynamoDB Streams

Every change can be recorded.

Example:

```
New Order

↓

DynamoDB

↓

Stream Event

↓

Lambda

↓

Send Email
```

This is useful for event-driven architectures.

---

# TTL (Time To Live)

Suppose OTP codes expire after 5 minutes.

Instead of deleting them manually:

```
OTP Created

↓

5 Minutes

↓

Automatically Deleted
```

TTL is great for:

- Sessions
- OTPs
- Temporary cache
- Expiring tokens

---

# Security

DynamoDB integrates with IAM.

Permissions can control:

- Read
- Write
- Delete
- Update

Applications usually access DynamoDB using IAM roles.

---

# Backup

DynamoDB supports:

- On-demand backups
- Point-in-time recovery (PITR)

If data is accidentally deleted, you can restore it within the retention window if PITR is enabled.

---

# Global Tables

Suppose your users are in:

- India
- Germany
- USA

You can replicate tables across regions.

```text
India

↓

Germany

↓

USA
```

Users read and write to the nearest region, improving latency and resilience.

---

# Real-World Example

Food delivery app.

Customer opens app.

```
UserID

↓

DynamoDB

↓

Profile Loaded
```

Customer places order.

```
Order

↓

DynamoDB

↓

Lambda

↓

Notification
```

---

# RDS vs DynamoDB

| Amazon RDS | DynamoDB |
|-------------|-----------|
| SQL | NoSQL |
| Fixed schema | Flexible schema |
| JOINs supported | No JOINs |
| Complex relational queries | Key-value/document access |
| Good for financial systems, ERP, CRM | Good for gaming, IoT, sessions, carts, leaderboards |

---

# Architecture

```text
Browser
    │
API Gateway
    │
Lambda
    │
DynamoDB
```

Or:

```text
Application (EC2)
        │
        ▼
    DynamoDB
```

---

# Hands-on Lab

1. Create a DynamoDB table called `Users`.
2. Use `UserID` as the partition key.
3. Insert a few items with different attributes.
4. Retrieve an item using `GetItem`.
5. Create a GSI on `Email`.
6. Query using the GSI.
7. Enable DynamoDB Streams.
8. (Optional) Create a Lambda function triggered by stream events.

---

# Interview Questions

1. What is DynamoDB?
2. What is the difference between SQL and NoSQL?
3. What is a partition key?
4. What is a sort key?
5. What is the difference between a Query and a Scan?
6. What is a GSI?
7. What is an LSI?
8. What is DynamoDB Streams?
9. What is TTL?
10. When would you choose DynamoDB over RDS?

---

# Architecture So Far

```text
                Internet
                    │
             API Gateway / ALB
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Lambda              EC2 App
          │                   │
     ┌────┴────┐         ┌────┴────┐
     ▼         ▼         ▼         ▼
 DynamoDB     S3       Amazon RDS  S3
```

## AWS Services You've Mastered

| Service | Purpose |
|---------|---------|
| IAM | Identity & permissions |
| EC2 | Virtual servers |
| S3 | Object storage |
| VPC | Networking |
| RDS | SQL databases |
| ELB | Traffic distribution |
| Auto Scaling | Automatic scaling |
| Lambda | Serverless compute |
| DynamoDB | NoSQL database |

---

## Next Lesson: Amazon CloudWatch & CloudTrail

This lesson is about **observability and auditing**, where you'll learn:

- Monitoring applications
- Collecting logs
- Creating metrics and dashboards
- Setting alarms
- Tracking API calls
- Auditing user activity
- Troubleshooting production issues

These services are essential for operating applications reliably in production and are commonly discussed in AWS interviews.
