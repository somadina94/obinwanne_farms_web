#!/bin/bash
set -euo pipefail

# Docker Deployment Script for Obinwanne Farms Web
# Run this script on your EC2 instance

echo "🐳 Starting Docker deployment of Obinwanne Farms Web..."

REPO_URL="https://github.com/somadina94/obinwanne_farms_web.git"

sync_code() {
    if [ -d .git ] && git remote get-url origin 2>/dev/null | grep -qi "obinwanne_farms_web"; then
        echo "📥 Fetching latest code..."
        git fetch --all --prune

        local branch="${DEPLOY_BRANCH:-}"
        if [ -z "$branch" ]; then
            branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || true)
        fi
        if [ -z "$branch" ]; then
            branch=$(git branch -r | grep -E 'origin/(main|master)' | head -1 | sed 's@origin/@@' | xargs)
        fi
        if [ -z "$branch" ]; then
            echo "❌ Could not determine branch to deploy"
            exit 1
        fi

        if ! git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
            echo "❌ Branch origin/${branch} not found"
            git branch -r
            exit 1
        fi

        echo "✅ Syncing to origin/${branch}..."
        git checkout "$branch" 2>/dev/null || git checkout -b "$branch" "origin/${branch}"
        git reset --hard "origin/${branch}"
        return
    fi

    echo "📥 Cloning obinwanne_farms_web (wrong or missing repo detected)..."
    local dir parent name
    dir="$(pwd)"
    parent="$(dirname "$dir")"
    name="$(basename "$dir")"
    local env_backup=""
    local logs_backup=""
    [ -f .env ] && env_backup="$(mktemp)" && cp .env "$env_backup"
    [ -d logs ] && logs_backup="$(mktemp -d)" && cp -a logs/. "$logs_backup/" 2>/dev/null || true

    cd "$parent"
    rm -rf "$name"
    git clone "$REPO_URL" "$name"
    cd "$name"

    local branch="${DEPLOY_BRANCH:-main}"
    if git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
        git checkout "$branch" 2>/dev/null || git checkout -b "$branch" "origin/${branch}"
        git reset --hard "origin/${branch}"
    fi

    [ -n "$env_backup" ] && [ -s "$env_backup" ] && cp "$env_backup" .env && rm -f "$env_backup"
    [ -n "$logs_backup" ] && mkdir -p logs && cp -a "$logs_backup/." logs/ && rm -rf "$logs_backup"
}

sync_code

# Check Docker installation
echo "✅ Checking Docker installation..."
docker --version

# Check for docker-compose or docker compose (newer versions use 'docker compose')
if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose found"
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    echo "✅ docker compose found"
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Neither docker-compose nor docker compose found"
    echo "📥 Installing docker-compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    DOCKER_COMPOSE="docker-compose"
fi

# Add user to docker group to avoid permission issues
if ! groups $USER | grep -q docker; then
    echo "🔧 Adding user to docker group..."
    sudo usermod -aG docker $USER
    echo "⚠️  Please log out and log back in, or run: newgrp docker"
    echo "   Then run this script again."
    exit 1
fi

# Check for environment variables
echo "🔍 Checking for environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "📤 Exporting environment variables..."
    export $(cat .env | xargs)
    echo "✅ Environment variables exported"
elif [ -f ".env.local" ]; then
    echo "✅ .env.local file found, copying to .env..."
    cp .env.local .env
    echo "📤 Exporting environment variables..."
    export $(cat .env | xargs)
    echo "✅ Environment variables exported"
else
    echo "⚠️  No .env or .env.local file found"
    echo "📝 You may need to create .env with your environment variables"
    echo "   Example: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_COMPANY_ADDRESS, etc."
    exit 1
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Stop and remove existing containers and local images
echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE down --rmi local --remove-orphans

# Remove ALL build cache (not just unused) to fix corrupted BuildKit layer refs
echo "🧹 Clearing all Docker build cache..."
docker buildx prune -af
docker builder prune -af

# Use isolated buildx driver (BuildKit stays on; avoids Docker 29 host layer corruption)
echo "🔧 Preparing buildx builder..."
BUILDX_BUILDER="obinwanne-farms-buildx"
docker buildx rm "${BUILDX_BUILDER}" 2>/dev/null || true
docker buildx create --name "${BUILDX_BUILDER}" --driver docker-container --use
docker buildx inspect --bootstrap

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_MAX_PARALLELISM=1

# Build and start the application
echo "🔨 Building and starting the application..."
echo "🔍 Verifying environment variables are available..."
echo "NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:0:20}..."
$DOCKER_COMPOSE build --no-cache --pull
$DOCKER_COMPOSE up -d --force-recreate

# Check if the container is running
echo "📊 Checking container status..."
sleep 5
$DOCKER_COMPOSE ps

if ! $DOCKER_COMPOSE ps --status running | grep -q "web"; then
    echo "❌ Deployment failed: web container is not running"
    echo "📋 Recent logs:"
    $DOCKER_COMPOSE logs --tail=50
    exit 1
fi

# Show logs
echo "📋 Recent logs:"
$DOCKER_COMPOSE logs --tail=20

echo "✅ Docker deployment completed!"
echo "📊 Check status with: $DOCKER_COMPOSE ps"
echo "📋 View logs with: $DOCKER_COMPOSE logs -f"
echo "🔄 Restart with: $DOCKER_COMPOSE restart"
echo "🛑 Stop with: $DOCKER_COMPOSE down"
