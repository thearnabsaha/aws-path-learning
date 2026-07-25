# Lesson 3: Amazon EC2 (Elastic Compute Cloud)

Now you launch compute: your first cloud server. EC2 is the foundation for understanding virtual machines, networking to a host, and running software in AWS.

By the end of this lesson, you will understand:

- What EC2 is
- How virtual machines work
- Instance types
- AMIs
- Storage
- Security Groups
- Key Pairs
- The complete EC2 launch process
- How to SSH into your server

---
# What is EC2?

**EC2 (Elastic Compute Cloud)** is a virtual computer running inside an AWS data center.

Instead of buying a physical computer, AWS creates one for you in minutes.

Think of it like this:

```text
Your Laptop
      ↓
Remote Computer (EC2)
      ↓
Runs 24×7
```

That remote computer can:

- Host websites
- Run APIs
- Process data
- Train AI models
- Run databases (though managed databases often use RDS)

---

# Real-World Example

Suppose you build a website.

Instead of keeping your laptop on all day:

```text
Visitors
     ↓
Your Laptop
```

you deploy it to EC2:

```text
Visitors
     ↓
Internet
     ↓
AWS EC2 Server
```

Now it's available even when your laptop is turned off.

---

# Anatomy of an EC2 Instance

An EC2 instance has several components:

| Component | Purpose |
|-----------|---------|
| CPU | Processes instructions |
| RAM | Temporary working memory |
| Storage | Stores files |
| Operating System | Ubuntu, Amazon Linux, Windows, etc. |
| Network | Connects to the internet or other AWS resources |

---

# EC2 Instance Types

AWS offers different "sizes" of computers.

Examples:

| Type | Best For |
|------|----------|
| t3.micro / t4g.micro | Learning, small websites |
| t3.small | Small applications |
| m7i | General-purpose workloads |
| c7i | CPU-intensive tasks |
| r7i | Memory-intensive workloads |
| g5 | GPU workloads like AI and graphics |

Think of it like renting cars:

| Car | Use |
|------|-----|
| Hatchback | Daily commute |
| SUV | Family trip |
| Truck | Heavy cargo |

Choose the instance type based on your workload.

---

# AMI (Amazon Machine Image)

An **AMI** is a preconfigured template for your server.

It's like choosing which operating system to install.

Popular choices include:

- Ubuntu
- Amazon Linux
- Windows Server
- Red Hat Enterprise Linux

When you launch an EC2 instance, AWS copies the selected AMI to create your server.

---

# EBS (Elastic Block Store)

Every computer needs a hard drive.

EC2 uses **EBS** volumes for persistent storage.

```text
EC2
 │
 └── EBS Volume
```

Your operating system, installed software, and files live here.

Even if you stop the instance, the EBS volume usually remains attached and retains your data (unless configured otherwise).

---

# Public vs Private IP

Every server gets IP addresses.

### Public IP

Accessible from the internet.

Example:

```text
54.201.10.22
```

People use this to reach your website or SSH into the server.

---

### Private IP

Used only inside your AWS network.

Example:

```text
172.31.x.x
```

Other AWS resources communicate with your server using private IPs when possible.

---

# Security Groups (Virtual Firewall)

A **Security Group** controls which traffic can reach your instance.

Example rules:

| Port | Protocol | Purpose |
|------|----------|----------|
| 22 | SSH | Remote login |
| 80 | HTTP | Website |
| 443 | HTTPS | Secure website |

Imagine your server is a house.

The Security Group is the security guard deciding who gets in.

If port 22 isn't allowed, SSH won't work.

---

# Common Ports

| Port | Service |
|------|----------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |

You'll use these frequently.

---

# Key Pair

AWS does **not** give you a default password for most Linux instances.

Instead, it uses **SSH key pairs**.

When you create a key pair:

```text
Private Key (.pem)
        +
Public Key
```

- AWS stores the **public key** on the instance.
- You download and keep the **private key** safely.

Never share your private key.

---

# Launching an EC2 Instance

The launch wizard typically asks for:

```text
Choose AMI
      ↓
Choose Instance Type
      ↓
Choose Key Pair
      ↓
Configure Network
      ↓
Configure Security Group
      ↓
Configure Storage
      ↓
Launch
```

---

# Connecting to Your Server

On macOS or Linux:

```bash
ssh -i mykey.pem ubuntu@YOUR_PUBLIC_IP
```

Example:

```bash
ssh -i arnab.pem ubuntu@54.221.12.18
```

If you're using Windows, you can use:

- Windows Terminal with OpenSSH
- PuTTY (older approach)
- VS Code Remote SSH extension

---

# What Happens After Login?

You'll see something like:

```text
ubuntu@ip-172-31-15-40:~$
```

You're now controlling a computer that's running in an AWS data center.

---

# Basic Linux Commands

| Command | Meaning |
|---------|---------|
| `pwd` | Show current directory |
| `ls` | List files |
| `cd folder` | Change directory |
| `mkdir demo` | Create directory |
| `touch app.txt` | Create file |
| `cat app.txt` | Display file contents |
| `rm app.txt` | Delete file |

These commands are essential for working with Linux servers.

---

# Installing Software

Ubuntu:

```bash
sudo apt update
sudo apt install nginx -y
```

This installs **Nginx**, a popular web server.

---

# Testing Your Website

After Nginx is running:

```text
Browser
      ↓
http://YOUR_PUBLIC_IP
      ↓
Welcome to Nginx!
```

Congratulations—you've deployed your first web server.

---

# Stopping vs Terminating

This is important:

| Action | Result |
|---------|--------|
| Stop | Instance shuts down but can usually be started again |
| Start | Boots the stopped instance |
| Reboot | Restarts the operating system |
| Terminate | Permanently deletes the instance |

Always double-check before terminating an instance.

---

# EC2 Lifecycle

```text
Launch
   ↓
Running
   ↓
Stop
   ↓
Start
   ↓
Terminate
```

---

# Complete Architecture

```text
Internet
     │
     ▼
Security Group
     │
     ▼
EC2 Instance
     │
     ▼
Ubuntu
     │
     ▼
Nginx
     │
     ▼
Your Website
```

---

# Interview Questions

Try answering these:

1. What is an EC2 instance?
2. What is an AMI?
3. What is an EBS volume?
4. What is the purpose of a Security Group?
5. What is the difference between a public IP and a private IP?
6. Why are SSH key pairs used instead of passwords on many Linux instances?
7. What is the difference between stopping and terminating an EC2 instance?

---

# Hands-on Lab

If you have an AWS account:

1. Launch a **t3.micro** (or **t4g.micro** if using an ARM-compatible AMI) Ubuntu instance.
2. Create a new key pair.
3. Allow:
   - SSH (22) from **your IP only** (safer than allowing everyone).
   - HTTP (80) from anywhere.
4. Connect using SSH.
5. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```
6. Open the public IP in your browser.
7. Verify the Nginx welcome page appears.
8. Stop the instance when you're done to avoid unnecessary charges.

---

## What's Next?

**Lesson 4: Amazon S3 (Simple Storage Service)**

You'll learn:

- Object storage vs file systems
- Buckets and objects
- Uploading files
- Permissions
- Static website hosting
- Versioning
- Lifecycle rules
- Storage classes
- Real-world architectures

After Lesson 4, you'll have enough knowledge to build a simple static website entirely on AWS.
