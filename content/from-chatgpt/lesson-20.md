# Lesson 20 — Amazon ECS vs Amazon EKS & Real Architecture Decisions (Complete Deep Dive)

> **Goal:** By the end of this lesson, you'll understand container orchestration, why Docker alone isn't enough in production, how Amazon ECS and Amazon EKS work internally, when to choose each, Fargate vs EC2 launch types, service discovery, deployments, and how experienced cloud architects decide which service to use.

This lesson ties together everything you've learned so far:

- EC2
- VPC
- ALB
- IAM
- CloudWatch
- Docker
- ECR
- Auto Scaling
- CloudFront
- Route 53
- Security
- SQS
- SNS
- EventBridge

After this lesson, you'll be able to design production-ready AWS architectures.

---

# Learning Objectives

After this lesson, you'll understand:

- Why container orchestration exists
- What ECS is
- What EKS is
- ECS Cluster
- Task Definition
- Tasks
- Services
- Capacity Providers
- Fargate vs EC2
- Kubernetes basics
- Pods
- Nodes
- Deployments
- Services (Kubernetes)
- Ingress
- Service Discovery
- Rolling Deployments
- Blue/Green Deployments
- When to choose ECS vs EKS

---

# Chapter 1 — Docker Solves Only One Problem

Suppose you built an application.

Docker makes it portable.

```text
Application

↓

Docker Image

↓

Runs Anywhere
```

Great.

Now imagine your application becomes popular.

Instead of one container...

You now have:

- 50 containers
- 100 containers
- 500 containers

Who manages them?

Docker doesn't.

---

# Problems Docker Doesn't Solve

Suppose:

Container crashes.

Who restarts it?

Suppose:

Traffic doubles.

Who launches more containers?

Suppose:

One server dies.

Who moves containers elsewhere?

Suppose:

New application version is released.

Who updates containers safely?

Docker alone doesn't answer these questions.

---

# Solution

We need an **Orchestrator**.

Think of it as:

```text
Conductor

↓

Many Musicians

↓

Beautiful Orchestra
```

Instead of musicians:

Containers.

---

# Chapter 2 — What is Container Orchestration?

Container orchestration means:

Managing containers automatically.

Tasks include:

- Scheduling
- Scaling
- Networking
- Health monitoring
- Deployments
- Service discovery
- Self-healing

AWS offers:

- ECS
- EKS

---

# Chapter 3 — Amazon ECS

ECS stands for:

**Elastic Container Service**

AWS built ECS specifically for AWS.

It is fully managed.

It integrates deeply with AWS services.

---

Basic architecture:

```text
ECR

↓

ECS Cluster

↓

Containers

↓

Users
```

---

# Chapter 4 — ECS Components

Imagine ECS like a company.

Company

↓

Departments

↓

Employees

Similarly:

Cluster

↓

Services

↓

Tasks

↓

Containers

---

# ECS Cluster

A Cluster is:

A logical grouping of compute capacity.

Example:

```text
Production Cluster
```

Inside:

- Frontend
- Backend
- API
- Workers

All managed together.

---

# Chapter 5 — Task Definition

One of the most important ECS concepts.

A Task Definition is like a blueprint.

Example:

```text
Container Image

CPU

Memory

Ports

Environment Variables

IAM Role

Logging
```

Nothing actually runs yet.

It's only instructions.

Think of it as:

Architectural drawing.

Not the building.

---

# Chapter 6 — ECS Task

Task Definition:

Blueprint.

Task:

Running instance.

Example:

```text
Task Definition

↓

Launch

↓

Running Task
```

Exactly like:

Class → Object

Template → Running Application

---

# Chapter 7 — ECS Service

Suppose:

You always need:

5 API containers.

If one crashes:

Should you manually restart it?

No.

Instead:

```text
Desired Count = 5

↓

Task Dies

↓

ECS Starts New Task
```

This is an ECS Service.

It maintains the desired number of running tasks.

---

# Chapter 8 — Service Discovery

Imagine:

Frontend needs:

Backend.

Instead of remembering IP addresses:

```text
frontend.internal

↓

Backend Service
```

Containers find each other automatically.

No hardcoded IPs.

---

# Chapter 9 — ECS Launch Types

Two main choices.

---

## EC2 Launch Type

You manage EC2 instances.

```text
EC2

↓

Docker

↓

Containers
```

Advantages:

- Maximum control
- Custom AMIs
- GPU support
- Special networking

Disadvantages:

- Patch EC2
- Scale EC2
- Manage EC2

---

## Fargate

Serverless containers.

No EC2 management.

Architecture:

```text
Application

↓

Fargate

↓

Runs
```

No servers visible.

You specify:

- CPU
- Memory

AWS manages the infrastructure.

---

# EC2 vs Fargate

| EC2 | Fargate |
|------|----------|
| Manage servers | No servers to manage |
| Lower cost at large scale (often) | Operational simplicity |
| Full control | Fully managed |
| More responsibility | Less operational overhead |

---

# Chapter 10 — Auto Scaling in ECS

Suppose traffic increases.

```text
100 Users

↓

2 Tasks
```

Later:

```text
10,000 Users

↓

20 Tasks
```

ECS Auto Scaling launches more tasks automatically.

When traffic drops:

Tasks are removed.

---

# Chapter 11 — Load Balancer Integration

Typical architecture:

```text
Users

↓

ALB

↓

Task 1

Task 2

Task 3
```

ALB distributes traffic.

Healthy tasks receive requests.

---

# Chapter 12 — Rolling Deployments

Suppose:

Version 2 arrives.

Don't stop everything.

Instead:

```text
Task v1

↓

Task v2

↓

Task v2

↓

Task v1 Removed
```

Users barely notice.

This is:

Rolling Deployment.

---

# Chapter 13 — Blue/Green Deployment

Safer deployment.

Instead of replacing containers:

```text
Blue

↓

Current Version
```

Deploy:

```text
Green

↓

New Version
```

Test.

If successful:

Switch traffic.

If something goes wrong:

Return traffic to Blue.

Rollback is fast.

---

# Chapter 14 — Amazon EKS

EKS stands for:

**Elastic Kubernetes Service**

Instead of AWS's own orchestrator...

It runs:

Kubernetes.

---

# What is Kubernetes?

Kubernetes (often abbreviated as **K8s**) is the world's most widely adopted container orchestration platform.

Originally developed by Google.

Now maintained by the Cloud Native Computing Foundation (CNCF).

---

# Why Kubernetes?

Companies wanted:

One orchestrator.

Not one per cloud.

Kubernetes works across:

- AWS
- Azure
- Google Cloud
- On-premises

This portability is a major reason organisations adopt it.

---

# Chapter 15 — Kubernetes Architecture

High-level view:

```text
Cluster

↓

Nodes

↓

Pods

↓

Containers
```

---

# Node

A Node is:

A machine running workloads.

Can be:

- EC2
- Virtual Machine
- Physical Server

---

# Pod

The smallest deployable unit in Kubernetes.

Usually:

One application container.

Sometimes:

Multiple tightly coupled containers.

Think of a Pod as the wrapper that Kubernetes manages.

---

# Deployment

Suppose:

Need:

10 Pods.

Deployment ensures:

```text
Desired = 10

↓

Pod Dies

↓

Create New Pod
```

Very similar to ECS Services.

---

# Kubernetes Service

Pods have changing IP addresses.

Applications shouldn't depend on those.

Instead:

```text
Frontend

↓

Service

↓

Backend Pods
```

Service provides a stable endpoint.

---

# Ingress

How does traffic reach the cluster?

```text
Internet

↓

Ingress

↓

Services

↓

Pods
```

Ingress manages external HTTP/HTTPS routing.

---

# Chapter 16 — ECS vs EKS Concepts

| ECS | Kubernetes |
|------|------------|
| Task | Pod |
| Service | Deployment + Service (rough comparison) |
| Cluster | Cluster |
| Task Definition | Pod Specification |

The concepts are similar, but the terminology differs.

---

# Chapter 17 — ECS vs EKS

One of the most common interview questions.

| ECS | EKS |
|------|------|
| AWS-native | Kubernetes |
| Easier | More complex |
| Faster learning | Steeper learning curve |
| Deep AWS integration | Multi-cloud portability |
| Lower operational complexity | Larger ecosystem |

---

# Chapter 18 — When Should You Use ECS?

Choose ECS when:

- Everything runs on AWS.
- Team is small.
- Fast delivery matters.
- Operational simplicity is important.
- No Kubernetes expertise.

Many startups begin here.

---

# Chapter 19 — When Should You Use EKS?

Choose EKS when:

- Company already uses Kubernetes.
- Multi-cloud portability is required.
- Large Kubernetes ecosystem is needed.
- Existing Kubernetes tooling is in place.
- Teams already have Kubernetes expertise.

Large enterprises often choose EKS for standardisation.

---

# Chapter 20 — Real Production Architecture

Imagine an e-commerce platform.

```text
Users
        │
        ▼
    Route 53
        │
        ▼
   CloudFront
        │
        ▼
        WAF
        │
        ▼
        ALB
        │
 ┌──────┴─────────┐
 ▼                ▼
Frontend ECS   Backend ECS
     │              │
     ▼              ▼
    SQS         EventBridge
     │              │
     ▼              ▼
 Worker ECS     Lambda
        │
        ▼
       RDS
        │
        ▼
        S3
```

Every service you learned now fits together.

---

# Chapter 21 — Microservices Architecture

Instead of:

One large application.

```text
Monolith
```

Modern architecture uses:

```text
Frontend

↓

Auth Service

↓

Order Service

↓

Payment Service

↓

Inventory Service

↓

Notification Service
```

Each service:

- Independent deployment
- Independent scaling
- Independent updates

Containers make this practical.

---

# Chapter 22 — CI/CD Pipeline

Typical deployment flow:

```text
Developer

↓

Git Push

↓

Build

↓

Docker Image

↓

ECR

↓

ECS Deployment

↓

Traffic Updated
```

No manual server login.

Everything automated.

---

# Chapter 23 — Best Practices

- Use Fargate unless you have a reason to manage EC2.
- Store images in ECR.
- Use IAM Roles for Tasks instead of long-lived credentials.
- Send logs to CloudWatch.
- Place services behind an ALB.
- Keep applications stateless where possible.
- Use Auto Scaling.
- Perform rolling or blue/green deployments.
- Store secrets in Secrets Manager.
- Monitor health continuously.

---

# Chapter 24 — Common Mistakes

❌ Running containers manually on EC2.

❌ Hardcoding secrets.

❌ Not using health checks.

❌ Building oversized Docker images.

❌ Using the `latest` image tag for production deployments.

❌ Ignoring logging and monitoring.

❌ Treating containers like virtual machines.

---

# Chapter 25 — Interview Questions

### Q1. What problem does ECS solve?

It orchestrates containers by handling scheduling, scaling, deployments, networking, and self-healing.

---

### Q2. What is a Task Definition?

A blueprint that defines how one or more containers should run, including image, CPU, memory, networking, IAM role, and other settings.

---

### Q3. Difference between a Task and a Service?

A Task is a running instance of a Task Definition. A Service maintains a desired number of running Tasks and replaces failed ones automatically.

---

### Q4. Difference between ECS EC2 and Fargate?

| EC2 | Fargate |
|------|----------|
| You manage servers | AWS manages infrastructure |
| More control | Less operational work |
| Suitable for specialised workloads | Suitable for most modern applications |

---

### Q5. What is Kubernetes?

An open-source container orchestration platform for managing containerised applications.

---

### Q6. What is the smallest deployable unit in Kubernetes?

A Pod.

---

### Q7. Difference between ECS and EKS?

ECS is AWS's native container orchestrator. EKS is AWS's managed Kubernetes service.

---

### Q8. When would you choose ECS over EKS?

When running only on AWS and prioritising simplicity and operational efficiency.

---

### Q9. What is a Rolling Deployment?

A deployment strategy that gradually replaces old application instances with new ones while keeping the application available.

---

### Q10. What is a Blue/Green Deployment?

A deployment strategy where a new environment is deployed alongside the existing one, traffic is switched after validation, and rollback is quick if issues occur.

---

# Hands-on Lab

Build a simple containerised web application using AWS:

1. Create a Docker image for a small web application.
2. Push the image to Amazon ECR.
3. Create an ECS Cluster.
4. Create a Task Definition using the ECR image.
5. Create an ECS Service using **Fargate**.
6. Attach an Application Load Balancer.
7. Configure Auto Scaling based on CPU utilisation.
8. Store application secrets in AWS Secrets Manager.
9. Send application logs to CloudWatch Logs.
10. Update the Docker image and perform a rolling deployment.

---

# Final Mental Model

If you remember only one diagram from this entire course, remember this:

```text
                      Users
                        │
                        ▼
                    Route 53
                        │
                        ▼
                   CloudFront
                        │
                        ▼
                  Shield + WAF
                        │
                        ▼
              Application Load Balancer
                        │
        ┌───────────────┼───────────────┐
        ▼                               ▼
     ECS / Fargate                  Lambda
        │                               │
        ▼                               ▼
   SQS / EventBridge               Background Jobs
        │
        ▼
   Microservices
        │
   ┌────┴───────────────┐
   ▼                    ▼
  RDS              DynamoDB
   │                    │
   └────────┬───────────┘
            ▼
            S3
            │
            ▼
      KMS + Secrets Manager

Monitoring:
CloudWatch • CloudTrail • GuardDuty • Security Hub
```

This diagram represents a modern AWS production architecture:

- **Route 53** directs users to your application.
- **CloudFront** accelerates global delivery.
- **Shield** and **WAF** protect the edge.
- **ALB** distributes incoming traffic.
- **ECS (or EKS)** runs containerised microservices.
- **SQS** and **EventBridge** enable asynchronous communication.
- **RDS**, **DynamoDB**, and **S3** store application data.
- **KMS** and **Secrets Manager** protect sensitive information.
- **CloudWatch**, **CloudTrail**, **GuardDuty**, and **Security Hub** provide observability and security.

---

# 🎉 Congratulations!

You have now completed the **20-lesson AWS Cloud Engineer curriculum**. You have covered:

- Core AWS services
- Networking
- Compute
- Storage
- Databases
- Security
- Monitoring
- Serverless
- Containers
- Infrastructure as Code
- Event-driven architecture
- Cost optimisation
- Production architecture

From here, the next stage is the **Projects Phase**, where you'll build complete, production-style systems that combine everything you've learned. This is where concepts turn into practical engineering skills and interview-ready experience.
