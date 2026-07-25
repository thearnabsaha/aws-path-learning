# Lesson 4: Amazon S3 (Simple Storage Service)

Almost every company on AWS uses Amazon S3. This lesson covers how cloud object storage works—for files, backups, static sites, logs, and large data—without managing disks yourself.


---
# What is Amazon S3?

**Amazon S3 (Simple Storage Service)** is an **object storage** service.

Instead of storing files on your laptop:

```text
Laptop
 ├── photo.jpg
 ├── resume.pdf
 └── video.mp4
```

You store them in AWS:

```text
Amazon S3
 ├── photo.jpg
 ├── resume.pdf
 └── video.mp4
```

S3 is designed to store virtually unlimited amounts of data with very high durability.

---

# What is Object Storage?

Unlike a traditional hard drive with folders and partitions, S3 stores **objects**.

An object contains:

- The file itself
- Metadata (information about the file)
- A unique identifier (key)

Example:

```text
Object
 ├── File: cat.jpg
 ├── Size: 2 MB
 ├── Content-Type: image/jpeg
 └── Key: images/cat.jpg
```

---

# Bucket

A **bucket** is like a top-level container for your objects.

Think of it as a storage box.

```text
Bucket: arnab-portfolio

    ├── resume.pdf
    ├── profile.jpg
    ├── index.html
    └── css/
```

Every object must belong to a bucket.

---

# Bucket Names

Bucket names must be globally unique across all AWS accounts.

Good examples:

- `arnab-resume-2026`
- `my-company-assets`
- `photos-backup-india`

Bad examples:

- `bucket`
- `test`
- `images`

Someone else may already own those names.

---

# Object Key

The **key** is the object's full path inside the bucket.

Example:

```text
Bucket
│
├── images/
│      ├── cat.jpg
│      └── dog.jpg
```

Keys:

```text
images/cat.jpg

images/dog.jpg
```

S3 doesn't actually use folders the way a file system does—it uses object keys that look like paths.

---

# Uploading Files

You can upload through:

- AWS Console
- AWS CLI
- AWS SDKs (Python, Java, JavaScript, etc.)

Example with the CLI:

```bash
aws s3 cp photo.jpg s3://arnab-portfolio/
```

This uploads `photo.jpg` to the bucket.

---

# Downloading Files

```bash
aws s3 cp s3://arnab-portfolio/photo.jpg .
```

The `.` means "download into the current directory."

---

# Permissions

By default:

**Everything is private.**

No one on the internet can access your files unless you explicitly allow it.

This is an important security feature.

---

# Static Website Hosting

S3 can host static websites.

A static website includes files like:

- HTML
- CSS
- JavaScript
- Images

Example:

```text
Bucket

index.html

style.css

logo.png
```

Users visit:

```text
Internet
      ↓
S3 Bucket
      ↓
Website
```

No EC2 server is required.

---

# Static vs Dynamic Websites

| Static | Dynamic |
|---------|----------|
| HTML/CSS/JS | Code runs on the server |
| No database | Often uses a database |
| Fast | More flexible |
| Low cost | Higher cost |

Examples:

Static:

- Portfolio
- Resume
- Documentation
- Landing page

Dynamic:

- Amazon
- Facebook
- Gmail

---

# Versioning

Imagine you accidentally overwrite a file.

Without versioning:

```text
resume.pdf

↓

New upload

↓

Old file lost
```

With versioning:

```text
Version 1

↓

Version 2

↓

Version 3
```

You can restore an earlier version if needed.

---

# Storage Classes

Not all files need the same storage.

AWS offers different storage classes based on how often you access the data.

| Storage Class | Best For |
|---------------|----------|
| S3 Standard | Frequently accessed files |
| S3 Intelligent-Tiering | Automatic optimization for changing access patterns |
| S3 Standard-IA | Infrequently accessed files |
| S3 Glacier Instant Retrieval | Archived data that still needs fast retrieval |
| S3 Glacier Flexible Retrieval | Long-term archives |
| S3 Glacier Deep Archive | Rarely accessed data kept for years |

---

# Lifecycle Rules

Suppose you upload backups every day.

After:

- 30 days → Move to a cheaper storage class.
- 180 days → Move to Glacier.
- 7 years → Delete.

AWS can automate this.

```text
Upload
   ↓
30 Days
   ↓
Cheaper Storage
   ↓
Archive
   ↓
Delete
```

---

# Encryption

S3 supports encryption to protect your data.

Common options include:

- **Server-Side Encryption (SSE)** managed by AWS
- **AWS KMS** for more control over encryption keys
- **Client-Side Encryption** before uploading

Many organizations enable encryption by default.

---

# Durability vs Availability

These terms are easy to confuse.

### Durability

"Will my file still exist?"

S3 is designed for extremely high durability.

---

### Availability

"Can I access my file right now?"

A service can be highly durable even if it's temporarily unavailable.

---

# Real-World Examples

### Store Images

```text
Users

↓

Upload Photo

↓

S3
```

---

### Website Hosting

```text
Browser

↓

S3

↓

Portfolio Website
```

---

### Backup Storage

```text
Laptop

↓

Nightly Backup

↓

S3
```

---

### Application Logs

```text
EC2

↓

Application Logs

↓

S3
```

---

# EC2 vs S3

| EC2 | S3 |
|------|----|
| Runs applications | Stores files |
| Has CPU & RAM | No CPU or RAM |
| Operating system | No operating system |
| You manage the server | AWS manages the storage service |

Think of it like this:

- **EC2 = Computer**
- **S3 = Cloud hard drive**

---

# AWS Architecture Example

```text
Users
     │
     ▼
Website
     │
     ▼
EC2
     │
     ├── Database (RDS)
     │
     └── Images
           │
           ▼
          S3
```

The application runs on EC2, stores structured data in a database, and keeps images and documents in S3.

---

# Hands-on Lab

If you have an AWS account:

1. Create an S3 bucket with a unique name.
2. Upload:
   - A photo
   - A PDF
   - A text file
3. Enable versioning.
4. Replace one of the files with a new version.
5. View the version history.
6. (Optional) Enable static website hosting and upload a simple `index.html` file.

---

# Interview practice prompts

Use these as open-ended prompts (the lesson quiz below is multiple choice).

1. What is an S3 bucket?
2. What is an object?
3. What is an object key?
4. Why are bucket names globally unique?
5. What is versioning?
6. What is the difference between EC2 and S3?
7. What is a lifecycle rule?
8. When would you use Glacier instead of Standard storage?
9. Why is S3 a good choice for storing images and backups?

---

# So Far You've Learned

| Service | Purpose |
|---------|---------|
| IAM | Identity and access management |
| EC2 | Virtual servers |
| S3 | Object storage for files |

These three services form the foundation of many AWS architectures.

## Next Lesson: Networking with VPC

This is where you'll learn how AWS networking works, including:

- What a **VPC (Virtual Private Cloud)** is
- Public vs private subnets
- Internet Gateways
- Route Tables
- NAT Gateways
- Security Groups vs Network ACLs
- How EC2, RDS, and S3 communicate securely

Networking is one of the most important AWS topics for real-world deployments and technical interviews.
