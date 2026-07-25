Excellent. This is the lesson where AWS starts to "click."

Networking is one of the most important topics in AWS interviews. Once you understand it, you'll understand how almost every AWS application is built.

---

# Lesson 5: Amazon VPC (Virtual Private Cloud)

## Goal

By the end of this lesson, you'll understand:

- What a VPC is
- Public vs Private Subnets
- CIDR Blocks
- Internet Gateway
- Route Tables
- NAT Gateway
- Security Groups
- Network ACLs
- How everything connects together

---

# What is a VPC?

A **VPC (Virtual Private Cloud)** is your own private network inside AWS.

Imagine AWS is a giant apartment complex.

Each customer gets their own apartment.

```text
AWS Cloud
+------------------------------------------------------+
|                                                      |
|  Your VPC                    Other Customer's VPC    |
| +----------------------+     +-------------------+    |
| |                      |     |                   |    |
| | Your Servers         |     | Their Servers     |    |
| | Your Database        |     | Their Database    |    |
| | Your Network         |     | Their Network     |    |
| +----------------------+     +-------------------+    |
|                                                      |
+------------------------------------------------------+
```

Even though you're sharing AWS's infrastructure, your network is isolated from everyone else's.

---

# Why Do We Need a VPC?

Without a VPC:

```text
Everyone's servers
        │
        ▼
 One giant network
```

Chaos.

With a VPC:

```text
Company A

Own Network

----------------

Company B

Own Network

----------------

Company C

Own Network
```

Each company has complete control over its own network.

---

# CIDR Block

Every VPC gets an IP address range.

Example:

```
10.0.0.0/16
```

This is called a **CIDR block**.

Think of it as assigning addresses to houses in a city.

Example:

```
VPC

10.0.0.0/16

↓

10.0.0.1

10.0.0.2

10.0.0.3

...
```

The `/16` tells AWS how large the network is.

---

# Subnets

A VPC is divided into smaller sections called **subnets**.

Imagine a city.

The city has neighborhoods.

```text
City (VPC)

├── North Area
├── South Area
├── East Area
└── West Area
```

Those neighborhoods are subnets.

---

# Public Subnet

A **public subnet** contains resources that need internet access.

Examples:

- Web servers
- Load Balancers
- Bastion hosts

```text
Internet

↓

Public Subnet

↓

EC2 Web Server
```

---

# Private Subnet

A **private subnet** has **no direct internet access**.

Examples:

- Databases
- Internal APIs
- Backend services

```text
Internet

↓

(No direct access)

↓

Private Subnet

↓

Database
```

This is much safer.

---

# Real Architecture

```text
Internet

↓

Public Subnet

↓

Web Server

↓

Private Subnet

↓

Database
```

Users reach the web server.

The web server communicates with the database.

Users never connect directly to the database.

---

# Internet Gateway (IGW)

A VPC doesn't automatically connect to the internet.

You attach an **Internet Gateway**.

```text
Internet

↓

Internet Gateway

↓

VPC
```

Without an IGW:

No internet access.

---

# Route Table

A route table tells AWS where to send network traffic.

Think of it like Google Maps.

Example:

```
Destination: Internet

↓

Go through Internet Gateway
```

Without a route table, packets don't know where to go.

---

# Public Route Table

```text
0.0.0.0/0

↓

Internet Gateway
```

`0.0.0.0/0` means **all destinations**.

---

# Private Route Table

```text
10.0.0.0/16

↓

Local Network
```

No internet route.

Only internal communication.

---

# NAT Gateway

Now comes an important question.

A private server may need internet access to:

- Download software updates
- Install packages
- Access external APIs

But we don't want the internet to initiate connections to it.

Solution:

**NAT Gateway**

```text
Private EC2

↓

NAT Gateway

↓

Internet
```

The private server can make outbound requests.

The internet still cannot directly reach it.

---

# Complete Architecture

```text
                    Internet
                        │
                Internet Gateway
                        │
          +-----------------------------+
          |            VPC              |
          |                             |
          |  Public Subnet              |
          |  +----------------------+   |
          |  | Load Balancer        |   |
          |  | Web Server (EC2)     |   |
          |  +----------------------+   |
          |              │              |
          |              ▼              |
          |  Private Subnet             |
          |  +----------------------+   |
          |  | App Server (EC2)     |   |
          |  | Database (RDS)       |   |
          |  +----------------------+   |
          |              │              |
          |              ▼              |
          |         NAT Gateway         |
          +-----------------------------+
```

---

# Security Groups

Think of Security Groups as the **security guard at each building**.

Example:

```
Web Server

Allow:

Port 80

Port 443

Port 22
```

Everything else is blocked.

---

# Network ACL (NACL)

A Network ACL is another layer of protection.

Think of it as the **security gate at the neighborhood entrance**.

```text
City Gate

↓

Network ACL

↓

Neighborhood

↓

Security Guard

↓

House
```

Both Security Groups and NACLs work together.

---

# Security Group vs NACL

| Security Group | Network ACL |
|----------------|-------------|
| Attached to EC2 | Attached to Subnet |
| Stateful | Stateless |
| Usually used more often | Adds subnet-level control |
| Default: deny inbound, allow all outbound unless changed | Rules evaluated in order, can allow and deny |

### What does "stateful" mean?

If a Security Group allows an incoming connection, the response traffic is automatically allowed back.

With a stateless NACL, you need explicit rules for both directions.

---

# Real Company Example

Suppose you're building Amazon.

```text
Customer

↓

Load Balancer

↓

Web Server

↓

Application Server

↓

Database
```

Where should each component go?

| Component | Location |
|-----------|----------|
| Load Balancer | Public Subnet |
| Web Server | Public or private (many modern designs use private) |
| Application Server | Private Subnet |
| Database | Private Subnet |

---

# Data Flow

```text
Customer

↓

Public IP

↓

Load Balancer

↓

Application

↓

Database

↓

Response

↓

Customer
```

The customer never talks directly to the database.

---

# Why Put Databases in Private Subnets?

Imagine your bank's database were directly exposed to the internet.

That would be a huge security risk.

Instead:

```
Internet

↓

Website

↓

Backend

↓

Database
```

The database is protected behind multiple layers.

---

# Interview Questions

Try answering these:

1. What is a VPC?
2. Why do we use subnets?
3. What is the difference between a public and a private subnet?
4. What does an Internet Gateway do?
5. What is a route table?
6. Why is a NAT Gateway needed?
7. What is the difference between a Security Group and a Network ACL?
8. Why should databases be in private subnets?

---

# Hands-on Lab

If you have an AWS account:

1. Create a new VPC with CIDR `10.0.0.0/16`.
2. Create:
   - One public subnet (`10.0.1.0/24`)
   - One private subnet (`10.0.2.0/24`)
3. Attach an Internet Gateway to the VPC.
4. Create a public route table and associate it with the public subnet.
5. Launch:
   - An EC2 instance in the public subnet.
   - (Optional) Another EC2 instance in the private subnet.
6. Verify that the public instance can be reached via SSH (if its security group allows it), while the private one cannot be reached directly from the internet.

---

# AWS Services You've Mastered So Far

| Service | Purpose |
|---------|---------|
| IAM | Identity & Access Management |
| EC2 | Virtual servers |
| S3 | Object storage |
| VPC | Private networking |

These four services are the foundation of most AWS deployments.

## Next Lesson: Amazon RDS (Relational Database Service)

You'll learn:

- Why managed databases are better than running MySQL on EC2
- MySQL, PostgreSQL, MariaDB, SQL Server, and Oracle support
- Multi-AZ deployments
- Read Replicas
- Automated backups
- Failover
- Scaling databases
- Real production architectures

By the end of that lesson, you'll understand how production applications store and protect their data.
