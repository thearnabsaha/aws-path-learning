# Lesson 13 — AWS IAM Identity Center (AWS SSO) & Enterprise Identity Management

> **This is a complete lesson.** By the end of it, you should understand not only *how* IAM Identity Center works, but *why* AWS built it, what happens behind the scenes during login, and how enterprises manage access across hundreds of AWS accounts.

---

# Learning Objectives

After this lesson, you'll be able to answer questions like:

- Why shouldn't enterprises use IAM users?
- What is IAM Identity Center?
- What is Single Sign-On (SSO)?
- How do employees log in to AWS?
- What are Permission Sets?
- What is AWS Organizations?
- What is STS?
- How does AssumeRole work?
- What are temporary credentials?
- What is SAML?
- What is OIDC?
- How does CLI authentication work with SSO?
- How do companies manage thousands of employees securely?

---

# Chapter 1 — The Problem AWS Had to Solve

Let's travel back in time.

Imagine it's 2014.

A startup has:

- 5 developers
- 1 AWS account

Everything is easy.

You create:

```
Alice
Bob
Charlie
David
Emma
```

as IAM users.

Everyone logs in.

No problem.

---

Now imagine it's 2026.

The same company has become a multinational.

It now has:

- 6,000 employees
- 450 AWS accounts
- 18 departments
- Multiple countries

Now imagine using IAM users.

```
Account A
-------------
Alice
Bob
Charlie

Account B
-------------
Alice
Bob
Charlie

Account C
-------------
Alice
Bob
Charlie
```

Imagine repeating this **450 times.**

Impossible.

---

# The Bigger Problem

Suppose Alice joins the company.

HR says:

> Alice is joining tomorrow.

Someone now has to:

Create IAM User.

Assign Password.

Enable MFA.

Attach Policies.

Repeat for:

- Development
- Testing
- Production
- Analytics
- Shared Services

Now suppose Alice resigns.

You must remove her from **every AWS account**.

Miss one account...

She still has access.

Huge security problem.

---

# This Is Called Identity Sprawl

Identity Sprawl means:

The same identity exists in many places.

Example:

```
Alice

↓

IAM User

↓

AWS Account 1

↓

AWS Account 2

↓

AWS Account 3

↓

AWS Account 4
```

One human.

Many identities.

---

# AWS's Solution

AWS asked:

> What if AWS stopped storing users?

Instead...

Trust another system.

That became:

**IAM Identity Center**

(formerly AWS Single Sign-On)

---

# Chapter 2 — Modern Enterprise Identity

Today companies already have identity systems.

Examples:

- Microsoft Entra ID (formerly Azure AD)
- Okta
- Google Workspace
- Active Directory
- Ping Identity
- OneLogin

Employees already log in there.

AWS says:

> Great.

> Let them keep doing that.

AWS simply trusts those identities.

---

# Instead of This

```
AWS

↓

IAM User

↓

Password
```

You get:

```
Employee

↓

Corporate Login

↓

AWS
```

One identity.

Everything else is trusted.

---

# Chapter 3 — AWS Organizations

Before Identity Center, we need AWS Organizations.

Without Organizations:

Every AWS account is isolated.

```
AWS Account 1

AWS Account 2

AWS Account 3
```

Nothing connects them.

---

With Organizations:

```
Management Account
        │
 ┌──────┼────────┐
 │      │        │
 ▼      ▼        ▼
 Dev   Test   Production
```

One organization manages every account.

---

## Why Multiple Accounts?

A beginner usually thinks:

> Why not use one AWS account?

Because production must be isolated.

Example:

```
One Account

EC2

RDS

Lambda

S3

Everyone accesses everything.
```

Dangerous.

---

Instead:

```
Development

↓

Testing

↓

Production
```

Each has:

Different permissions.

Different budgets.

Different security.

Different logs.

Different compliance.

---

# Organizational Units (OU)

Large companies create departments.

Example:

```
Root

│

├── Engineering

│     ├── Dev

│     ├── Test

│     └── Prod

│

├── Finance

│

├── Security

│

└── Sandbox
```

These folders are called:

**Organizational Units (OU)**

---

# Service Control Policies (SCP)

An SCP limits what an AWS account can ever do.

Imagine an account has:

AdministratorAccess

Normally that means:

Everything.

But the Organization applies:

```
Deny Delete S3 Bucket
```

Now...

Even administrators cannot delete S3 buckets.

Because SCP sits above IAM permissions.

Think of permission evaluation like this:

```
SCP
   ↓
IAM Role / IAM Policy
   ↓
Allowed?
```

If the SCP denies an action, no IAM policy can override it.

**Interview Tip:** SCPs don't grant permissions—they only set the maximum allowed permissions for accounts in an Organization.

---

# Chapter 4 — What is IAM Identity Center?

IAM Identity Center is **not a replacement for IAM**.

It is a **central authentication and access management service** for AWS Organizations.

It:

- Authenticates users
- Assigns permissions
- Provides Single Sign-On
- Creates access to multiple AWS accounts

Notice something important:

It does **not** replace IAM Roles or IAM Policies.

It uses them.

---

# Chapter 5 — The Complete Login Flow

Let's follow Alice.

She opens:

```
https://company.awsapps.com/start
```

She enters:

```
alice@company.com
```

AWS doesn't immediately log her in.

Instead:

```
Alice

↓

IAM Identity Center

↓

Identity Provider

↓

Verify Password

↓

Success

↓

Return to AWS
```

Only after authentication succeeds does AWS continue.

---

# Chapter 6 — Identity Provider (IdP)

Identity Provider means:

The system responsible for proving who you are.

Examples:

```
Microsoft Entra ID

Okta

Google Workspace

Active Directory
```

AWS trusts them.

---

# Service Provider (SP)

Who provides the service?

AWS.

So:

```
Identity Provider

↓

Proves Identity

↓

AWS

↓

Provides Services
```

---

# Chapter 7 — Single Sign-On (SSO)

Without SSO:

```
AWS Account A

Login

AWS Account B

Login

AWS Account C

Login

AWS Account D

Login
```

Annoying.

---

With SSO:

```
Login Once

↓

Development

↓

Testing

↓

Production

↓

Shared Services

↓

Billing
```

One login.

Multiple accounts.

---

# Chapter 8 — Permission Sets

This is one of the most misunderstood concepts.

A Permission Set is **not** an IAM Policy.

It is a **template** that Identity Center uses to create IAM Roles in target accounts.

Example:

```
Developer Permission Set

↓

Read EC2

Create Lambda

Read S3
```

Assign it to:

```
Engineering Group

↓

Development Account
```

Identity Center creates an IAM Role in that account with those permissions.

---

# Permission Set vs IAM Policy

| Permission Set | IAM Policy |
|---------------|------------|
| Identity Center object | IAM object |
| Assigned to users/groups through Identity Center | Attached directly to IAM users, groups, or roles |
| Provisions IAM Roles | Defines permissions |

---

# Chapter 9 — Groups

Instead of assigning permissions individually:

Bad:

```
Alice

Bob

Charlie

↓

Administrator
```

Good:

```
Engineering Group

↓

Developer Permission Set

↓

100 Developers
```

Now onboarding becomes:

Add Alice to the Engineering group.

Done.

---

# Chapter 10 — Behind the Scenes

Suppose Alice clicks:

Production Account.

AWS now does something very important.

It does **not** use Alice directly.

Instead:

```
Alice

↓

IAM Identity Center

↓

STS

↓

Assume Role

↓

Temporary Credentials

↓

Production Account
```

Alice never receives permanent credentials.

---

# Chapter 11 — AWS STS (Security Token Service)

STS creates temporary credentials.

These include:

- Access Key ID
- Secret Access Key
- Session Token

Unlike long-lived IAM access keys, these expire automatically.

---

# Why Temporary Credentials?

Imagine someone steals them.

```
IAM User Key

↓

Valid for Years
```

Dangerous.

Temporary credentials:

```
STS Credentials

↓

Valid for Hours

↓

Expire
```

Even if stolen, the window of misuse is much smaller.

---

# Chapter 12 — AssumeRole

This is one of the most important AWS concepts.

Suppose:

Alice belongs to Engineering.

She wants Production access.

Instead of becoming an administrator, she temporarily **assumes** a role.

```
Alice

↓

AssumeRole

↓

ProductionAdmin Role

↓

Temporary Credentials
```

When the session ends, those credentials expire.

---

# Chapter 13 — Cross-Account Access

Imagine:

```
Development

Testing

Production
```

Each account contains:

```
Developer Role
```

Alice logs in once.

She can switch accounts because Identity Center obtains temporary credentials for the appropriate role in each account.

No separate passwords.

No duplicate IAM users.

---

# Chapter 14 — SAML 2.0

SAML stands for:

**Security Assertion Markup Language**

Don't memorize the name.

Understand the flow.

```
User

↓

AWS

↓

Redirect to Microsoft Entra ID

↓

Login

↓

SAML Assertion

↓

AWS

↓

Access Granted
```

---

## What is a SAML Assertion?

Think of it like a signed statement.

It says:

```
This person is Alice.

She authenticated successfully.

She belongs to Engineering.

She can access AWS.
```

AWS trusts the signature and grants access.

---

# Chapter 15 — OIDC vs OAuth vs SAML

Many people confuse these.

| Technology | Purpose |
|------------|---------|
| SAML | Enterprise browser-based SSO |
| OAuth 2.0 | Delegated authorization ("allow this app to access my data") |
| OIDC | Authentication layer built on OAuth 2.0 |

Examples:

SAML:

```
Corporate Employee

↓

AWS Console
```

OIDC:

```
Sign in with Google
```

OAuth:

```
Allow Canva to access Google Drive?
```

---

# Chapter 16 — Active Directory Integration

Many banks and large enterprises already use Microsoft Active Directory.

Architecture:

```
Employee

↓

Active Directory

↓

IAM Identity Center

↓

AWS
```

Employees continue using the same corporate credentials.

---

# Chapter 17 — AWS CLI with SSO

Old method:

```
aws configure
```

This stores long-lived access keys.

Modern method:

```bash
aws configure sso
```

The CLI:

1. Opens a browser.
2. You log in through Identity Center.
3. The CLI stores a temporary session.
4. AWS CLI automatically refreshes it when needed (within the configured flow).

No permanent access keys are stored.

---

# Chapter 18 — Session Duration

Companies choose session lengths.

Example:

```
Developer

↓

8 Hours

↓

Login Again
```

Finance might use shorter sessions.

Operations teams may have different policies depending on security requirements.

---

# Chapter 19 — Security Best Practices

A mature AWS organization generally follows these practices:

- Don't create IAM users unless necessary.
- Use IAM Identity Center for workforce access.
- Enable MFA for all users.
- Prefer temporary credentials over long-lived access keys.
- Use least privilege.
- Use groups instead of assigning users individually.
- Separate Development, Testing, and Production accounts.
- Use SCPs to enforce organizational guardrails.
- Protect the root user:
  - Enable MFA.
  - Do not create access keys.
  - Use it only for rare account-level tasks.

---

# Chapter 20 — Real Enterprise Example

Imagine a company with:

- 8,000 employees
- 320 AWS accounts
- 25 departments

The architecture might look like:

```
Employees
        │
        ▼
Microsoft Entra ID
        │
        ▼
IAM Identity Center
        │
        ▼
Groups
        │
 ┌──────┼─────────────┐
 ▼      ▼             ▼
Engineering  Finance  Security
 │           │          │
 ▼           ▼          ▼
Permission  Permission Permission
Set         Set        Set
 │           │          │
 ▼           ▼          ▼
Development  Billing    Security Accounts
Production
Testing
```

Notice:

- One identity.
- One login.
- Many AWS accounts.
- No duplicate IAM users.

---

# Chapter 21 — Common Interview Questions

### Q1. Why is IAM Identity Center preferred over IAM users?

Because it centralizes authentication, integrates with enterprise identity providers, supports SSO, and uses temporary credentials instead of long-lived IAM users.

---

### Q2. Does IAM Identity Center replace IAM?

No.

It uses IAM Roles and IAM Policies behind the scenes.

---

### Q3. What is a Permission Set?

A Permission Set is an Identity Center configuration that defines permissions and provisions corresponding IAM Roles into target AWS accounts.

---

### Q4. Why are temporary credentials more secure?

They expire automatically, reducing the impact if credentials are exposed.

---

### Q5. What does STS do?

AWS Security Token Service issues temporary security credentials.

---

### Q6. Difference between IAM User and IAM Identity Center User?

| IAM User | Identity Center User |
|----------|----------------------|
| Lives inside one AWS account | Centrally managed for an AWS Organization |
| Permanent credentials possible | Temporary credentials via STS |
| Good for limited scenarios | Recommended for workforce access |

---

### Q7. What is AssumeRole?

It allows an authenticated identity to obtain temporary credentials for an IAM Role with a specific set of permissions.

---

### Q8. Difference between SAML and OIDC?

SAML is commonly used for enterprise browser-based SSO. OIDC is built on OAuth 2.0 and is widely used by modern web and mobile applications.

---

# Chapter 22 — Hands-on Lab

If you have an AWS account and AWS Organizations available:

1. Create an AWS Organization.
2. Create three member accounts:
   - Development
   - Testing
   - Production
3. Enable IAM Identity Center.
4. Create a user (or connect an external IdP).
5. Create an `Engineering` group.
6. Create a `Developer` Permission Set.
7. Assign:
   - Engineering group → Developer Permission Set → Development account.
8. Configure the AWS CLI with:
   ```bash
   aws configure sso
   ```
9. Verify you can access the Development account without creating an IAM user there.

---

# Key Takeaways

| Concept | What to Remember |
|---------|-------------------|
| AWS Organizations | Manages multiple AWS accounts under one organization |
| Organizational Units (OUs) | Group accounts for governance |
| SCPs | Set the maximum permissions accounts can have |
| IAM Identity Center | Central workforce authentication and SSO |
| Identity Provider (IdP) | Authenticates users (Entra ID, Okta, AD, etc.) |
| Permission Sets | Identity Center templates that provision IAM Roles |
| IAM Roles | The permissions actually assumed in target accounts |
| STS | Issues temporary credentials |
| AssumeRole | Obtains temporary access to a role |
| SAML | Enterprise SSO protocol |
| OIDC | Modern authentication protocol built on OAuth 2.0 |
| Groups | Simplify permission management |
| Temporary Credentials | More secure than long-lived credentials |

---

# Mental Model

If you remember only one diagram from this lesson, remember this:

```text
                 Employee
                     │
                     ▼
      Microsoft Entra ID / Okta / AD
                     │
          (Authentication)
                     │
                     ▼
        AWS IAM Identity Center
                     │
       (Permission Set Assigned)
                     │
                     ▼
     AWS STS (Temporary Credentials)
                     │
         (Assume IAM Role)
                     │
                     ▼
      Development / Testing / Production
             AWS Accounts (Organizations)
```

This single flow ties together nearly every concept in enterprise AWS identity management. Once you understand this architecture, you'll recognize the design used by many medium and large organizations running workloads on AWS.
