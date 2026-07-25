# Lesson 19 — AWS Security Services (Complete Deep Dive)

> **Goal:** By the end of this lesson, you'll understand AWS's major security services, how enterprises protect cloud environments, how threat detection works, how compliance is monitored, and how all the security services work together in a real production environment.

This lesson is one of the most important for interviews.

A common interview question is:

> **"How would you secure an AWS environment?"**

After this lesson, you'll be able to answer that confidently.

---

# Learning Objectives

After this lesson, you'll understand:

- AWS Shared Responsibility Model
- Defence in Depth
- AWS Shield
- AWS WAF
- Amazon GuardDuty
- Amazon Inspector
- AWS Security Hub
- Amazon Macie
- AWS Config
- AWS Firewall Manager
- AWS Detective
- AWS IAM Access Analyzer
- Real-world security architecture

---

# Chapter 1 — Security in the Cloud

Many beginners think:

> AWS manages security.

Not exactly.

AWS follows the **Shared Responsibility Model**.

---

# Chapter 2 — Shared Responsibility Model

AWS secures:

```text
Cloud Infrastructure
```

You secure:

```text
Applications

IAM

Data

Operating Systems

Configurations

Encryption

Network Rules
```

Think of renting a flat.

The building owner secures:

- Walls
- Roof
- Electricity

You secure:

- Your belongings
- Your door lock
- Who enters your home

AWS is the building owner.

You are responsible for what you deploy.

---

# Chapter 3 — Defence in Depth

Never rely on one security layer.

Instead:

```text
Internet

↓

AWS Shield

↓

AWS WAF

↓

CloudFront

↓

ALB

↓

Security Groups

↓

Application

↓

IAM

↓

Encryption
```

Multiple layers mean one failure doesn't expose everything.

This is called:

**Defence in Depth**

---

# Chapter 4 — AWS Shield

Suppose attackers send:

10 million requests.

Purpose:

Crash your website.

This is called a:

**DDoS Attack**

(Distributed Denial of Service)

---

Without protection:

```text
Attackers

↓

Server

↓

Crash
```

---

AWS Shield protects against DDoS attacks.

Two versions exist.

---

## Shield Standard

Included automatically.

Protects against many common infrastructure-layer DDoS attacks.

---

## Shield Advanced

Designed for larger, business-critical workloads.

Adds:

- Enhanced detection
- Additional response support
- Better visibility
- Integration with AWS DDoS Response Team (DRT)

Used by:

- Banks
- Government
- E-commerce
- Large enterprises

---

# Chapter 5 — AWS WAF

WAF means:

**Web Application Firewall**

It protects HTTP and HTTPS applications.

Imagine a request:

```text
User

↓

Website
```

WAF sits in front.

```text
User

↓

WAF

↓

Application
```

---

Unlike Shield:

Shield protects infrastructure.

WAF protects applications.

---

# Example Attack — SQL Injection

Suppose attacker sends:

```sql
' OR 1=1 --
```

Instead of normal login credentials.

Without WAF:

Application may process the malicious input.

With WAF:

```text
Request

↓

Rule Match

↓

Blocked
```

---

# Example Attack — Cross-Site Scripting (XSS)

Attacker submits:

```html
<script>alert("hack")</script>
```

WAF can detect and block known malicious patterns before they reach your application.

---

# WAF Rules

Rules can check:

- IP addresses
- Countries
- HTTP headers
- User-Agent
- URI path
- Request size
- Rate limits

Example:

```text
More Than 100 Requests

↓

1 Minute

↓

Same IP

↓

Block
```

This is rate-based protection.

---

# Chapter 6 — Amazon GuardDuty

Imagine:

Someone steals AWS credentials.

They log in from another country.

Start launching cryptocurrency mining instances.

Would you notice immediately?

Maybe not.

GuardDuty would likely notice suspicious behaviour.

---

GuardDuty analyses signals from services like:

- CloudTrail
- VPC Flow Logs
- DNS logs

It looks for suspicious activity.

Example:

```text
Login

↓

Unusual Country

↓

High Risk

↓

Finding
```

---

GuardDuty does **not** block attacks.

It detects them.

---

# Chapter 7 — Amazon Inspector

GuardDuty detects threats.

Inspector looks for vulnerabilities.

Example:

EC2 instance:

```text
Ubuntu Server
```

Running:

```text
Old OpenSSL
```

Known security issue.

Inspector reports it.

---

Inspector checks supported workloads for issues such as:

- Software vulnerabilities
- Missing patches
- Container image vulnerabilities
- Certain Lambda package vulnerabilities

---

# Chapter 8 — AWS Security Hub

Imagine using:

- GuardDuty
- Inspector
- IAM Access Analyzer
- Macie
- Config

Where do you see everything?

Security Hub.

It centralises security findings.

```text
GuardDuty

↓

Inspector

↓

Macie

↓

Config

↓

Security Hub
```

One dashboard.

One place.

---

# Chapter 9 — Amazon Macie

Macie focuses on:

Sensitive data.

Suppose your S3 bucket contains:

```text
Passport Numbers

Credit Card Numbers

National IDs

Customer Information
```

Macie scans supported S3 data to help identify sensitive information.

Example:

```text
S3 Bucket

↓

Sensitive Data Found

↓

Alert
```

Very useful for:

- GDPR
- PCI DSS
- Data governance

---

# Chapter 10 — AWS Config

Imagine:

Yesterday:

S3 bucket was private.

Today:

Someone made it public.

Who changed it?

Config knows.

---

Config continuously records supported AWS resource configurations and changes.

Example:

```text
Security Group

↓

Yesterday

↓

Today

↓

Changed
```

You can review the history.

---

Config Rules

Example:

```text
S3 Bucket

↓

Public?

↓

NON-COMPLIANT
```

Or:

```text
EBS

↓

Encrypted?

↓

COMPLIANT
```

It helps enforce organisational policies.

---

# Chapter 11 — AWS Firewall Manager

Large company:

500 AWS accounts.

Thousands of WAF rules.

Managing each account manually is difficult.

Firewall Manager lets you manage security policies centrally.

Example:

```text
Security Team

↓

Firewall Manager

↓

All AWS Accounts
```

One policy.

Applied everywhere.

---

# Chapter 12 — AWS Detective

Suppose GuardDuty reports:

```text
Possible Credential Theft
```

Now what?

Detective helps investigate.

It analyses relationships between:

- Users
- Instances
- Network activity
- API calls

Think of it as:

Digital forensics.

---

# Chapter 13 — IAM Access Analyzer

Imagine:

Someone accidentally shares:

```text
S3 Bucket

Public
```

Or:

```text
IAM Role

Cross-Account Access
```

Access Analyzer identifies resources that are accessible outside your organisation or account based on IAM policies.

Great for finding accidental exposure.

---

# Chapter 14 — AWS Secrets Manager + KMS

Remember Lesson 14.

Applications should never contain:

```python
password="Admin123!"
```

Instead:

```text
Application

↓

Secrets Manager

↓

KMS

↓

Database
```

Everything encrypted.

---

# Chapter 15 — Security Groups vs WAF vs Shield

Very common interview question.

| Service | Protects |
|----------|----------|
| Security Group | EC2 network traffic |
| Network ACL | Subnet-level traffic |
| AWS WAF | Web application traffic |
| AWS Shield | DDoS attacks |
| GuardDuty | Threat detection |
| Inspector | Vulnerability assessment |
| Macie | Sensitive data |
| Config | Configuration compliance |
| Security Hub | Central security dashboard |

---

# Chapter 16 — Real Production Architecture

Imagine an online bank.

```text
Internet
      │
      ▼
 AWS Shield
      │
      ▼
   AWS WAF
      │
      ▼
 CloudFront
      │
      ▼
     ALB
      │
      ▼
 ECS Services
      │
      ▼
     RDS
```

Meanwhile:

```text
CloudTrail

↓

GuardDuty

↓

Security Hub

↓

SOC Team
```

And:

```text
S3

↓

Macie

↓

Sensitive Data Alert
```

Everything works together.

---

# Chapter 17 — Security Incident Example

Suppose:

Developer accidentally makes an S3 bucket public.

Sequence:

```text
S3 Public

↓

Config Detects

↓

Security Hub Receives Finding

↓

Access Analyzer Detects External Access

↓

Security Team Fixes
```

Another example:

Attacker logs in using stolen credentials.

```text
CloudTrail Event

↓

GuardDuty

↓

High Severity Finding

↓

Security Hub

↓

SOC Investigation

↓

Detective
```

---

# Chapter 18 — Compliance

Many companies follow regulations.

Examples:

- ISO 27001
- SOC 2
- PCI DSS
- GDPR
- HIPAA

AWS provides services to help organisations meet compliance requirements, but customers remain responsible for configuring and operating their workloads appropriately.

---

# Chapter 19 — Best Practices

- Enable MFA for privileged users.
- Follow least privilege IAM.
- Encrypt data using KMS.
- Store secrets in Secrets Manager.
- Enable GuardDuty.
- Enable Security Hub.
- Use AWS Config rules.
- Enable CloudTrail in all regions.
- Use WAF for public web applications.
- Keep operating systems and containers patched.
- Review findings regularly.

---

# Chapter 20 — Common Mistakes

❌ Making S3 buckets public.

❌ Disabling CloudTrail.

❌ Sharing root account credentials.

❌ Hardcoding passwords.

❌ Allowing `0.0.0.0/0` SSH access.

❌ Ignoring GuardDuty findings.

❌ Forgetting encryption.

❌ Giving administrator access to everyone.

❌ Not rotating secrets.

---

# Chapter 21 — Interview Questions

### Q1. What is the Shared Responsibility Model?

AWS secures the cloud infrastructure, while customers secure what they deploy in the cloud, including applications, data, identities, and configurations.

---

### Q2. Difference between AWS Shield and AWS WAF?

| Shield | WAF |
|---------|-----|
| Protects against DDoS attacks | Filters HTTP/HTTPS requests |
| Infrastructure-level protection | Application-layer protection |

---

### Q3. What does GuardDuty do?

Continuously analyses AWS activity to detect suspicious behaviour and potential threats.

---

### Q4. What does Inspector do?

Scans supported compute resources and container images for vulnerabilities and exposure.

---

### Q5. What does Security Hub do?

Aggregates security findings from multiple AWS security services into a central dashboard.

---

### Q6. What does Macie do?

Discovers and helps protect sensitive data stored in Amazon S3.

---

### Q7. What does AWS Config do?

Records resource configurations, tracks changes, and evaluates compliance against rules.

---

### Q8. What is AWS Detective?

A service that helps investigate and analyse security incidents using collected data.

---

### Q9. What does IAM Access Analyzer identify?

Resources that are accessible from outside the intended AWS account or organisation due to IAM policies.

---

### Q10. If your company has hundreds of AWS accounts, how would you centrally manage WAF rules?

Use **AWS Firewall Manager** together with AWS Organizations.

---

# Hands-on Lab

1. Enable **GuardDuty** in your AWS account.
2. Enable **Security Hub** and review the initial findings.
3. Enable **AWS Config** and create a rule requiring S3 bucket encryption.
4. Create a test S3 bucket and intentionally make it public (only in a sandbox account), then observe findings from Config and IAM Access Analyzer.
5. Enable **Macie** and allow it to classify a sample S3 bucket.
6. Attach an AWS Managed Rule Group to an **AWS WAF** web ACL and associate it with a test Application Load Balancer or CloudFront distribution.
7. Review **CloudTrail** logs to correlate security events.

---

# Final Mental Model

If you remember only one diagram from this lesson, remember this:

```text
                     Internet
                         │
                  DDoS Attack?
                         │
                         ▼
                   AWS Shield
                         │
                  HTTP Request
                         │
                         ▼
                     AWS WAF
                         │
                         ▼
             CloudFront / ALB / API
                         │
                         ▼
                  Application Layer
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
     GuardDuty      Inspector        Macie
         │               │               │
         └───────────────┼───────────────┘
                         ▼
                  Security Hub
                         │
                         ▼
                  Security Team
                         │
        Config + CloudTrail + Detective
                         │
                         ▼
             Investigation & Remediation
```

The key ideas are:

- **Shield** protects against DDoS attacks.
- **WAF** filters malicious web traffic.
- **GuardDuty** detects suspicious activity.
- **Inspector** finds vulnerabilities.
- **Macie** identifies sensitive data in S3.
- **Config** tracks configuration changes and compliance.
- **Security Hub** centralises security findings.
- **Detective** helps investigate incidents.
- **IAM Access Analyzer** identifies unintended external access.

Together, these services provide multiple layers of protection, detection, investigation, and governance for production AWS environments.
