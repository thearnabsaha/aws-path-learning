# Lesson 2: AWS Account, Console & IAM

This lesson is the start of a hands-on AWS bootcamp: how an account is organized, how you use the console, and how IAM controls access. Get this wrong and every later service becomes insecure.

By the end of this lesson, you will understand:

- How AWS is organized
- What the AWS Console is
- Why the Root User is dangerous
- What IAM is
- How permissions work
- Best security practices

---
# 1. What happens when you create an AWS account?

Imagine you've rented an office building.

Initially, you receive **one master key**.

That master key can:

- Open every room
- Delete the entire building
- Change billing information
- Create new employees
- Shut everything down

This master key is called the **Root User**.

```
AWS Account
      │
      └── Root User (Master Key)
```

---

# Never use the Root User daily

The root user should only be used for rare account-level tasks such as:

- Changing payment methods
- Closing the AWS account
- Managing certain account settings

Everything else should be done with an IAM user or IAM Identity Center.

Think of it this way:

You don't carry the master key to your house everywhere—you use your everyday key.

---

# 2. What is the AWS Management Console?

The AWS Console is AWS's web dashboard.

From it, you can:

- Launch servers
- Create databases
- Upload files
- Monitor applications
- View bills
- Configure networking

Think of it as the control panel for your cloud infrastructure.

---

# 3. AWS Services

When you log in, you'll see hundreds of services.

Don't worry—you only need a handful to become productive.

```
Compute
 └── EC2

Storage
 └── S3

Database
 └── RDS

Networking
 └── VPC

Security
 └── IAM

Monitoring
 └── CloudWatch
```

---

# 4. What is IAM?

**IAM = Identity and Access Management**

IAM decides:

- Who can log in
- What they can do
- What they cannot do

Think of a company office.

| Person | Access |
|---------|--------|
| CEO | Everything |
| Developer | Servers |
| HR | Employee systems |
| Accountant | Billing |
| Intern | Limited access |

IAM works the same way.

---

# 5. IAM Components

There are four core concepts.

## IAM User

Represents one person or application.

Example:

```
Arnab
Rahul
Alice
Bob
```

Each has their own login.

---

## IAM Group

A group contains multiple users.

Example:

```
Developers
 ├── Alice
 ├── Bob
 └── Charlie
```

Instead of assigning permissions one by one, assign them to the group.

---

## IAM Policies

Policies define permissions.

Example:

```
Can Start EC2

Can Stop EC2

Cannot Delete EC2
```

A policy is just a set of rules.

Example (simplified):

```json
{
  "Allow": [
      "StartEC2",
      "StopEC2"
  ]
}
```

AWS policies are written in JSON.

---

## IAM Roles

Roles are temporary identities.

Instead of a human logging in, AWS services can "assume" a role.

Example:

An EC2 server needs to read files from S3.

Without a role:

```
Server
 ↓
Username + Password
```

Not secure.

With a role:

```
Server
 ↓
IAM Role
 ↓
Permission Granted
```

Much safer.

---

# 6. Authentication vs Authorization

This is a favorite interview question.

### Authentication

**Who are you?**

Example:

Username + Password

or

Fingerprint

---

### Authorization

**What are you allowed to do?**

Example:

Can you:

- Launch EC2?
- Delete S3 buckets?
- Read databases?

Authentication happens first, then authorization.

---

# 7. Principle of Least Privilege

Give only the permissions someone actually needs.

Example:

A developer needs to upload files to S3.

Good:

```
Allow Upload
```

Bad:

```
Administrator Access
```

This reduces the impact of mistakes or compromised accounts.

---

# 8. Multi-Factor Authentication (MFA)

A password alone can be stolen.

MFA adds another verification step.

```
Password
+
Phone App Code
```

Even if someone knows your password, they still can't log in without the second factor.

Always enable MFA for the root user and privileged users.

---

# 9. Password Policies

A good AWS account enforces:

- Strong passwords
- Password expiration (if required by your organization)
- No password reuse
- Minimum length requirements

These are managed through IAM settings.

---

# 10. Access Keys

Applications can't click the AWS Console.

They use **Access Keys**.

Example:

```
Access Key ID

Secret Access Key
```

These are used by tools like the AWS CLI or SDKs.

**Never hard-code or share your secret access key.**

---

# 11. AWS CLI

The AWS Command Line Interface lets you control AWS from a terminal.

Instead of clicking buttons:

```
Launch Server
```

you can run commands like:

```bash
aws ec2 describe-instances
```

Many engineers use the CLI every day because it's faster and easier to automate.

---

# 12. Console vs CLI

| Console | CLI |
|----------|-----|
| Point and click | Terminal commands |
| Easier for beginners | Better for automation |
| Good for learning | Great for scripting |

You'll learn both.

---

# 13. Typical AWS Login Flow

```
Open Console

↓

Enter Username

↓

Enter Password

↓

MFA

↓

IAM checks permissions

↓

Access granted
```

---

# 14. Real-World Example

Imagine you're building a company.

```
AWS Account
│
├── Developers Group
│      ├── Alice
│      ├── Bob
│
├── HR Group
│      ├── Sarah
│
├── Finance Group
│      ├── Mike
│
└── Policies
       ├── EC2 Access
       ├── S3 Read Only
       ├── Billing
```

This is a common IAM structure.

---

# Summary

| Term | Meaning |
|--------|---------|
| Root User | Full control of the AWS account |
| IAM | Identity and Access Management |
| User | Individual identity |
| Group | Collection of users |
| Policy | Set of permissions |
| Role | Temporary identity for AWS services or users |
| MFA | Extra login verification |
| Access Key | Credentials for programmatic access |
| CLI | Command-line tool for AWS |

---

# Hands-on Lab (Recommended)

If you don't already have one:

1. Create an AWS account.
2. Enable MFA on the root user.
3. Create an IAM administrator user for daily use.
4. Sign out of the root account.
5. Sign back in using the IAM user.

These are standard first steps before building anything on AWS.

---

# Mini Quiz

1. Why shouldn't you use the root user for everyday work?
2. What is the difference between an IAM user and an IAM role?
3. What is the purpose of an IAM policy?
4. What does MFA protect against?
5. What is the principle of least privilege?
6. What's the difference between authentication and authorization?
7. When would you use the AWS CLI instead of the console?

In **Lesson 3**, we'll launch your **first EC2 virtual server**, connect to it over SSH, install software, and host a simple website—the first step toward deploying real applications.
