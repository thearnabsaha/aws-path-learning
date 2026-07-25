# AWS Roadmap (Beginner → Advanced)

| Phase | Topics | Time |
|--------|---------|------|
| 1 | Cloud Fundamentals | 2-3 days |
| 2 | Core AWS Services | 2 weeks |
| 3 | Networking & Security | 2 weeks |
| 4 | Databases & Storage | 1 week |
| 5 | DevOps & Containers | 2 weeks |
| 6 | Infrastructure as Code | 1 week |
| 7 | Real Projects | 3 weeks |
| 8 | Interview Preparation | 1 week |

---

# Lesson 1: What is Cloud Computing?

This path teaches AWS the way it's used in real jobs—not only enough to pass a certification. The goal is practical skill for cloud and remote tech roles.

Below is the core idea of cloud computing. Use the roadmap section above as your long-term map, then work through each topic in order.

Imagine you own a startup.

Instead of buying:

- Servers
- Hard drives
- Internet cables
- Cooling systems
- Security
- Electricity

You simply **rent computers over the internet.**

That's Cloud Computing.

Example:

Instead of buying a ₹10 lakh server...

You pay AWS only for what you use.

Like Uber.

You don't buy a taxi.

You pay only when you ride.

---

# Traditional vs Cloud

| Traditional | Cloud |
|-------------|-------|
| Buy server | Rent server |
| Huge upfront cost | Pay per use |
| Takes weeks | Takes minutes |
| Maintenance by you | Maintenance by AWS |
| Difficult to scale | Scale instantly |

---

# What is AWS?

AWS = **Amazon Web Services**

Amazon has millions of servers around the world.

They rent these servers to companies.

Companies like:

- Netflix
- Airbnb
- Samsung
- Adobe
- NASA
- Many startups

use AWS.

---

# Think of AWS Like a City

Imagine AWS is a huge city.

Inside the city there are many services.

Example:

🏢 Apartment → EC2

📦 Warehouse → S3

🏦 Bank Locker → EBS

🌐 Internet → Route 53

🚦 Traffic Controller → Load Balancer

🔑 Security Guard → IAM

Database Building → RDS

Messaging Office → SQS

Each building has one job.

---

# Regions

AWS has data centers all over the world.

Example:

- Mumbai
- Singapore
- Tokyo
- Frankfurt
- London
- Virginia

These are called **Regions**.

Example:

If your users are in India,

use **Mumbai Region**

because it's faster.

---

# Availability Zones (AZ)

Inside every Region,

there are multiple data centers.

Mumbai has:

- AZ A
- AZ B
- AZ C

If one data center fails,

another one continues serving users.

This gives high availability.

Think:

India

↓

Mumbai

↓

Building 1

Building 2

Building 3

These buildings are Availability Zones.

---

# Why Multiple AZs?

Suppose one building catches fire.

Your application should still work.

AWS solves this by letting you run across multiple AZs.

---

# Basic AWS Architecture

```
            Internet
                |
          Load Balancer
          /          \
     EC2 Server    EC2 Server
          \          /
          Database (RDS)
                |
              Storage (S3)
```

Every major website is built similarly.

---

# Meet the Most Important AWS Services

These are the services you'll use most:

| Service | Purpose |
|----------|---------|
| EC2 | Virtual Server |
| S3 | File Storage |
| RDS | SQL Database |
| Lambda | Run code without servers |
| IAM | Users & Permissions |
| VPC | Private Network |
| CloudWatch | Monitoring |
| Route 53 | DNS |
| Elastic Load Balancer | Distribute traffic |
| Auto Scaling | Automatically add/remove servers |

Master these first.

---

# Pay-As-You-Go

AWS bills you like electricity.

Example:

Server running:

10 hours

↓

Pay for 10 hours.

Delete server

↓

Billing stops (for compute, though some resources like storage or reserved IPs may still incur charges if you keep them).

---

# Free Tier

AWS offers a Free Tier for new accounts with limits on many services for a period (commonly 12 months for eligible accounts), plus some always-free offerings. Staying within those limits helps you avoid charges.

---

# AWS Account

When you create an AWS account you get:

- Root User (full access)
- Billing dashboard
- Management Console
- Access to all AWS services

**Never use the root user for daily work.**

Create an IAM user instead.

---

# Important Terminology

| Word | Meaning |
|-------|----------|
| Cloud | Computers on the internet |
| AWS | Amazon's cloud platform |
| Region | Geographic area |
| Availability Zone | Data center within a region |
| EC2 | Virtual machine |
| S3 | Object storage |
| IAM | Access management |
| VPC | Private network |
| RDS | Managed database |

---

# Mini Quiz

Try answering these without looking back:

1. What is cloud computing?
2. What does AWS stand for?
3. What is a Region?
4. What is an Availability Zone?
5. Which AWS service stores files?
6. Which AWS service provides virtual servers?
7. Why are multiple Availability Zones important?
8. Is AWS pay-as-you-go or a fixed monthly subscription?

If you can answer these, you've understood the fundamentals.

---

# Your Learning Plan

Here's the sequence I'd recommend:

- **Lesson 1:** Cloud fundamentals (this lesson)
- **Lesson 2:** AWS account, console, and IAM
- **Lesson 3:** EC2 (virtual servers)
- **Lesson 4:** S3 (object storage)
- **Lesson 5:** VPC (networking)
- **Lesson 6:** RDS (managed SQL databases)
- **Lesson 7:** ELB and Auto Scaling
- **Lesson 8:** Lambda (serverless)
- **Lesson 9:** DynamoDB (NoSQL)
- **Lesson 10:** CloudWatch and CloudTrail
- **Lesson 11:** Docker, ECR, and ECS
- **Lesson 12:** Infrastructure as Code (CloudFormation and Terraform)

We'll build knowledge step by step, with hands-on labs after every lesson so you gain practical experience, not just theory.
