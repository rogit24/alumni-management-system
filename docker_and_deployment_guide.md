# Dockerization and Deployment Guide

This guide details how to containerize the Alumni Management System microservices using Docker and run/deploy them locally or to the cloud.

---

## 1. Directory Structure with Docker Assets

When containerization is implemented, the project structure will look like this:

```
e:\alumni-management-system\
├── pom.xml
├── docker-compose.yml               # Orchestrates database and all containers
├── ServiceRegistry\
│   ├── Dockerfile
│   └── ...
├── ApiGateway\
│   ├── Dockerfile
│   └── ...
├── UserService\
│   ├── Dockerfile
│   └── ...
├── TemplateMS\
│   ├── Dockerfile
│   └── ...
```

---

## 2. Dockerfile Templates

Each microservice is built into a self-contained executable JAR using Maven and then run on a lightweight Java Runtime Environment (JRE) base image.

### A. Infrastructure Services (`ServiceRegistry` and `ApiGateway`)
Create a file named `Dockerfile` in `/ServiceRegistry` and `/ApiGateway` directories:

```dockerfile
# Use a lightweight JRE base image
FROM eclipse-temurin:17-jre-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the packaged jar from the target folder
COPY target/*.jar app.jar

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### B. Functional Services (`UserService`, `TemplateMS` and others)
Create a file named `Dockerfile` in `/UserService` (and eventually `/ProfileMS`, `/JobMS`, etc.):

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar

# Wait utility (optional but recommended) to ensure DB is up before the service starts
# Expose default port
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 3. The Multi-Container Orchestra (`docker-compose.yml`)

The root `docker-compose.yml` defines the MySQL database and all microservices, tying them together on a shared virtual network so they can resolve each other by service names.

Create a `docker-compose.yml` file at the root of `e:\alumni-management-system\`:

```yaml
version: '3.8'

services:
  # 1. MySQL Database Container
  alumni-db:
    image: mysql:8.0
    container_name: alumni-db
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: alumni_db
      MYSQL_ROOT_PASSWORD: manager
    networks:
      - alumni-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-pmanager"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Service Registry (Eureka Server)
  service-registry:
    build:
      context: ./ServiceRegistry
      dockerfile: Dockerfile
    container_name: service-registry
    ports:
      - "8761:8761"
    networks:
      - alumni-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8761/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 3. API Gateway
  api-gateway:
    build:
      context: ./ApiGateway
      dockerfile: Dockerfile
    container_name: api-gateway
    ports:
      - "9191:9191"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
      - JWT_SECRET=my_super_secret_key_which_is_long_enough_for_sha256_key_and_more_characters_for_security
    depends_on:
      service-registry:
        condition: service_healthy
    networks:
      - alumni-network

  # 4. UserService (Authentication Core)
  user-service:
    build:
      context: ./UserService
      dockerfile: Dockerfile
    container_name: user-service
    ports:
      - "8081:8081"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://alumni-db:3306/alumni_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=manager
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
      - JWT_SECRET=my_super_secret_key_which_is_long_enough_for_sha256_key_and_more_characters_for_security
      - JWT_EXPIRATION_MS=86400000
    depends_on:
      alumni-db:
        condition: service_healthy
      service-registry:
        condition: service_healthy
    networks:
      - alumni-network

networks:
  alumni-network:
    driver: bridge
```

---

## 4. How to Run Locally with Docker

Follow these commands to build and start your application:

### Step A: Build the Executable JARs
Ensure Maven is installed locally. Run from the workspace root (`e:\alumni-management-system`):
```bash
mvn clean package -DskipTests
```
This command compiles all the Java services and outputs `.jar` files in their respective `target/` directories.

### Step B: Build and Start Containers
Spin up all containers (DB + Registry + Gateway + UserService):
```bash
docker-compose up --build
```

- To run in the background (detached mode): `docker-compose up -d --build`
- To stop the services: `docker-compose down`
- To stop and delete all volumes (clears database): `docker-compose down -v`

---

## 5. Free Cloud Deployment Guide on AWS (Free Tier)

This section outlines how to deploy the entire Alumni Connect backend microservice mesh for free on AWS using the **AWS Free Tier** (12 Months Free).

### Step A: Launch a t3.small EC2 Instance
1. Log in to your AWS Console and navigate to **EC2**.
2. Click **Launch Instance** and configure:
   - **Name**: `alumni-connect-backend`
   - **OS (AMI)**: `Ubuntu Server 22.04 LTS` (Free tier eligible)
   - **Instance Type**: `t3.small` (2 vCPUs, 2 GiB RAM - ideal for running our microservice mesh).
   - **Key Pair**: Create or select a key pair. If creating a new one:
     - **Name**: `alumni-connect-key`
     - **Key pair type**: `RSA`
     - **Private key file format**: `.pem`
   - **Storage**: Modify the **Root Volume** size directly to `30 GiB` gp3. (The root volume *is* an EBS volume. Do not add a secondary volume; just increase the root volume's default size to 30 GiB to keep everything on one drive and stay within the Free Tier limit. The file system for the root volume is managed and formatted automatically by AWS as `ext4` during launch, so you don't need to configure any filesystem settings manually).
 3. Under **Network Settings**, click the **Create security group** checkbox (or select an existing security group). Add the following **Inbound security group rules**:

    | Sl. No. | Type | Protocol | Port Range | Source | Description |
    | :--- | :--- | :--- | :--- | :--- | :--- |
    | **1** | `SSH` | `TCP` | `22` | `My IP` (Recommended) or `Anywhere-IPv4` (`0.0.0.0/0`) | Allows you to securely connect to the terminal of your EC2 instance via SSH for deployment. |
    | **2** | `Custom TCP` | `TCP` | `9191` | `Anywhere-IPv4` (`0.0.0.0/0`) | Allows your frontend application (e.g. deployed on Vercel/Netlify) to make API calls to the central Gateway. |

    > [!IMPORTANT]
    > Do **NOT** expose individual ports for your database (3306), Service Registry (8761), or other downstream microservices (8081-8087, 8000) to the public. The API Gateway (9191) handles routing to all of these internally on the containerized network, keeping your database and services secure.

 4. Click **Launch**.

---

### Step B: Connect to your EC2 Instance via SSH
Once the instance status changes to **Running** on the AWS Console, connect to it using your terminal (Windows PowerShell, Command Prompt, or Linux/macOS terminal):

1. Locate your downloaded key pair file (e.g., `alumni-connect-key.pem`).
2. Open your terminal and navigate to the directory where the file is stored (usually the `Downloads` folder):
   ```powershell
   cd ~/Downloads
   ```
3. *(Only for Linux/macOS users)* Modify file permissions so the private key is not publicly viewable:
   ```bash
   chmod 400 alumni-connect-key.pem
   ```
4. Connect to the EC2 instance by running the following command on **your local computer's terminal** (this command is what initiates the connection to the remote AWS server):
   ```bash
   ssh -i "alumni-connect-key.pem" ubuntu@<your-ec2-public-ip-address>
   ```
5. Type `yes` and press Enter when prompted to accept the host authenticity.

Once connected, your terminal prompt will change to show something like `ubuntu@ip-172-xx-xx-xx:~$`. **From this point forward, all subsequent commands (Steps C, D, and E) should be typed in this connected terminal window**, which is executing commands directly on your remote EC2 server.


---

### Step C: Configure Swap Space (CRITICAL)
Although a `t3.small` instance has **2 GB of RAM**, running a MySQL database, 8 Java microservices, a .NET service, and a Python AI service simultaneously will consume around 2.5 GB to 3 GB. To guarantee bulletproof stability and prevent the operating system from terminating your containers with Out-Of-Memory (OOM) errors, **you must configure a 4 GB Swap space** (virtual memory on disk).

In your active SSH terminal, run:
```bash
# 1. Allocate a 4 GB swap file on the disk
sudo fallocate -l 4G /swapfile

# 2. Adjust permissions so only root can read and write
sudo chmod 600 /swapfile

# 3. Format the file as swap space
sudo mkswap /swapfile

# 4. Enable the swap file
sudo swapon /swapfile

# 5. Make the swap file permanent across server restarts
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Verify that swap is active (should show ~2.0G RAM and ~4.0G Swap)
free -h
```

---

### Step D: Install Docker & Docker Compose on the Instance
In your EC2 SSH session, run the following commands to install the container runtime environment:
```bash
# 1. Update packages and install Docker
sudo apt-get update
sudo apt-get install -y docker.io

# 2. Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 3. Add the default 'ubuntu' user to the docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker ubuntu

# 4. Install Docker Compose (V2)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Reload your shell to apply docker group changes
newgrp docker
```

---

### Step E: Clone, Build and Run the Application
1. Clone your repository onto the EC2 instance:
   ```bash
   git clone <your-repository-url> alumni-management-system
   cd alumni-management-system
   ```
2. Install JDK 17 on the EC2 host to allow compiling the Java microservices:
   ```bash
   sudo apt-get install -y openjdk-17-jdk
   ```
3. Compile the Java microservices using the embedded Maven wrapper. Grant it execute permissions first:
   ```bash
   chmod +x .maven/apache-maven-3.9.9/bin/mvn
   ./.maven/apache-maven-3.9.9/bin/mvn clean package -DskipTests
   ```
   *(Note: Thanks to the 4 GB swap space configured in Step C, the 2 GB RAM server will compile all 8 microservices smoothly without memory errors).*

4. Create your environmental variables file (`.env`) at the repository root to inject your AI keys:
   ```bash
   nano .env
   ```
   Add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
5. Build and launch all containerized services in detached background mode:
   ```bash
   docker-compose up -d --build
   ```
6. Verify that all 11 containers are active:
   ```bash
   docker ps
   ```

Now, your backend is securely deployed and accessible at `http://<your-ec2-public-ip>:9191`!

---

## 6. Frontend Configuration Guide

Your frontend is a React application built with **Vite**. It is configured to read the API Gateway base URL from the `VITE_API_BASE_URL` environment variable, defaulting to `http://localhost:9191` if none is specified.

To connect your frontend to the newly deployed AWS backend, follow these options:

### Option A: During Local Development (Connecting to AWS Backend)
If you want to run the frontend server locally on your laptop (`npm run dev`) but connect to the remote AWS EC2 backend databases and services:
1. Create a file named `.env` in the root of the `alumni-system-client/` directory:
   ```env
   VITE_API_BASE_URL=http://<your-ec2-public-ip>:9191
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```

### Option B: During Production Frontend Deployment (Vercel / Netlify)
If you are deploying the frontend application to a cloud host (such as **Vercel** or **Netlify**):
1. Go to your site dashboard on the hosting provider (e.g. Vercel Project Settings -> **Environment Variables**).
2. Add a new variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `http://<your-ec2-public-ip>:9191`
3. Deploy the application. Vite will automatically embed this endpoint into the production bundle during build time.


