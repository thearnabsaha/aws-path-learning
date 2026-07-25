# Lesson 11: Docker, Amazon ECR & Amazon ECS

Most modern teams do not ship apps by hand onto raw EC2 alone. They package software in containers and run them with ECS, EKS, or Fargate. Docker is the standard packaging model behind that shift.


---
# The Old Way

Suppose your application needs:

- .NET 8
- SQL Client
- Playwright
- Chrome
- Node.js

You install everything on a server.

```text
EC2 Server
│
├── Windows/Linux
├── .NET
├── Node.js
├── Chrome
├── Playwright
└── Your App
```

Now imagine another application needs different versions.

Soon your server becomes difficult to manage.

---

# The Docker Way

Docker packages everything your application needs into one unit called a **container**.

```text
Container
│
├── Your App
├── .NET
├── Libraries
├── Dependencies
└── Configuration
```

The container behaves the same whether it runs on:

- Your laptop
- AWS
- Azure
- Google Cloud
- Another Linux server

This consistency is one of Docker's biggest advantages.

---

# Real-Life Analogy

Imagine shipping goods.

Without containers:

```text
TV
Shoes
Laptop
Books
```

Everything is packed differently.

With shipping containers:

```text
📦 Container

TV

Shoes

Laptop

Books
```

The shipping company only needs to know how to transport the container.

Docker does the same for software.

---

# Virtual Machine vs Container

## Virtual Machine

```text
Hardware

↓

Hypervisor

↓

VM 1
Windows

↓

App

----------------

VM 2
Ubuntu

↓

App
```

Each VM has its own operating system.

This consumes more memory and storage.

---

## Docker Containers

```text
Hardware

↓

Host OS

↓

Docker Engine

↓

Container 1

Container 2

Container 3
```

Containers share the host operating system kernel, making them lighter than VMs.

---

# Comparison

| Virtual Machine | Container |
|-----------------|-----------|
| Full OS per VM | Shares host OS kernel |
| Larger | Smaller |
| Slower startup | Starts quickly |
| Higher resource usage | Lower resource usage |
| Strong isolation | Lightweight isolation |

---

# Docker Image

An **image** is a blueprint.

Think of it as a recipe.

```text
Recipe

↓

Cake
```

Docker:

```text
Image

↓

Container
```

The image contains:

- Application
- Runtime
- Dependencies
- Configuration

---

# Docker Container

A **container** is a running instance of an image.

```text
Image

↓

Run

↓

Container
```

You can create many containers from the same image.

---

# Dockerfile

A **Dockerfile** tells Docker how to build the image.

Example:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY . .

ENTRYPOINT ["dotnet", "MyApp.dll"]
```

This tells Docker:

- Use the .NET 8 runtime image.
- Set the working directory.
- Copy the application files.
- Start the application.

---

# Docker Build Process

```text
Dockerfile

↓

docker build

↓

Docker Image

↓

docker run

↓

Container
```

---

# Basic Docker Commands

Build an image:

```bash
docker build -t myapp .
```

List images:

```bash
docker images
```

Run a container:

```bash
docker run myapp
```

Show running containers:

```bash
docker ps
```

Stop a container:

```bash
docker stop <container-id>
```

Remove a container:

```bash
docker rm <container-id>
```

---

# Container Lifecycle

```text
Dockerfile

↓

Image

↓

Container Running

↓

Stopped

↓

Removed
```

---

# Ports

Suppose your application listens on port **8080** inside the container.

You can expose it on port **80** on the host.

```text
Browser

↓

Host:80

↓

Container:8080
```

Example:

```bash
docker run -p 80:8080 myapp
```

Format:

```text
HostPort:ContainerPort
```

---

# Volumes

Containers are designed to be replaceable.

If a container is deleted, any data stored only inside it is usually lost.

Use **volumes** to persist data.

```text
Container

↓

Volume

↓

Data
```

Volumes are commonly used for:

- Databases
- Uploaded files
- Logs

---

# Docker Networking

Containers can communicate with each other.

Example:

```text
Frontend Container

↓

Backend Container

↓

Database Container
```

Docker networks make this communication possible.

---

# Amazon ECR (Elastic Container Registry)

Where do you store Docker images?

AWS provides **Amazon ECR**.

```text
Docker Image

↓

Amazon ECR
```

Think of ECR as **GitHub for Docker images** (conceptually).

---

# Deployment Flow

```text
Developer

↓

docker build

↓

Docker Image

↓

Push to ECR

↓

Deploy to ECS
```

---

# Amazon ECS (Elastic Container Service)

ECS runs your containers.

Instead of launching EC2 instances manually and deploying applications yourself:

```text
ECS

↓

Runs Containers

↓

Scales Containers

↓

Restarts Failed Containers
```

AWS manages the orchestration.

---

# ECS Components

## Cluster

A cluster is a logical grouping of compute resources.

```text
ECS Cluster

↓

Container A

Container B

Container C
```

---

## Task Definition

A **Task Definition** is like a recipe for running containers.

It specifies:

- Docker image
- CPU
- Memory
- Environment variables
- Ports
- IAM role

---

## Task

A **Task** is a running instance of a Task Definition.

```text
Task Definition

↓

Task Running
```

---

## Service

An ECS **Service** keeps a specified number of tasks running.

Suppose you want three containers.

```text
Desired = 3

↓

Task 1

Task 2

Task 3
```

If Task 2 crashes:

```text
Task 2

↓

Crash

↓

ECS launches a replacement
```

---

# ECS Launch Types

There are two main ways to run ECS tasks.

### ECS on EC2

You manage the EC2 instances.

```text
EC2

↓

Docker

↓

Containers
```

More control, more management.

---

### AWS Fargate

No EC2 management.

```text
Fargate

↓

Container
```

You simply provide the container definition.

AWS manages the underlying servers.

---

# EC2 vs Fargate

| EC2 Launch Type | Fargate |
|-----------------|----------|
| Manage servers | No server management |
| More customization | Simpler operations |
| Pay for EC2 instances | Pay for task resources used |
| Suitable for specialized workloads | Great for many modern applications |

---

# Real-World Architecture

```text
Internet

↓

Application Load Balancer

↓

ECS Service

↓

Task 1

Task 2

Task 3

↓

Amazon RDS
```

Images are stored in ECR.

The service automatically replaces failed tasks.

---

# Complete Deployment Flow

```text
Developer

↓

Git Push

↓

CI/CD Pipeline

↓

Docker Build

↓

Push Image to ECR

↓

Deploy to ECS

↓

Load Balancer

↓

Users
```

This is a common modern deployment pipeline.

---

# Hands-on Lab

On your own computer:

1. Install Docker Desktop.
2. Create a simple ASP.NET or Node.js application.
3. Write a Dockerfile.
4. Build the image:
   ```bash
   docker build -t myapp .
   ```
5. Run it:
   ```bash
   docker run -p 8080:8080 myapp
   ```
6. Open `http://localhost:8080`.
7. (Optional) Create an ECR repository, push the image, and deploy it to ECS or Fargate.

---

# Interview practice prompts

Use these as open-ended prompts (the lesson quiz below is multiple choice).

1. What is Docker?
2. What is the difference between an image and a container?
3. What is a Dockerfile?
4. Why are containers lighter than virtual machines?
5. What is Amazon ECR?
6. What is Amazon ECS?
7. What is the difference between ECS on EC2 and ECS on Fargate?
8. What is a Task Definition?
9. What is an ECS Service?

---

# AWS Architecture with Containers

```text
                 Internet
                     │
         Application Load Balancer
                     │
              Amazon ECS Service
             ┌────────┴────────┐
             ▼                 ▼
        Container 1       Container 2
             │                 │
             └────────┬────────┘
                      ▼
                Amazon RDS
                      │
                      ▼
                  Amazon S3

Docker Images stored in Amazon ECR
```

---

# What You've Learned

| Service | Purpose |
|---------|---------|
| IAM | Identity & Access Management |
| EC2 | Virtual servers |
| S3 | Object storage |
| VPC | Networking |
| RDS | Managed SQL databases |
| ELB | Load balancing |
| Auto Scaling | Automatic EC2 scaling |
| Lambda | Serverless compute |
| DynamoDB | NoSQL database |
| CloudWatch | Monitoring & logging |
| CloudTrail | Auditing |
| ECR | Container image registry |
| ECS | Container orchestration |
| Fargate | Serverless containers |

## Next Lesson: Infrastructure as Code (IaC) with AWS CloudFormation & Terraform

This is where you'll learn how to create entire AWS environments using code instead of clicking through the AWS Console—a core skill for DevOps, platform engineering, and cloud automation.
