#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Create or update the CNAME file
echo "kycsync.com" > dist/CNAME

# Deploy to DigitalOcean App Platform (if using App Platform)
# doctl apps create --spec .do/app.yaml

# Or if you're using a Droplet, you can use rsync to deploy
# Replace YOUR_DROPLET_IP with your actual Droplet IP
# rsync -avz --delete dist/ root@YOUR_DROPLET_IP:/var/www/kycsync.com/

echo "Deployment complete!" 