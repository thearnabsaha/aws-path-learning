# Lesson 17 — Amazon Route 53 (Complete Deep Dive)

> **Goal:** By the end of this lesson, you'll understand how the Internet finds websites, what DNS actually is, how Route 53 works internally, domain registration, hosted zones, DNS records, health checks, routing policies, failover, latency routing, weighted routing, geolocation routing, and how production AWS architectures use Route 53.

Every website you've ever visited—from Google to Netflix to Amazon—depends on DNS. If DNS stops working, the Internet effectively stops working.

---

# Learning Objectives

After this lesson, you should understand:

- What DNS is
- Why DNS exists
- What a domain name is
- What an IP address is
- What Route 53 is
- Hosted Zones
- DNS Records
- A, AAAA, CNAME, Alias, MX, TXT, NS records
- TTL
- Health Checks
- Routing Policies
- Failover Routing
- Latency Routing
- Weighted Routing
- Geolocation Routing
- Multi-region architectures

---

# Chapter 1 — Why DNS Exists

Imagine there were no domain names.

To visit Google you would type something like:

```text
142.250.183.78
```

To visit Amazon:

```text
205.251.xxx.xxx
```

To visit ChatGPT:

Another IP.

Can humans remember hundreds of IP addresses?

No.

Instead we remember:

```text
google.com
amazon.com
openai.com
```

Much easier.

---

# What is DNS?

DNS stands for:

**Domain Name System**

Think of it as:

> **The Internet's Phone Book**

Just like your phone converts:

```text
Mom
```

into

```text
+91 XXXXX XXXXX
```

DNS converts:

```text
amazon.com
```

into

```text
54.xx.xx.xx
```

---

# Chapter 2 — Domain Name

Example:

```text
www.company.com
```

We break it apart.

```text
www.company.com
│    │       │
│    │       └── Top-Level Domain (TLD)
│    └────────── Domain
└────────────── Subdomain
```

Examples of TLDs:

- .com
- .org
- .net
- .io
- .ai
- .dev

---

# Chapter 3 — What Happens When You Type a Website?

Suppose you type:

```text
www.amazon.com
```

You don't immediately connect to Amazon.

Instead:

```text
Browser

↓

DNS Lookup

↓

IP Address

↓

Amazon Server

↓

Website
```

DNS is consulted first.

---

# Chapter 4 — Recursive Resolver

Your computer doesn't know every website.

It asks a DNS resolver.

Usually provided by:

- ISP
- Google DNS (8.8.8.8)
- Cloudflare (1.1.1.1)

Flow:

```text
Computer

↓

DNS Resolver

↓

Internet

↓

Answer
```

---

# Chapter 5 — What is Route 53?

Route 53 is AWS's managed DNS service.

It can:

- Register domains
- Host DNS records
- Route traffic
- Perform health checks
- Support global failover

Why is it called **Route 53**?

Because DNS traditionally uses **port 53** for communication.

---

# Chapter 6 — Domain Registration

Suppose you want:

```text
arnabsaha.dev
```

First:

Check availability.

If available:

Register it.

AWS becomes the domain registrar (or you can register elsewhere and still use Route 53 for DNS).

---

# Chapter 7 — Hosted Zones

A Hosted Zone stores DNS records.

Imagine:

```text
company.com
```

Inside:

```text
company.com

↓

Hosted Zone

↓

All DNS Records
```

Think of it as a folder containing DNS information.

---

There are two types.

### Public Hosted Zone

Visible to the Internet.

Example:

```text
amazon.com
```

---

### Private Hosted Zone

Only visible inside a VPC.

Useful for:

```text
database.internal
```

Only EC2 instances inside the VPC can resolve it.

---

# Chapter 8 — DNS Records

A DNS record maps names to destinations.

Example:

```text
www.company.com

↓

52.14.xx.xx
```

There are many record types.

---

# Chapter 9 — A Record

Most common.

Maps:

```text
Name

↓

IPv4 Address
```

Example:

```text
example.com

↓

54.120.xx.xx
```

---

# Chapter 10 — AAAA Record

Same idea.

But for IPv6.

```text
example.com

↓

2600:9000:...
```

---

# Chapter 11 — CNAME Record

CNAME means:

**Canonical Name**

Instead of pointing to an IP...

It points to another DNS name.

Example:

```text
blog.company.com

↓

company-blog.example.com
```

DNS performs another lookup.

---

# CNAME Limitation

You cannot create a CNAME for the **zone apex**.

Example:

```text
company.com
```

Cannot be a CNAME in standard DNS.

AWS solves this with Alias Records.

---

# Chapter 12 — Alias Record

Alias is an AWS-specific feature.

Instead of:

```text
company.com

↓

IP Address
```

It can point directly to:

- CloudFront
- ALB
- S3 Website Endpoint
- API Gateway
- Global Accelerator
- Another Route 53 record

Example:

```text
company.com

↓

CloudFront Distribution
```

No IP management required.

This is one of Route 53's biggest advantages.

---

# Chapter 13 — MX Record

Mail Exchange.

Example:

```text
company.com

↓

Google Workspace

↓

Email
```

Without MX records:

Email won't arrive.

---

# Chapter 14 — TXT Record

Stores arbitrary text.

Common uses:

- Domain verification
- SPF
- DKIM
- DMARC

Example:

```text
"google-site-verification=..."
```

---

# Chapter 15 — NS Record

NS stands for:

**Name Server**

These records tell the Internet:

Who is responsible for this domain?

Example:

```text
company.com

↓

ns-123.awsdns.com
```

---

# Chapter 16 — TTL (Time To Live)

DNS isn't looked up every second.

Results are cached.

Example:

```text
company.com

↓

IP Address

↓

Cache 300 Seconds
```

TTL:

300 seconds.

For five minutes:

Use cached answer.

After that:

Query DNS again.

---

Small TTL:

- Faster updates
- More DNS queries

Large TTL:

- Better performance
- Slower propagation of changes

---

# Chapter 17 — Health Checks

Suppose:

Your application crashes.

Should Route 53 still send users there?

No.

Health checks continuously test endpoints.

```text
Route 53

↓

HTTP Request

↓

Healthy?
```

If unhealthy:

Stop sending traffic.

---

# Chapter 18 — Routing Policies

This is where Route 53 becomes powerful.

Different users can receive different answers.

---

## Simple Routing

Everyone gets:

```text
company.com

↓

Server A
```

---

## Weighted Routing

Suppose:

New version.

You don't trust it yet.

Instead:

```text
90%

↓

Server A

10%

↓

Server B
```

Gradually increase:

10%

20%

50%

100%

Perfect for deployments.

---

# Chapter 19 — Failover Routing

Suppose:

Primary server dies.

```text
Primary

↓

Health Check

↓

Failed

↓

Secondary
```

Users automatically move.

This is Disaster Recovery.

---

# Chapter 20 — Latency Routing

Imagine:

Users from:

India

Germany

Japan

USA

Should everyone use Mumbai?

No.

Instead:

```text
India

↓

Mumbai

Germany

↓

Frankfurt

USA

↓

Virginia
```

Route 53 returns the endpoint with the lowest network latency.

---

# Chapter 21 — Geolocation Routing

This is different.

Latency Routing asks:

> Fastest?

Geolocation Routing asks:

> Which country?

Example:

```text
India

↓

Indian Website

USA

↓

US Website

Germany

↓

German Website
```

Useful for:

- Language
- Legal requirements
- Regional content

---

# Chapter 22 — Geoproximity Routing (Overview)

AWS also supports geoproximity routing (using Traffic Flow).

Traffic can be shifted geographically based on configured bias.

This is a more advanced feature typically used in large global deployments.

---

# Chapter 23 — Multi-Region Architecture

Imagine:

```text
Mumbai

Frankfurt

Virginia
```

Each runs your application.

Route 53 decides where users go.

Architecture:

```text
User

↓

Route 53

↓

Nearest Healthy Region

↓

ALB

↓

Application
```

---

# Chapter 24 — Route 53 + CloudFront

One of the most common architectures.

```text
www.company.com

↓

Route 53

↓

CloudFront

↓

Private S3

or

ALB
```

Users never need to know the CloudFront domain name.

---

# Chapter 25 — Route 53 + Load Balancer

```text
company.com

↓

Alias Record

↓

Application Load Balancer

↓

EC2 / ECS
```

Notice:

No IP addresses anywhere.

---

# Chapter 26 — Production Architecture

A global application.

```text
                 Users
                   │
                   ▼
              Route 53
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
  Mumbai ALB   Frankfurt ALB  Virginia ALB
       │             │             │
       ▼             ▼             ▼
   ECS Service   ECS Service   ECS Service
       │             │             │
       ▼             ▼             ▼
         Regional Databases
```

Route 53 sends users to the best endpoint according to the selected routing policy.

---

# Chapter 27 — Best Practices

- Use Alias records for AWS resources whenever possible.
- Use health checks for critical services.
- Use latency routing for global applications.
- Use weighted routing for blue/green and canary deployments.
- Keep TTLs short during migrations and longer during stable operation.
- Separate public and private hosted zones.
- Monitor DNS health and query metrics.

---

# Chapter 28 — Common Mistakes

❌ Confusing Alias and CNAME.

❌ Using CNAME for the root domain.

❌ Setting very long TTLs before a migration.

❌ Forgetting health checks on failover endpoints.

❌ Using a single region for a global application when low latency is a requirement.

---

# Chapter 29 — Interview Questions

### Q1. What is DNS?

A distributed system that translates human-readable domain names into IP addresses.

---

### Q2. What is Route 53?

AWS's managed DNS service for domain registration, DNS hosting, health checks, and traffic routing.

---

### Q3. Why is it called Route 53?

Because DNS traditionally operates over port 53.

---

### Q4. What is a Hosted Zone?

A container that stores DNS records for a domain.

---

### Q5. Difference between Public and Private Hosted Zones?

Public zones are accessible from the Internet. Private zones are only resolvable within associated VPCs.

---

### Q6. Difference between CNAME and Alias?

| CNAME | Alias |
|--------|-------|
| Standard DNS record | AWS-specific feature |
| Points to another hostname | Can point directly to AWS resources |
| Cannot be used at the root domain | Can be used at the root domain |
| DNS lookup incurs another resolution step | Route 53 resolves the AWS target transparently |

---

### Q7. What is TTL?

The duration for which DNS responses may be cached before a fresh lookup is required.

---

### Q8. What is Weighted Routing?

A routing policy that distributes traffic across multiple resources according to assigned weights.

---

### Q9. What is Latency Routing?

A routing policy that sends users to the endpoint with the lowest network latency.

---

### Q10. What is Failover Routing?

A routing policy that directs traffic to a secondary endpoint when the primary endpoint fails its health checks.

---

# Hands-on Lab

1. Register a test domain (or use an existing one).
2. Create a Public Hosted Zone.
3. Create:
   - An A record
   - A CNAME record
   - A TXT record
4. Create a CloudFront distribution.
5. Create an Alias record pointing your domain to CloudFront.
6. Configure an ACM certificate and enable HTTPS.
7. Create two simple EC2 instances in different regions (or simulate endpoints).
8. Configure health checks and a failover routing policy.
9. Stop the primary instance and observe Route 53 directing traffic to the secondary endpoint.

---

# Final Mental Model

If you remember only one diagram from this lesson, remember this:

```text
                 User
                   │
     Types www.company.com
                   │
                   ▼
              DNS Resolver
                   │
                   ▼
               Route 53
                   │
         (Routing Policy Decision)
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
 CloudFront       ALB        EC2/API
     │             │             │
     ▼             ▼             ▼
   S3 Bucket     ECS/EC2     Application
```

The key ideas are:

- **Route 53 is AWS's managed DNS service.**
- **DNS translates names into destinations.**
- **Hosted Zones contain DNS records.**
- **Alias records integrate directly with AWS resources.**
- **Routing policies let Route 53 make intelligent traffic decisions based on health, latency, geography, or weights.**

Together with CloudFront from the previous lesson, Route 53 forms the front door of many production AWS architectures.
