#!/bin/bash
# EcoAlert Deployment Script
# This script automates the deployment of EcoAlert to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ecoalert"
DEPLOY_ENV=${1:-production}
BACKUP_DIR="/backups/${PROJECT_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]$(date +'%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date +'%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date +'%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR]$(date +'%Y-%m-%d %H:%M:%S') $1${NC}" >&2
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please do not run as root. Use sudo when necessary."
    exit 1
fi

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                DEPLOY_ENV="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                set -x
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help message
show_help() {
    cat << EOF
EcoAlert Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV    Target environment (default: production)
    -h, --help               Show this help message
    -v, --verbose            Enable verbose output
    --skip-backup            Skip database backup
    --skip-migrations        Skip database migrations
    --skip-build             Skip application build

Examples:
    $0                      # Deploy to production
    $0 -e staging            # Deploy to staging environment
    $0 --skip-backup        # Deploy without backup
EOF
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if required files exist
    if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
        log_error "package.json not found in ${PROJECT_ROOT}"
        exit 1
    fi
    
    if [ ! -f "${PROJECT_ROOT}/next.config.ts" ]; then
        log_error "next.config.ts not found in ${PROJECT_ROOT}"
        exit 1
    fi
    
    # Check if required directories exist
    if [ ! -d "${PROJECT_ROOT}/src" ]; then
        log_error "src directory not found in ${PROJECT_ROOT}"
        exit 1
    fi
    
    # Check environment-specific configuration
    case $DEPLOY_ENV in
        production|staging|development)
            log_info "Deploying to $DEPLOY_ENV environment"
            ;;
        *)
            log_error "Invalid environment: $DEPLOY_ENV"
            exit 1
            ;;
    esac
    
    # Check if required environment variables are set
    if [ "$DEPLOY_ENV" = "production" ]; then
        local required_vars=("DATABASE_URL" "REDIS_URL" "NEXTAUTH_URL" "JWT_SECRET")
        for var in "${required_vars[@]}"; do
            if [ -z "${!var}" ]; then
                log_error "Required environment variable $var is not set"
                exit 1
            fi
        done
    fi
    
    log_success "Pre-deployment checks passed"
}

# Backup database
backup_database() {
    if [ "$SKIP_BACKUP" = true ]; then
        log_warning "Skipping database backup as requested"
        return
    fi
    
    log_info "Creating database backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Get database configuration
    local db_host=$(echo "$DATABASE_URL" | sed -n 's|postgres://[^@]*@\(.*\):.*|\1|p')
    local db_port=$(echo "$DATABASE_URL" | sed -n 's|postgres://[^@]*@.*:\(.*\)/.*|\1|p')
    local db_name=$(echo "$DATABASE_URL" | sed -n 's|postgres://[^@]*@.*/\([^?]*\).*|\1|p')
    local db_user=$(echo "$DATABASE_URL" | sed -n 's|postgres://\([^:]*\):.*|\1|p')
    local db_password=$(echo "$DATABASE_URL" | sed -n 's|postgres://[^:]*:\([^@]*\)@.*|\1|p')
    
    # Create backup filename with timestamp
    local backup_file="${BACKUP_DIR}/${PROJECT_NAME}_${DEPLOY_ENV}_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Create backup
    if command -v pg_dump &> /dev/null; then
        pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" > "$backup_file"
        log_success "Database backup created: $backup_file"
    else
        log_warning "pg_dump not found, skipping database backup"
    fi
    
    # Compress backup
    gzip "$backup_file"
    log_success "Database backup compressed: ${backup_file}.gz"
    
    # Clean up old backups (keep last 30 days)
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
    log_info "Cleaned up old backups"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    cd "$PROJECT_ROOT"
    
    if [ -f "package-lock.json" ]; then
        npm ci --only=production
    else
        npm install --only=production
    fi
    
    if [ -f "yarn.lock" ]; then
        yarn install --production
    fi
    
    log_success "Dependencies installed"
}

# Build application
build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warning "Skipping application build as requested"
        return
    fi
    
    log_info "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment for build
    export NODE_ENV="$DEPLOY_ENV"
    
    # Build the application
    if [ -f "package.json" ]; then
        npm run build
    elif [ -f "yarn.lock" ]; then
        yarn build
    else
        log_error "No package.json or yarn.lock found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    if [ "$SKIP_MIGRATIONS" = true ]; then
        log_warning "Skipping database migrations as requested"
        return
    fi
    
    log_info "Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment for migrations
    export NODE_ENV="$DEPLOY_ENV"
    
    # Run migrations
    if [ -f "package.json" ]; then
        npx prisma migrate deploy
    elif [ -f "yarn.lock" ]; then
        yarn prisma migrate deploy
    else
        log_error "No package.json or yarn.lock found"
        exit 1
    fi
    
    # Seed database if needed
    if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
        log_info "Seeding database..."
        if [ -f "package.json" ]; then
            npx prisma db seed
        elif [ -f "yarn.lock" ]; then
            yarn prisma db seed
        fi
    fi
    
    log_success "Database migrations completed"
}

# Start application
start_application() {
    log_info "Starting application..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment for runtime
    export NODE_ENV="$DEPLOY_ENV"
    
    # Stop existing application
    if command -v pm2 &> /dev/null; then
        pm2 stop ecoalert || true
        pm2 delete ecoalert || true
    fi
    
    # Start application
    if [ -f "package.json" ]; then
        if [ "$DEPLOY_ENV" = "production" ]; then
            pm2 start npm --name ecoalert -- start
        else
            npm start
        fi
    elif [ -f "yarn.lock" ]; then
        if [ "$DEPLOY_ENV" = "production" ]; then
            pm2 start yarn --name ecoalert -- start
        else
            yarn start
        fi
    else
        log_error "No package.json or yarn.lock found"
        exit 1
    fi
    
    # Wait for application to start
    sleep 10
    
    log_success "Application started successfully"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "${NEXTAUTH_URL}/health" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check failed (attempt $attempt of $max_attempts), retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    # Clear cache
    if command -v redis-cli &> /dev/null; then
        redis-cli FLUSHDB || true
        log_success "Redis cache cleared"
    fi
    
    # Restart nginx if needed
    if command -v systemctl &> /dev/null && systemctl is-active --quiet nginx; then
        sudo systemctl reload nginx
        log_success "NGINX reloaded"
    fi
    
    # Run any custom post-deployment scripts
    if [ -f "${PROJECT_ROOT}/scripts/post-deploy.sh" ]; then
        log_info "Running custom post-deployment script..."
        bash "${PROJECT_ROOT}/scripts/post-deploy.sh"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    find "$PROJECT_ROOT" -name "*.tmp" -delete 2>/dev/null || true
    
    # Remove node_modules if build was successful
    if [ "$SKIP_BUILD" != true ] && [ -d "$PROJECT_ROOT/node_modules" ]; then
        log_info "Removing node_modules to save space"
        rm -rf "$PROJECT_ROOT/node_modules"
    fi
    
    log_success "Cleanup completed"
}

# Main deployment function
deploy() {
    log_info "Starting EcoAlert deployment to $DEPLOY_ENV environment"
    
    # Parse command line arguments
    parse_args "$@"
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Backup database
    backup_database
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application
    
    # Run database migrations
    run_migrations
    
    # Start application
    start_application
    
    # Verify deployment
    if verify_deployment; then
        log_success "Deployment completed successfully!"
    else
        log_error "Deployment verification failed"
        cleanup
        exit 1
    fi
    
    # Run post-deployment tasks
    post_deployment_tasks
    
    # Cleanup
    cleanup
    
    log_success "EcoAlert deployment completed successfully!"
}

# Handle script interruption
handle_interrupt() {
    log_error "Deployment interrupted by user"
    cleanup
    exit 1
}

# Set up signal handlers
trap handle_interrupt SIGINT SIGTERM

# Run deployment
deploy "$@"