Excellent. This lesson is one of the biggest differentiators between someone who **uses AWS** and someone who **engineers AWS infrastructure**.

Professional cloud engineers rarely create infrastructure manually through the AWS Console. Instead, they define it as code.

---

# Lesson 12: Infrastructure as Code (IaC) – AWS CloudFormation & Terraform

## Goal

By the end of this lesson, you'll understand:

- What Infrastructure as Code (IaC) is
- Why manual deployments are a problem
- AWS CloudFormation
- Terraform
- State files
- Variables
- Modules
- Drift
- CI/CD integration
- Which tool to choose

---

# The Problem with Manual Infrastructure

Suppose your manager says:

> "Create our production environment."

You manually create:

- VPC
- Subnets
- EC2
- RDS
- Security Groups
- IAM Roles
- Load Balancer

Three months later...

> "Create the exact same setup for testing."

Can you remember every setting?

Probably not.

Manual work leads to mistakes.

---

# Infrastructure as Code

Instead of clicking:

```text
AWS Console

↓

Create VPC

↓

Create EC2

↓

Create RDS
```

You write code:

```text
infrastructure.tf

↓

Run Command

↓

AWS Creates Everything
```

Your infrastructure becomes:

- Repeatable
- Version-controlled
- Easier to review
- Easier to automate

---

# Real-World Analogy

Imagine building a house.

Manual:

```text
Build House

↓

Try to remember everything

↓

Build Again
```

Infrastructure as Code:

```text
Blueprint

↓

Build House

↓

Reuse Blueprint
```

The blueprint is your IaC configuration.

---

# Two Major IaC Tools

| Tool | Created By |
|-------|------------|
| AWS CloudFormation | AWS |
| Terraform | HashiCorp |

---

# CloudFormation

CloudFormation is AWS's native IaC service.

You write a template in YAML or JSON.

Example:

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
```

CloudFormation creates the bucket for you.

---

# CloudFormation Stack

A **Stack** is a collection of AWS resources managed together.

Example:

```text
Stack

↓

VPC

↓

EC2

↓

RDS

↓

S3
```

Delete the stack, and CloudFormation deletes the managed resources (subject to resource policies and deletion protection).

---

# Terraform

Terraform works with AWS and many other providers.

Example:

```hcl
resource "aws_s3_bucket" "resume" {
  bucket = "arnab-resume"
}
```

Run:

```bash
terraform apply
```

Terraform creates the bucket.

---

# Why Companies Love Terraform

One language can manage:

- AWS
- Azure
- Google Cloud
- GitHub
- Cloudflare
- Datadog
- Kubernetes

This makes it popular in multi-cloud environments.

---

# Terraform Workflow

```text
Write Code

↓

terraform init

↓

terraform plan

↓

terraform apply

↓

Infrastructure Created
```

---

# terraform init

Downloads the required provider plugins.

Example:

```bash
terraform init
```

Run this once when starting a project or after changing providers.

---

# terraform plan

Shows what Terraform intends to do.

Example:

```text
+ Create EC2

+ Create S3

+ Create VPC
```

Nothing changes yet.

---

# terraform apply

Actually creates or updates infrastructure.

```bash
terraform apply
```

---

# terraform destroy

Deletes managed infrastructure.

```bash
terraform destroy
```

Use with care.

---

# State File

Terraform keeps track of managed resources using a **state file**.

```text
Terraform

↓

terraform.tfstate

↓

AWS Resources
```

The state file maps your configuration to real infrastructure.

In production, teams usually store it remotely (for example, in an S3 bucket with locking using supported backends).

---

# Variables

Instead of hardcoding values:

```hcl
instance_type = "t3.micro"
```

Use variables:

```hcl
variable "instance_type" {}
```

Then provide:

```text
t3.micro

or

t3.small
```

This makes configurations reusable.

---

# Outputs

After creating infrastructure:

Terraform can display useful values.

Example:

```text
EC2 Public IP

↓

54.221.15.33
```

Outputs are often consumed by other tools or modules.

---

# Modules

Imagine copying the same VPC configuration into ten projects.

Instead, create a module.

```text
VPC Module

↓

Project A

Project B

Project C
```

A module is a reusable building block.

---

# Example Project Structure

```text
project/

main.tf

variables.tf

outputs.tf

terraform.tfvars
```

Each file has a specific purpose.

---

# Drift

Suppose Terraform created an EC2 instance.

Later someone changes it manually in the AWS Console.

Now:

```text
Terraform

≠

AWS
```

This is called **configuration drift**.

Running `terraform plan` helps identify these differences.

---

# Idempotency

One of Terraform's most important concepts.

Run:

```bash
terraform apply
```

today.

Run it again tomorrow.

If nothing changed:

```text
No Changes
```

Terraform won't recreate everything.

This predictable behavior is called **idempotency**.

---

# CloudFormation vs Terraform

| CloudFormation | Terraform |
|----------------|-----------|
| AWS only | Multi-cloud |
| Managed by AWS | Open-source with commercial offerings |
| YAML/JSON | HCL |
| Deep AWS integration | Broad provider ecosystem |

---

# CI/CD Integration

Typical workflow:

```text
Developer

↓

Git Push

↓

GitHub Actions

↓

Terraform Plan

↓

Approval

↓

Terraform Apply

↓

AWS Updated
```

This allows infrastructure changes to go through code review just like application code.

---

# Example Architecture

Suppose your Terraform code creates:

```text
VPC

↓

Subnets

↓

Load Balancer

↓

ECS

↓

RDS

↓

S3
```

Entire production environments can be recreated from code.

---

# Production Workflow

```text
Developer

↓

Git Repository

↓

Terraform Code

↓

CI/CD Pipeline

↓

AWS Infrastructure
```

No manual clicking required.

---

# Hands-on Lab

1. Install Terraform.
2. Configure AWS credentials.
3. Create a simple `main.tf`.
4. Create an S3 bucket.
5. Run:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
6. Verify the bucket exists.
7. Run:
   ```bash
   terraform destroy
   ```
8. Confirm the bucket is removed.

---

# Interview Questions

1. What is Infrastructure as Code?
2. Why is Infrastructure as Code important?
3. What is Terraform?
4. What is CloudFormation?
5. What is a Terraform state file?
6. What is configuration drift?
7. What is idempotency?
8. What is a Terraform module?
9. What is the difference between `terraform plan` and `terraform apply`?
10. Why do companies store infrastructure in Git?

---

# Complete AWS Architecture

```text
                  Internet
                      │
          Application Load Balancer
                      │
                 ECS Service
                 ┌─────────┐
                 ▼         ▼
          Container 1  Container 2
                 │         │
                 └────┬────┘
                      ▼
                 Amazon RDS
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
      Amazon S3              DynamoDB

CloudWatch → Monitoring
CloudTrail → Auditing

Everything provisioned by Terraform or CloudFormation
```

---

# What You've Learned

| Topic | Status |
|--------|--------|
| IAM | ✅ |
| EC2 | ✅ |
| S3 | ✅ |
| VPC | ✅ |
| RDS | ✅ |
| ELB | ✅ |
| Auto Scaling | ✅ |
| Lambda | ✅ |
| DynamoDB | ✅ |
| CloudWatch | ✅ |
| CloudTrail | ✅ |
| Docker | ✅ |
| ECR | ✅ |
| ECS/Fargate | ✅ |
| Infrastructure as Code | ✅ |

## What's Next?

At this point you've covered the core AWS building blocks. The next step isn't just learning another service—it's **building complete production-grade systems**.

A practical progression would be:

1. **Project 1:** Static portfolio website (S3 + CloudFront + Route 53)
2. **Project 2:** Three-tier web application (ALB + EC2 + RDS)
3. **Project 3:** Serverless REST API (API Gateway + Lambda + DynamoDB)
4. **Project 4:** Containerized application (Docker + ECR + ECS/Fargate)
5. **Project 5:** Production deployment using Terraform and a CI/CD pipeline

These projects will teach you how the individual AWS services fit together in real-world architectures and prepare you much better for interviews than memorizing service definitions alone.
