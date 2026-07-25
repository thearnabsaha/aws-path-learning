Great! You're now entering the **data layer** of cloud architecture. Almost every real-world application—banking apps, e-commerce sites, HR systems, social media—stores data in a database.

---

# Lesson 6: Amazon RDS (Relational Database Service)

## Goal

By the end of this lesson, you'll understand:

- What a database is
- Why RDS exists
- Supported database engines
- Primary instance
- Multi-AZ deployments
- Read Replicas
- Backups
- Snapshots
- Scaling
- Security
- Real-world architectures

---

# What is a Database?

A database stores **structured data**.

Imagine an e-commerce website.

Instead of keeping everything in Excel:

| Customer | Product | Price |
|-----------|----------|--------|
| Arnab | Shoes | ₹4000 |
| Rahul | Laptop | ₹60000 |

The application stores it in a database.

---

# Why Not Store Everything in S3?

S3 is great for storing:

- Images
- Videos
- PDFs
- Documents
- Backups

But imagine asking:

> "Show me every order Arnab placed in the last 30 days."

A relational database is designed for these kinds of queries.

---

# What is Amazon RDS?

**Amazon RDS (Relational Database Service)** is AWS's managed relational database service.

Without RDS:

```text
EC2
 │
 ├── Install MySQL
 ├── Configure backups
 ├── Update software
 ├── Monitor health
 ├── Handle crashes
 └── Manage storage
```

You do everything yourself.

With RDS:

```text
Amazon RDS
 │
 ├── Automated backups
 ├── Software patching
 ├── Monitoring
 ├── Failover
 ├── Storage management
 └── High availability options
```

AWS manages much of the operational work.

---

# Supported Database Engines

RDS supports several relational databases:

| Engine | Common Use |
|---------|------------|
| MySQL | Web applications |
| PostgreSQL | Enterprise apps, GIS, analytics |
| MariaDB | MySQL-compatible workloads |
| Oracle | Large enterprises |
| Microsoft SQL Server | Windows/.NET environments |

If you already know SQL, your queries are largely the same.

---

# Basic Architecture

```text
Users
   │
   ▼
Application (EC2)
   │
   ▼
Amazon RDS
```

The application connects to the database over the network.

Users **never** connect directly to the database.

---

# Tables

A relational database stores information in **tables**.

Example:

### Employees

| ID | Name | Salary |
|----|------|---------|
| 1 | Arnab | ₹80,000 |
| 2 | Rahul | ₹70,000 |

Each row is a record.

Each column stores one type of information.

---

# SQL

You interact with relational databases using **SQL (Structured Query Language)**.

Example:

```sql
SELECT * FROM Employees;
```

Find one employee:

```sql
SELECT * FROM Employees
WHERE Name = 'Arnab';
```

Insert data:

```sql
INSERT INTO Employees
(Name, Salary)
VALUES ('Alice', 95000);
```

---

# Primary Database

Most applications write data to a **primary** database instance.

```text
Application
      │
      ▼
Primary RDS
```

This is where inserts, updates, and deletes happen.

---

# Multi-AZ Deployment

Suppose your database server fails.

Without Multi-AZ:

```text
Application
     │
     ▼
Database

(Server crashes)

↓

Application stops working
```

With Multi-AZ:

```text
Application
     │
     ▼
Primary DB (AZ A)
      │
      ▼
Standby DB (AZ B)
```

If the primary fails, AWS automatically promotes the standby to become the new primary.

This improves **availability**, not performance.

---

# Read Replicas

Sometimes thousands of users are reading data.

Instead of sending every read request to the primary:

```text
Application
      │
      ▼
Primary DB
      │
      ├────────► Read Replica 1
      │
      ├────────► Read Replica 2
      │
      └────────► Read Replica 3
```

Writes go to the primary.

Reads can be distributed across replicas.

This helps scale read-heavy applications.

---

# Multi-AZ vs Read Replica

| Multi-AZ | Read Replica |
|-----------|--------------|
| High availability | Read scaling |
| Automatic failover | No automatic failover by default |
| Standby isn't used for normal reads | Replicas serve read traffic |
| Protects against failures | Improves performance for reads |

---

# Storage Scaling

As your database grows:

```
20 GB

↓

100 GB

↓

500 GB
```

RDS supports increasing storage without rebuilding the database in many cases.

---

# Automated Backups

AWS can automatically back up your database.

If you accidentally delete data:

```
Monday Backup

Tuesday Backup

Wednesday Backup
```

You can restore to a previous point within your configured backup retention period.

---

# Snapshots

A snapshot is a manual backup you create.

Example:

```
Before Major Upgrade

↓

Take Snapshot

↓

Upgrade

↓

Problem?

↓

Restore Snapshot
```

Many teams take a snapshot before risky changes.

---

# Security

RDS instances are typically placed in **private subnets**.

```text
Internet

↓

Web Server

↓

Application

↓

RDS
```

The database isn't directly exposed to the internet.

---

# Security Groups

Example rules:

Allow:

- PostgreSQL (5432) from the application server
- MySQL (3306) from the application server

Block everything else.

This means only trusted resources can connect.

---

# Common Database Ports

| Database | Port |
|----------|------|
| MySQL | 3306 |
| PostgreSQL | 5432 |
| SQL Server | 1433 |
| Oracle | 1521 |

---

# Monitoring

AWS integrates RDS with **CloudWatch** so you can monitor:

- CPU usage
- Memory
- Storage
- Connections
- Read/write latency

Monitoring helps detect performance issues early.

---

# Real-World Architecture

```text
Internet
      │
      ▼
Load Balancer
      │
      ▼
EC2 Application Servers
      │
      ▼
Amazon RDS
      │
      ▼
Backups
```

---

# Example: Shopping Website

Customer places an order.

```
Customer

↓

Application

↓

INSERT Order

↓

RDS
```

Customer views order history.

```
Customer

↓

Application

↓

SELECT Orders

↓

RDS
```

This is happening millions of times every day on large e-commerce platforms.

---

# RDS vs EC2 Database

| EC2 + MySQL | Amazon RDS |
|--------------|------------|
| You install the database | AWS provisions it |
| You manage backups | AWS can automate them |
| You patch software | AWS helps manage patching |
| Manual failover | Multi-AZ option |
| More operational work | Less operational work |

Unless you have a special requirement, RDS is usually the better choice for relational databases.

---

# Interview Questions

Try answering these:

1. What is Amazon RDS?
2. Why use RDS instead of installing MySQL on EC2?
3. What is the difference between Multi-AZ and Read Replicas?
4. What is a snapshot?
5. Why should an RDS instance usually be in a private subnet?
6. Which port does MySQL use?
7. Which port does PostgreSQL use?
8. Why are Security Groups important for databases?

---

# Hands-on Lab

If you have an AWS account:

1. Create an RDS MySQL or PostgreSQL instance (stay within the Free Tier if applicable).
2. Place it in private subnets.
3. Create a Security Group allowing database access only from a trusted EC2 instance.
4. Connect from that EC2 instance using a database client.
5. Create a simple table.
6. Insert a few records.
7. Run a `SELECT` query.
8. Create a manual snapshot.

---

# AWS Architecture So Far

You've learned the building blocks of many production systems:

```text
                 Internet
                     │
             Internet Gateway
                     │
              Public Subnet
                     │
             Load Balancer
                     │
                 EC2 App
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
        Amazon RDS           Amazon S3
      (Structured Data)    (Files/Images)
```

Each service has a distinct responsibility:

| Service | Responsibility |
|---------|----------------|
| IAM | Identity and permissions |
| VPC | Networking |
| EC2 | Compute |
| S3 | Object storage |
| RDS | Relational database |

## Next Lesson: Elastic Load Balancer (ELB) & Auto Scaling

This is where you'll learn how applications handle **thousands or even millions of users** by distributing traffic, automatically adding servers during traffic spikes, and recovering from server failures. These concepts are fundamental to designing highly available AWS architectures.
