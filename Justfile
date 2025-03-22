set shell := ["zsh", "-cu"]
set dotenv-load := true

# View this help message
default:
  @just --list


# REMOTE
# Login to AWS
login *flags='--profile kaius-admin':
    # If no flags are provided, do not log-in
    if [ -n "{{flags}}" ]; then aws sso login {{flags}}; fi

# Logout from AWS
logout *flags='--profile kaius-admin':
    # If no flags are provided, do not log-in
    if [ -n "{{flags}}" ]; then aws sso logout {{flags}}; fi


# STATUS
# Check that the user is logged in
ensure-login *flags='--profile kaius-admin':
    # Check if the user is logged in
    # If no flags are provided, do not check
    if [ -n "{{flags}}" ]; then aws sts get-caller-identity {{flags}} > /dev/null; fi


# ENVIRONMENT VARIABLES
# Setup shared variables
env *flags='--profile kaius-admin': (ensure-login flags)
    # Copy .env from AWS Secrets Manager
    aws secretsmanager get-secret-value \
      --secret-id .env \
      --query SecretString \
      --output text \
      {{flags}} \
        > .env
    # Copy .env to packages/ui\server
    cp .env ./packages/ui
    cp .env ./packages/server


# DEPLOYMENT
deploy *flags='--profile kaius-admin':
    cd ./packages/ui
    sh ./scripts/deploy.sh {{flags}}