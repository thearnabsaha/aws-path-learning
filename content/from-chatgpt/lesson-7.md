Excellent. This lesson is where you transition from running **one server** to building systems that can survive failures and handle large traffic spikes.

This is one of the most frequently asked topics in AWS interviews.

---

# Lesson 7: Elastic Load Balancer (ELB) & Auto Scaling

## Goal

By the end of this lesson, you'll understand:

- Why one server isn't enough
- What a Load Balancer does
- Types of Load Balancers
- Health Checks
- Auto Scaling Groups
- Scaling policies
- High Availability
- Fault Tolerance
- Production architecture

---

# The Problem with One Server

Suppose your website runs on one EC2 instance.

```text
Users
   │
   ▼
EC2
```

Now imagine:

- 10,000 people visit at once.
- The server becomes overloaded.
- Or worse—it crashes.

Now nobody can access your website.

---

# Solution: Multiple Servers

Instead of one server:

```text
Users

↓

EC2-1

EC2-2

EC2-3
```

Now the work is shared.

But there's another problem...

How do users know which server to connect to?

---

# Enter the Load Balancer

A **Load Balancer** sits in front of your servers.

```text
           Users
              │
              ▼
      Load Balancer
       /     |     \
      ▼      ▼      ▼
    EC2-1  EC2-2  EC2-3
```

Users only know the Load Balancer's address.

The Load Balancer decides which server should handle each request.

---

# What Does a Load Balancer Actually Do?

Imagine a receptionist in a hospital.

Patients arrive.

The receptionist sends them to:

- Doctor 1
- Doctor 2
- Doctor 3

The receptionist doesn't treat patients.

They just distribute them.

A Load Balancer works the same way.

---

# Why Use a Load Balancer?

Without one:

```text
User

↓

EC2-1
```

If EC2-1 crashes:

❌ Website unavailable.

With one:

```text
User

↓

Load Balancer

↓

Healthy EC2
```

The user may not even notice that one server failed.

---

# Types of AWS Load Balancers

AWS provides several load balancer types.

| Type | Best For |
|-------|-----------|
| Application Load Balancer (ALB) | HTTP/HTTPS web applications |
| Network Load Balancer (NLB) | Very high-performance TCP/UDP traffic |
| Gateway Load Balancer (GWLB) | Integrating virtual network appliances |

For most web applications, you'll start with an **Application Load Balancer (ALB)**.

---

# Application Load Balancer (ALB)

An ALB understands HTTP and HTTPS.

It can make routing decisions based on:

- URL path
- Host name
- HTTP headers

Example:

```text
example.com/images

↓

Image Server
```

```text
example.com/api

↓

API Server
```

This is called **path-based routing**.

---

# Health Checks

A Load Balancer constantly checks if servers are healthy.

Example:

```text
Load Balancer

↓

GET /health

↓

Server responds

200 OK
```

If a server doesn't respond correctly:

```text
EC2-2

↓

Failed Health Check

↓

Removed from rotation
```

No user traffic is sent to that server until it becomes healthy again.

---

# Before and After

Without health checks:

```text
User

↓

Broken Server

↓

Error
```

With health checks:

```text
User

↓

Load Balancer

↓

Healthy Server
```

---

# Auto Scaling

Now imagine traffic suddenly increases.

One server isn't enough.

Instead of manually creating more servers:

AWS can do it automatically.

This feature is called **Auto Scaling**.

---

# Auto Scaling Group (ASG)

An **Auto Scaling Group** manages a group of EC2 instances.

Example:

```text
Auto Scaling Group

↓

EC2-1

EC2-2

EC2-3
```

If one instance fails:

```text
EC2-2

↓

Crash

↓

ASG launches a replacement
```

The group automatically returns to its desired size.

---

# Desired, Minimum, and Maximum Capacity

Suppose you configure:

| Setting | Value |
|---------|-------|
| Minimum | 2 |
| Desired | 3 |
| Maximum | 10 |

Initially:

```text
EC2-1

EC2-2

EC2-3
```

If traffic increases:

```text
EC2-4

EC2-5

EC2-6
```

The ASG can keep adding instances until it reaches the maximum.

---

# Scaling Out vs Scaling Up

Two ways to increase capacity:

### Vertical Scaling (Scale Up)

Make one server bigger.

```text
2 CPU

↓

8 CPU
```

Pros:
- Simple

Cons:
- Has hardware limits.
- Can require downtime.

---

### Horizontal Scaling (Scale Out)

Add more servers.

```text
1 Server

↓

4 Servers
```

Pros:
- Better fault tolerance.
- Easier to handle very large traffic.

Cloud applications usually prefer horizontal scaling.

---

# Scaling Policies

Auto Scaling decides when to add or remove instances.

Example:

If CPU usage exceeds 70%:

```text
CPU > 70%

↓

Launch another EC2
```

If CPU usage drops below 20% for a while:

```text
CPU < 20%

↓

Terminate one EC2
```

This saves money during quiet periods.

---

# Launch Template

When Auto Scaling creates a new server, it needs instructions.

A **Launch Template** includes:

- AMI
- Instance type
- Security Group
- Key pair (optional, depending on your setup)
- IAM role
- User data (startup script)

Think of it as a recipe for creating new EC2 instances.

---

# High Availability (HA)

High Availability means your application keeps running even if something fails.

Example:

```text
AZ-A

EC2-1

EC2-2

----------------

AZ-B

EC2-3

EC2-4
```

If one Availability Zone fails, the other can continue serving traffic.

---

# Fault Tolerance

Fault tolerance means the system is designed to continue operating despite failures.

Examples:

- Server crashes
- Disk failure
- Availability Zone outage

Good AWS architectures expect failures and recover automatically.

---

# Production Architecture

```text
                  Internet
                      │
          Application Load Balancer
               /                \
              ▼                  ▼
      EC2 (AZ-A)           EC2 (AZ-B)
              \              /
               ▼            ▼
          Auto Scaling Group
                   │
                   ▼
               Amazon RDS
                   │
                   ▼
                Amazon S3
```

This architecture provides:

- High availability
- Automatic recovery
- Automatic scaling
- Better resilience

---

# Example: Black Friday Sale

At 2 AM:

```text
Users

↓

2 Servers
```

At 10 AM:

```text
100,000 Users

↓

8 Servers
```

At midnight:

```text
Users leave

↓

Back to 2 Servers
```

No engineer needed to manually add or remove servers.

---

# ELB vs Auto Scaling

| ELB | Auto Scaling |
|------|--------------|
| Distributes traffic | Adds/removes EC2 instances |
| Performs health checks | Replaces failed instances |
| Routes users to healthy targets | Responds to changing demand |

They are often used together.

---

# Interview Questions

Try answering these:

1. Why is a Load Balancer needed?
2. What is the difference between an ALB and an NLB?
3. What are health checks?
4. What is an Auto Scaling Group?
5. What is the difference between scaling up and scaling out?
6. What is a Launch Template?
7. What is High Availability?
8. Why should EC2 instances be spread across multiple Availability Zones?

---

# Hands-on Lab

If you have an AWS account:

1. Launch two EC2 instances with the same simple web application.
2. Create an Application Load Balancer.
3. Create a target group and register the instances.
4. Configure a health check endpoint.
5. Verify that traffic is distributed between both instances.
6. Create a Launch Template.
7. Create an Auto Scaling Group with:
   - Minimum: 2
   - Desired: 2
   - Maximum: 4
8. (Optional) Configure a target-tracking policy based on average CPU utilization.

---

# Complete AWS Architecture So Far

```text
                     Internet
                         │
                 Internet Gateway
                         │
              Application Load Balancer
                         │
              Auto Scaling Group (EC2)
                  │               │
                  ├───────────────┤
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
     Amazon RDS          Amazon S3
 (Relational Data)   (Images & Files)
```

## What You've Learned

| Service | Purpose |
|---------|---------|
| IAM | Identity & permissions |
| EC2 | Virtual servers |
| S3 | Object storage |
| VPC | Networking |
| RDS | Managed relational database |
| ELB | Distributes incoming traffic |
| Auto Scaling | Automatically adjusts EC2 capacity |

---

## Next Lesson: AWS Lambda (Serverless Computing)

This is where you'll learn a completely different way to build applications:

- No EC2 servers to manage
- Pay only when your code runs
- Event-driven architecture
- API Gateway integration
- Real-world serverless applications
- When to choose Lambda instead of EC2

Lambda is one of AWS's flagship services and a key concept in modern cloud architecture.
