# Lightweight: base on debian with tools installed via features
FROM mcr.microsoft.com/devcontainers/base:bookworm
# (Node is added via devcontainer feature)
# Optional: Deno + Supabase CLI. Use npx supabase for portability.
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*
# Install Deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh && \
echo 'export DENO_INSTALL="/root/.deno"' >> /root/.bashrc && \
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> /root/.bashrc