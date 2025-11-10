# Deployment Guide

**3D Packaging Configurator - Production Deployment Instructions**

This document provides comprehensive deployment instructions for hosting the 3D Packaging Configurator across multiple platforms and environments. Choose the deployment strategy that best aligns with your infrastructure requirements, team expertise, and operational constraints.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Vercel Deployment](#vercel-deployment)
3. [Netlify Deployment](#netlify-deployment)
4. [Self-Hosted Deployment](#self-hosted-deployment)
5. [Docker Deployment](#docker-deployment)
6. [AWS Deployment](#aws-deployment)
7. [Environment Configuration](#environment-configuration)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

### Application Architecture

The 3D Packaging Configurator is a static single-page application built with React and Vite. The production build generates optimized HTML, CSS, and JavaScript files that can be served from any static hosting platform or web server. The application requires no backend server, database, or server-side rendering, simplifying deployment and reducing operational complexity.

### Build Output

Running `pnpm build` produces the following structure in the `dist/` directory:

```
dist/
├── index.html              # Entry point HTML file
├── assets/                 # Bundled and hashed assets
│   ├── index-[hash].js    # Main JavaScript bundle
│   ├── index-[hash].css   # Compiled CSS
│   └── [asset]-[hash].ext # Images, fonts, other assets
├── models/                 # 3D model OBJ files
└── assets/                 # Static images and logos
```

All files include content hashes in their filenames for optimal cache invalidation. The `index.html` file automatically references the correct hashed asset filenames.

### Deployment Requirements

Any deployment platform must meet these minimum requirements. The platform must serve static files over HTTPS for security and modern browser compatibility. Support for custom HTTP headers enables proper caching strategies and security policies. The ability to configure redirects or rewrites ensures client-side routing functions correctly, redirecting all paths to `index.html` for single-page application behavior.

---

## Vercel Deployment

Vercel provides zero-configuration deployment for Vite applications with automatic HTTPS, global CDN distribution, and seamless git integration.

### Prerequisites

Create a Vercel account at `https://vercel.com` if you do not already have one. Install the Vercel CLI globally on your development machine:

```bash
npm install -g vercel
```

Ensure your project is tracked in a git repository (GitHub, GitLab, or Bitbucket) for automatic deployments on push.

### Deployment Steps

#### Method 1: Git Integration (Recommended)

Push your project to a git repository on GitHub, GitLab, or Bitbucket. Navigate to the Vercel dashboard and click "Add New Project". Select your repository from the list of available repositories. Vercel automatically detects the Vite framework and configures build settings:

- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

Click "Deploy" to initiate the first deployment. Vercel builds the project and deploys it to a production URL within 1-2 minutes. Subsequent git pushes to the main branch trigger automatic redeployments.

#### Method 2: CLI Deployment

Navigate to your project root directory in the terminal. Run the Vercel deployment command:

```bash
vercel
```

The CLI prompts for project configuration on first deployment. Accept the detected settings for Vite. The deployment completes and provides a preview URL. To deploy to production:

```bash
vercel --prod
```

### Custom Domain Configuration

In the Vercel dashboard, navigate to your project settings and select the "Domains" tab. Enter your custom domain name (e.g., `configurator.yourcompany.com`). Vercel provides DNS configuration instructions. Add the required DNS records to your domain registrar:

- **A Record**: Point to Vercel's IP address
- **CNAME Record**: Point to `cname.vercel-dns.com`

SSL certificates are automatically provisioned and renewed via Let's Encrypt within minutes of DNS propagation.

### Environment Variables

Configure environment variables in the Vercel dashboard under Project Settings → Environment Variables. Add each variable with the `VITE_` prefix:

```
VITE_APP_TITLE=3D Packaging Configurator
VITE_APP_LOGO=/assets/logo.png
```

Redeploy the application after adding environment variables for changes to take effect.

---

## Netlify Deployment

Netlify offers similar functionality to Vercel with excellent support for static sites and serverless functions.

### Prerequisites

Create a Netlify account at `https://netlify.com`. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

### Deployment Steps

#### Method 1: Git Integration

Push your project to a git repository. In the Netlify dashboard, click "Add new site" and select "Import an existing project". Choose your git provider and authorize Netlify to access your repositories. Select the repository containing your project.

Configure build settings:

- **Build Command**: `pnpm build`
- **Publish Directory**: `dist`
- **Base Directory**: (leave empty)

Netlify automatically installs dependencies using the detected package manager. Click "Deploy site" to begin the build process. The site deploys to a random subdomain (e.g., `random-name-12345.netlify.app`) within 2-3 minutes.

#### Method 2: Manual Deployment

Build the project locally:

```bash
pnpm build
```

Deploy the `dist/` directory to Netlify:

```bash
netlify deploy --prod --dir=dist
```

The CLI uploads all files and provides the production URL upon completion.

### Client-Side Routing Configuration

Create a `client/public/_redirects` file to handle client-side routing:

```
/*    /index.html   200
```

This configuration redirects all requests to `index.html`, allowing React Router (Wouter) to handle routing client-side. The file is automatically copied to `dist/_redirects` during the build process.

### Custom Domain

In the Netlify dashboard, navigate to Site Settings → Domain Management. Click "Add custom domain" and enter your domain name. Netlify provides DNS configuration instructions. Update your domain's nameservers to point to Netlify's DNS servers, or add the required DNS records to your existing DNS provider. SSL certificates are automatically provisioned via Let's Encrypt.

---

## Self-Hosted Deployment

Self-hosting provides maximum control over infrastructure and is suitable for organizations with existing server infrastructure or specific compliance requirements.

### Prerequisites

A Linux server (Ubuntu 22.04 LTS recommended) with root or sudo access. Node.js 22.x or later installed on the server. A web server such as Nginx or Apache for serving static files. Optionally, a process manager like PM2 for running Node.js applications.

### Deployment Steps

#### Option 1: Static File Serving (Recommended)

Build the application on your development machine or CI/CD pipeline:

```bash
pnpm install
pnpm build
```

Transfer the `dist/` directory to your server using SCP, SFTP, or rsync:

```bash
rsync -avz dist/ user@server:/var/www/packaging-configurator/
```

Configure Nginx to serve the static files. Create a new site configuration at `/etc/nginx/sites-available/packaging-configurator`:

```nginx
server {
    listen 80;
    server_name configurator.yourcompany.com;
    root /var/www/packaging-configurator;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Client-side routing support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /models/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/packaging-configurator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option 2: Node.js Server

Install a simple static file server on the server:

```bash
npm install -g serve
```

Serve the `dist/` directory:

```bash
serve -s dist -l 3000
```

For production use, run the server as a systemd service or use PM2:

```bash
pm2 start "serve -s dist -l 3000" --name packaging-configurator
pm2 save
pm2 startup
```

### SSL Configuration

Install Certbot for Let's Encrypt SSL certificates:

```bash
sudo apt install certbot python3-certbot-nginx
```

Obtain and install a certificate:

```bash
sudo certbot --nginx -d configurator.yourcompany.com
```

Certbot automatically configures Nginx with SSL and sets up automatic certificate renewal.

---

## Docker Deployment

Docker containerization ensures consistent deployment across different environments and simplifies dependency management.

### Prerequisites

Docker 24.x or later installed on your deployment server. Docker Compose 2.x for multi-container orchestration (optional).

### Dockerfile

A production-ready Dockerfile is included in the project root. Review the configuration:

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration for Docker

Create `nginx.conf` in the project root:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Building and Running

Build the Docker image:

```bash
docker build -t packaging-configurator:latest .
```

Run the container:

```bash
docker run -d -p 80:80 --name packaging-configurator packaging-configurator:latest
```

The application is accessible at `http://localhost` or your server's IP address.

### Docker Compose

For easier management, use Docker Compose. Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Start the application:

```bash
docker-compose up -d
```

---

## AWS Deployment

Amazon Web Services offers multiple deployment options for static web applications.

### Option 1: S3 + CloudFront

This approach provides highly scalable, cost-effective hosting with global CDN distribution.

#### S3 Bucket Configuration

Create an S3 bucket in the AWS Console with a unique name (e.g., `packaging-configurator-prod`). Enable static website hosting in the bucket properties. Set the index document to `index.html` and error document to `index.html` for client-side routing support.

Configure bucket policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::packaging-configurator-prod/*"
    }
  ]
}
```

#### Upload Build Files

Build the application locally:

```bash
pnpm build
```

Upload the `dist/` directory contents to S3 using the AWS CLI:

```bash
aws s3 sync dist/ s3://packaging-configurator-prod/ --delete
```

The `--delete` flag removes files from S3 that no longer exist in the local build, ensuring clean deployments.

#### CloudFront Distribution

Create a CloudFront distribution in the AWS Console. Set the origin domain to your S3 bucket's website endpoint (not the bucket itself). Configure the default root object as `index.html`. Set up custom error responses to redirect 403 and 404 errors to `/index.html` with a 200 status code for client-side routing.

Enable HTTPS by requesting an SSL certificate through AWS Certificate Manager. Associate the certificate with your CloudFront distribution. Configure your custom domain's DNS to point to the CloudFront distribution domain name via a CNAME record.

### Option 2: Amplify Hosting

AWS Amplify provides a fully managed hosting solution with built-in CI/CD.

Connect your git repository to Amplify through the AWS Console. Amplify automatically detects the Vite framework and configures build settings. Customize the build specification if needed in the `amplify.yml` file:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Amplify builds and deploys the application automatically on every git push. Custom domains and SSL certificates are managed through the Amplify console.

---

## Environment Configuration

### Production Environment Variables

Configure these environment variables for production deployments:

```env
# Application Metadata
VITE_APP_TITLE="3D Packaging Configurator"
VITE_APP_LOGO="/assets/logo.png"

# Analytics (if using)
VITE_ANALYTICS_WEBSITE_ID="your-website-id"
VITE_ANALYTICS_ENDPOINT="https://analytics.yourcompany.com"

# Feature Flags
VITE_ENABLE_TEMPLATES=true
VITE_ENABLE_PRESETS=true
```

### Platform-Specific Configuration

**Vercel**: Set environment variables in Project Settings → Environment Variables. Choose the appropriate environment (Production, Preview, Development).

**Netlify**: Configure in Site Settings → Build & Deploy → Environment. Variables apply to all deployments unless scoped to specific contexts.

**Docker**: Pass environment variables using the `-e` flag or define them in `docker-compose.yml` under the `environment` key.

**Self-Hosted**: Create a `.env.production` file in the project root before building, or set system environment variables on the server.

---

## Post-Deployment Verification

### Functionality Checklist

After deployment, verify the following functionality to ensure the application operates correctly in the production environment.

Navigate to the deployed URL and confirm the homepage loads without errors. Check the browser console for JavaScript errors or failed network requests. Test package type selection by clicking each package option and verifying the 3D model loads correctly. Modify material properties (metalness, roughness, base color) and confirm changes apply to the 3D model in real-time.

Update label content including product name, description, and ingredients. Verify text appears correctly on the package model. Test the pop-out 3D viewer by clicking the "Pop-out 3D Viewer" button in Advanced Controls. Confirm a new window opens displaying the current package configuration. Toggle wrapper visibility and reference surface, ensuring both controls function as expected.

Test camera presets (Front, Back, Side, Angle) and verify the camera animates to the correct positions. Interact with the 3D model using mouse or touch controls to rotate, zoom, and pan. Verify smooth performance without lag or stuttering.

### Cross-Browser Testing

Test the application in multiple browsers to ensure compatibility. Chrome and Edge (Chromium-based browsers) should provide optimal performance and full feature support. Firefox should render correctly with comparable performance. Safari may exhibit minor visual differences but should remain fully functional. Mobile browsers on iOS and Android should support touch controls and render the 3D scene, though performance varies by device.

### Performance Metrics

Use browser developer tools to measure performance metrics. The initial page load should complete in under 3 seconds on a typical broadband connection. Time to Interactive should be under 5 seconds. The 3D viewport should maintain 60 FPS during camera movements and interactions. Total page weight should remain under 5 MB including all assets and 3D models.

---

## Troubleshooting

### Deployment Failures

**Build fails with "command not found: pnpm"**: Ensure pnpm is installed globally or use `npm install -g pnpm` before running build commands. Some platforms require explicit pnpm installation in build configuration.

**Build succeeds but site shows blank page**: Check browser console for errors. Verify that the base path in `vite.config.ts` matches your deployment path. Ensure all asset paths use relative URLs rather than absolute paths.

**404 errors on page refresh**: Configure server or platform to redirect all requests to `index.html` for client-side routing support. Add `_redirects` file for Netlify or configure `vercel.json` for Vercel.

### Runtime Issues

**3D models not loading**: Verify that the `models/` directory is included in the build output. Check network tab for 404 errors on model files. Ensure CORS headers allow loading resources from your domain.

**Environment variables not working**: Confirm variables are prefixed with `VITE_` and set in the correct environment (production vs. preview). Rebuild and redeploy after changing environment variables.

**Poor performance on production**: Enable gzip compression on your web server. Verify that asset caching headers are set correctly. Consider using a CDN for global distribution and reduced latency.

### SSL/HTTPS Issues

**Certificate errors**: Ensure SSL certificate is valid and not expired. Verify that DNS records point to the correct server or CDN. Check that certificate covers all required subdomains.

**Mixed content warnings**: Ensure all asset URLs use HTTPS or relative paths. Update any hardcoded HTTP URLs to HTTPS.

---

## Continuous Deployment

### GitHub Actions

Automate deployments using GitHub Actions. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

Configure repository secrets in GitHub Settings → Secrets and Variables → Actions.

---

## Rollback Procedures

### Vercel

Vercel maintains a deployment history accessible in the project dashboard. Click on any previous deployment and select "Promote to Production" to instantly rollback to that version. No rebuild is required as previous builds are preserved.

### Netlify

Navigate to the Deploys tab in the Netlify dashboard. Find the desired previous deployment and click "Publish deploy" to restore it as the current production version.

### Self-Hosted

Maintain versioned directories on your server:

```
/var/www/
├── packaging-configurator-v1.0.0/
├── packaging-configurator-v1.1.0/
└── packaging-configurator -> packaging-configurator-v1.1.0/  (symlink)
```

Rollback by updating the symlink to point to the previous version and reloading the web server.

---

## Monitoring and Analytics

### Error Tracking

Integrate error tracking services like Sentry to capture runtime errors in production. Add the Sentry SDK to your project:

```bash
pnpm add @sentry/react
```

Initialize Sentry in `client/src/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Usage Analytics

Implement privacy-respecting analytics using Plausible, Umami, or Google Analytics. Configure the analytics endpoint via environment variables:

```env
VITE_ANALYTICS_WEBSITE_ID="your-site-id"
VITE_ANALYTICS_ENDPOINT="https://analytics.yourcompany.com"
```

---

## Security Considerations

### Content Security Policy

Configure Content Security Policy headers to mitigate XSS attacks. For Nginx:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';";
```

Adjust the policy based on your specific requirements and third-party integrations.

### CORS Configuration

If your application loads resources from external domains, configure CORS headers appropriately. For self-hosted deployments, add to Nginx configuration:

```nginx
add_header Access-Control-Allow-Origin "https://yourcompany.com";
add_header Access-Control-Allow-Methods "GET, OPTIONS";
```

---

## Cost Estimates

### Vercel

The Hobby plan is free for personal projects with generous limits. The Pro plan costs $20/month per user and includes commercial use, increased bandwidth, and priority support.

### Netlify

The Starter plan is free with 100 GB bandwidth per month. The Pro plan costs $19/month with 400 GB bandwidth and additional features.

### AWS S3 + CloudFront

Costs vary based on traffic. Typical monthly costs for moderate traffic (10,000 visitors, 1 GB transfer):
- S3 storage: $0.50
- S3 requests: $0.10
- CloudFront data transfer: $1.00
- **Total: ~$2/month**

### Self-Hosted

Server costs depend on your hosting provider. A basic VPS (2 CPU, 2 GB RAM) costs $10-20/month from providers like DigitalOcean, Linode, or Vultr.

---

## Conclusion

Choose the deployment strategy that best aligns with your technical requirements, team expertise, and budget constraints. Vercel and Netlify offer the fastest time-to-deployment with minimal configuration. Self-hosted solutions provide maximum control and customization. Docker containerization ensures consistency across environments. AWS provides enterprise-grade scalability and integration with other AWS services.

For most use cases, starting with Vercel or Netlify for initial deployments and beta testing is recommended, with migration to self-hosted or AWS infrastructure as requirements evolve.

---

**For additional support or questions, consult your development team or infrastructure specialists.**
