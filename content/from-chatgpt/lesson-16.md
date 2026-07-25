# Lesson 16 — Amazon CloudFront & Origin Access Control (OAC) (Complete Deep Dive)

> **Goal:** By the end of this lesson, you'll understand how the internet delivers content quickly around the world, what a CDN is, how CloudFront works internally, caching, cache invalidation, TTLs, signed URLs, signed cookies, Origin Access Control (OAC), and why almost every production website uses CloudFront.

If you open Netflix, Amazon, YouTube, Instagram, or almost any modern website, you're almost certainly using a CDN.

On AWS, that CDN is **Amazon CloudFront**.

---

# Learning Objectives

After this lesson, you'll understand:

- Why CDNs exist
- What latency is
- Edge Locations
- CloudFront Distributions
- Origins
- Cache
- Cache Hit vs Cache Miss
- TTL
- Cache Invalidation
- OAC (Origin Access Control)
- Signed URLs
- Signed Cookies
- Compression
- HTTPS
- Geo Restrictions
- Price Classes
- Real production architectures

---

# Chapter 1 — The Internet Isn't Magic

Suppose your website is hosted in Mumbai.

A user in Kolkata requests:

```
logo.png
```

Simple.

```
Kolkata

↓

Mumbai Server

↓

Image
```

Now imagine a user from Germany.

```
Germany

↓

Mumbai

↓

Germany
```

Distance increased.

Response becomes slower.

---

# What is Latency?

Latency is:

**The time it takes for data to travel.**

Example:

| User | Server | Latency |
|---------|-----------|---------|
| Mumbai | Mumbai | 10 ms |
| Delhi | Mumbai | 25 ms |
| Germany | Mumbai | 180 ms |
| USA | Mumbai | 250 ms |

The farther away the user is, the longer requests usually take.

---

# Problem

Imagine your application has:

- HTML
- CSS
- JavaScript
- Images
- Videos

Every request travels thousands of kilometres.

Users wait.

---

# Chapter 2 — What is a CDN?

CDN stands for:

**Content Delivery Network**

Instead of one server:

```
Mumbai Server
```

We create copies worldwide.

```
India

Germany

Japan

USA

Australia
```

Users download from the nearest location.

---

# Real-World Analogy

Suppose Amazon had one warehouse.

```
India

↓

Warehouse

↓

USA Customer
```

Very slow.

Instead:

```
USA Warehouse

Germany Warehouse

India Warehouse
```

Same idea.

CloudFront creates "warehouses" for your files.

---

# Chapter 3 — What is CloudFront?

CloudFront is AWS's CDN.

It caches content closer to users.

Instead of:

```
User

↓

Mumbai S3

↓

Response
```

It becomes:

```
User

↓

Nearest Edge Location

↓

Response
```

Much faster.

---

# Chapter 4 — Edge Locations

One of the most important CloudFront concepts.

AWS has hundreds of **Edge Locations** around the world.

Imagine:

```
London

Paris

Tokyo

Mumbai

Singapore

Sydney

New York
```

Each stores cached content.

---

Suppose your S3 bucket is in Mumbai.

A German user requests:

```
index.html
```

First request:

```
Germany

↓

Mumbai S3

↓

Germany
```

CloudFront stores a copy.

Second request:

```
Germany

↓

Frankfurt Edge

↓

Response
```

No trip to Mumbai.

Huge improvement.

---

# Chapter 5 — Origin

CloudFront doesn't create content.

It fetches content from an **Origin**.

Common origins:

- Amazon S3
- Application Load Balancer
- EC2
- API Gateway
- Custom HTTP servers

Example:

```
CloudFront

↓

Origin

↓

S3 Bucket
```

---

# Chapter 6 — CloudFront Distribution

Everything starts with a Distribution.

A Distribution defines:

- Origin
- Cache Behaviour
- SSL
- Domain Name
- Security
- Caching Rules

Think of it as:

```
CloudFront Configuration
```

---

# Chapter 7 — First Request

Suppose nobody has requested:

```
cat.jpg
```

Flow:

```
User

↓

CloudFront

↓

Cache?

↓

No

↓

Origin

↓

Image

↓

Store in Cache

↓

Return to User
```

---

# Chapter 8 — Cache Hit

Next customer asks:

```
cat.jpg
```

Now:

```
User

↓

CloudFront

↓

Cache Found

↓

Immediate Response
```

This is called:

**Cache Hit**

---

# Chapter 9 — Cache Miss

If CloudFront doesn't have it:

```
Cache Miss

↓

Origin

↓

Download

↓

Store

↓

Return
```

Every file starts as a cache miss.

---

# Cache Hit Ratio

One of the most important CloudFront metrics.

Example:

1000 requests

980 served from cache

20 from origin

Cache Hit Ratio:

98%

Excellent.

Higher cache hit ratio means:

- Faster users
- Lower origin load
- Lower costs

---

# Chapter 10 — Time To Live (TTL)

Should CloudFront cache forever?

No.

Example:

```
logo.png

↓

Cache

↓

24 Hours
```

After TTL expires:

CloudFront checks the origin again.

---

Different files need different TTLs.

Example:

Logo

```
1 Month
```

API Responses

```
5 Seconds
```

HTML

```
1 Minute
```

Product Images

```
1 Week
```

Choosing good TTLs is a balance between freshness and performance.

---

# Chapter 11 — Cache Invalidation

Suppose:

```
logo.png
```

changes today.

But CloudFront still has the old version.

What now?

You invalidate it.

```
Invalidate

↓

Remove Cached Copy

↓

Fetch New File
```

---

Common command:

```
/images/*
```

CloudFront removes those cached objects.

Next request fetches fresh content.

---

# Better Than Invalidation

Many companies don't invalidate often.

Instead:

```
logo_v2.png
```

or

```
main.8f72ab.js
```

This is called:

**Versioned Assets**

Much cheaper and more scalable.

---

# Chapter 12 — Compression

CloudFront supports compression.

Instead of sending:

```
500 KB CSS
```

It may send:

```
80 KB
```

using:

- Gzip
- Brotli

Benefits:

- Faster downloads
- Less bandwidth
- Lower costs

---

# Chapter 13 — HTTPS

CloudFront supports HTTPS.

Flow:

```
Browser

↓

HTTPS

↓

CloudFront

↓

Origin
```

SSL certificates usually come from:

AWS Certificate Manager (ACM)

---

# Chapter 14 — Origin Access Control (OAC)

This is one of the most important modern interview topics.

Years ago AWS used:

Origin Access Identity (OAI)

Today:

AWS recommends:

**Origin Access Control (OAC)**

---

# The Problem

Suppose your bucket is public.

```
Internet

↓

S3 Bucket
```

Anyone can bypass CloudFront.

They can directly download:

```
https://bucket.s3.amazonaws.com/file.jpg
```

This defeats the purpose of using CloudFront for controlled access.

---

# Solution

Make the bucket private.

```
Internet

↓

CloudFront

↓

Private S3
```

Only CloudFront may access S3.

Users cannot.

---

# How OAC Works

```
User

↓

CloudFront

↓

Signed Request

↓

Private S3 Bucket
```

S3 verifies:

"Did CloudFront send this?"

If yes:

Serve object.

Otherwise:

Access Denied.

---

# Benefits of OAC

- Private buckets
- Stronger security
- Better integration with AWS security features
- Recommended replacement for OAI

---

# Chapter 15 — Signed URLs

Suppose you're selling an online course.

Videos shouldn't be public.

Instead:

```
User

↓

Signed URL

↓

CloudFront

↓

Video
```

Signed URLs include:

- Expiration
- Signature
- Access conditions

After expiry:

Access denied.

---

# Example

Instead of:

```
video.mp4
```

You get:

```
video.mp4?Expires=...

&Signature=...

&Key-Pair-Id=...
```

The URL itself proves temporary permission.

---

# Chapter 16 — Signed Cookies

Signed URLs work well for one file.

But what if a user watches:

- Lesson 1
- Lesson 2
- Lesson 3
- Lesson 4
- Lesson 5

Creating five signed URLs is inconvenient.

Instead:

```
Login

↓

Receive Signed Cookie

↓

Access All Videos
```

One cookie authorises access to multiple protected objects.

---

# Signed URL vs Signed Cookie

| Signed URL | Signed Cookie |
|------------|---------------|
| One object | Many objects |
| Simpler | Better for websites with many protected assets |

---

# Chapter 17 — Geo Restriction

Suppose your licence allows streaming only in India.

CloudFront checks:

```
Request

↓

Country

↓

Allowed?
```

If not:

```
403 Forbidden
```

This is called:

**Geo Restriction (Geo Blocking)**

---

# Chapter 18 — Price Classes

CloudFront has Edge Locations worldwide.

More locations:

Higher cost.

You can choose a price class to limit which edge locations serve your content, trading off global reach and cost.

---

# Chapter 19 — Dynamic Content

Many people think CloudFront only caches images.

Wrong.

CloudFront can also accelerate:

- APIs
- Dynamic websites
- Web applications

Example:

```
User

↓

CloudFront

↓

Application Load Balancer

↓

EC2
```

CloudFront can forward requests while still providing HTTPS termination and other optimisations.

---

# Chapter 20 — CloudFront + S3 Static Website

Very common interview architecture.

```
Browser

↓

CloudFront

↓

Private S3 Bucket
```

Benefits:

- HTTPS
- Global caching
- Lower latency
- Better security
- DDoS protection integration
- Custom domains

---

# Chapter 21 — Production Architecture

Imagine an e-commerce website.

```
User
        │
        ▼
   CloudFront
        │
 ┌──────┴────────┐
 ▼               ▼
Private S3      ALB
(Images/CSS)     │
                 ▼
              ECS Service
                 │
                 ▼
                RDS
```

Static content comes from S3.

Dynamic requests go to ECS through the ALB.

Users only interact with CloudFront.

---

# Chapter 22 — Best Practices

- Keep S3 buckets private when using CloudFront.
- Use OAC instead of OAI for new deployments.
- Cache static assets aggressively.
- Use shorter TTLs for frequently changing content.
- Use versioned assets instead of frequent invalidations.
- Enable compression.
- Use HTTPS everywhere.
- Monitor cache hit ratio.
- Use signed URLs or signed cookies for premium content.

---

# Chapter 23 — Common Mistakes

❌ Making S3 buckets public.

❌ Invalidating the entire cache after every deployment.

❌ Using very short TTLs for static assets.

❌ Storing secrets in CloudFront headers.

❌ Forgetting HTTPS.

❌ Assuming CloudFront only works with S3.

---

# Chapter 24 — Interview Questions

### Q1. What is CloudFront?

AWS's global Content Delivery Network (CDN) that caches content at edge locations closer to users.

---

### Q2. What is an Edge Location?

A geographically distributed AWS location that caches content and serves users with lower latency.

---

### Q3. What is an Origin?

The source from which CloudFront fetches content, such as S3, an Application Load Balancer, EC2, or another HTTP server.

---

### Q4. What is the difference between a Cache Hit and a Cache Miss?

A cache hit is served directly from the edge cache. A cache miss requires CloudFront to retrieve content from the origin before caching it.

---

### Q5. What is TTL?

The duration cached content remains valid before CloudFront checks the origin again.

---

### Q6. Why is OAC better than a public S3 bucket?

OAC allows only CloudFront to access a private S3 bucket, preventing users from bypassing CloudFront and directly accessing the bucket.

---

### Q7. What is the difference between Signed URLs and Signed Cookies?

Signed URLs grant temporary access to individual objects. Signed Cookies grant access to multiple protected objects.

---

### Q8. Can CloudFront work with APIs?

Yes. CloudFront can front APIs and dynamic applications, not just static content.

---

### Q9. Why is versioning preferred over cache invalidation?

Versioning avoids expensive or large-scale invalidations and ensures users receive the latest assets by requesting new filenames.

---

### Q10. Does CloudFront store the original file?

No. The origin (such as S3 or an ALB-backed application) remains the source of truth. CloudFront stores cached copies according to its cache rules.

---

# Hands-on Lab

1. Create an S3 bucket.
2. Enable **Block Public Access**.
3. Upload a simple static website (`index.html`, CSS, images).
4. Create a CloudFront distribution with the S3 bucket as the origin.
5. Configure **Origin Access Control (OAC)** and update the bucket policy so only CloudFront can access the bucket.
6. Open the CloudFront domain name and verify the website loads.
7. Try accessing the S3 object URL directly—you should receive an access denied response.
8. Update an image, invalidate that path (or deploy a versioned filename), and observe the change through CloudFront.
9. Enable compression and inspect the response headers in your browser's developer tools.

---

# Final Mental Model

If you remember only one diagram from this lesson, remember this:

```text
                    User
                      │
                      ▼
                 CloudFront
          (Nearest Edge Location)
              │             │
      Cache Hit?         Cache Miss
         │                   │
         ▼                   ▼
   Return Cached       Fetch from Origin
      Content                │
                              ▼
                    Private S3 (OAC)
                       or ALB / API
                              │
                              ▼
                    Store Copy in Cache
                              │
                              ▼
                           User
```

The key ideas are:

- **CloudFront is AWS's CDN.**
- **Edge Locations cache content close to users.**
- **Origins hold the original content.**
- **OAC keeps S3 buckets private while allowing CloudFront access.**
- **Caching, TTLs, versioned assets, and secure access are what make CloudFront fast, scalable, and secure in production.**
