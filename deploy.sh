#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Create or update the CNAME file
echo "kycsync.com" > dist/CNAME

# Replace these variables with your actual values
DROPLET_IP="YOUR_DROPLET_IP"
SSH_KEY="path/to/your/ssh/key"  # If using SSH key authentication

echo "Deploying to DigitalOcean Droplet..."

# Create the directory on the server if it doesn't exist
ssh -i $SSH_KEY root@$DROPLET_IP "mkdir -p /var/www/kycsync.com"

# Copy the built files to the server
rsync -avz --delete -e "ssh -i $SSH_KEY" dist/ root@$DROPLET_IP:/var/www/kycsync.com/

# Copy and set up Nginx configuration
scp -i $SSH_KEY nginx.conf root@$DROPLET_IP:/etc/nginx/sites-available/kycsync.com

# Create symbolic link if it doesn't exist
ssh -i $SSH_KEY root@$DROPLET_IP "ln -sf /etc/nginx/sites-available/kycsync.com /etc/nginx/sites-enabled/kycsync.com"

# Remove default Nginx configuration if it exists
ssh -i $SSH_KEY root@$DROPLET_IP "rm -f /etc/nginx/sites-enabled/default"

# Test Nginx configuration
ssh -i $SSH_KEY root@$DROPLET_IP "nginx -t"

# Reload Nginx to apply changes
ssh -i $SSH_KEY root@$DROPLET_IP "systemctl reload nginx"

echo "Deployment complete!" 